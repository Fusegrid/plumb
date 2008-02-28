Plumb.Recognition = {
  recognize: function() {
    var shapes = Plumb.Layout.shapes().map(function(shape) {
      return Object.extend(shape.getMeasurements(), { stretchy: shape.hasClassName('stretchy') });
    });
    
    return this.buildContainer(shapes);
  },
  
  buildContainer: function(shapes, type) {
    var container = {};
    container.root = Object.isUndefined(type);
    container.type = type || 'rows';
    container.children = [];
    
    var originalShapesLength = shapes.length;
    var section;
    
    while (shapes.length > 0) {
      section = this.accumulateShapes(shapes, container.type);
      shapes = shapes.without.apply(shapes, section);
      
      if (section.length > 1 && section.length == originalShapesLength) {
        shapes = section;
        section = this.accumulateShapes(shapes, container.type == 'rows' ? 'columns' : 'rows');
        
        if (section.length > 1 && section.length == originalShapesLength)
          throw Plumb.UnsupportedLayout;
        
        shapes = shapes.without.apply(shapes, section);
        container.type = container.type == 'rows' ? 'columns' : 'rows';
      }
      
      if (section.length == 1)
        container.children.push(section[0]);
      else
        container.children.push(this.buildContainer(section, container.type == 'rows' ? 'columns' : 'rows'));
    }
    
    container.children = this.sortShapes(container.children, container.type);
    
    container.left = container.children.min(function(c) { return c.left; });
    container.top = container.children.min(function(c) { return c.top; });
    container.right = container.children.max(function(c) { return c.right; });
    container.bottom = container.children.max(function(c) { return c.bottom; });
    
    container.height = container.bottom - container.top;
    container.width = container.right - container.left + 1;
    
    
    // Calculate append and prepend
    if (container.root) {
      container.prepend = container.left;
      container.append = Plumb.Layout.getMeasurements().width - (container.right + 1);
    }
    
    if (container.type == "columns") {
      container.children.each(function(c, i) {
        if (i == 0 && c.left > container.left)
          c.prepend = c.left - container.left;
        else if (i > 0 && c.left > container.children[i - 1].right + 1)
          c.prepend = c.left - (container.children[i - 1].right + 1);
        else
          c.prepend = 0;
        
        // For columns, we append space only on the last column, every
        // other columns use only prepending.
        if (i == container.children.length - 1 && c.right < container.right)
          c.append = container.right - c.right;
        else
          c.append = 0;
      });
    } else {
      container.children.each(function(c, i) {
        if (c.left > container.left)
          c.prepend = c.left - container.left;
        else
          c.prepend = 0;
          
        if (c.right < container.right)
          c.append = container.right - c.right;
        else
          c.append = 0;
      });
    }
    
    
    // This container is stretchy if any of its children are.
    container.stretchy = container.children.any(function(c) { return c.stretchy; });
    
    // If the root container is stretchy, it has a width of 100% minus
    // the prepend and append spacing
    if (container.stretchy && container.root)
      container.width = { percentage: 100, subtrahend: container.prepend + container.append };
    
    // If this container contains columns and any of its children are
    // stretchy, the stretchy childrens' widths are measured by taking
    // subtracting some amount from some percentage of the container's
    // width.
    //
    //   percentage: (child width / total stretchy width)
    //   subtrahend:
    //     (total fixed width + total spacing width) *
    //     (child width / total stretchy width)
    //
    // Here, the fixed values use the column as a unit. (Rather than,
    // say, pixels.) In this part of the program, we're assuming a
    // browser that can specify box widths by using an expression like
    // this. I read somewhere that something like that might be part of
    // CSS3 at some point, but for now it's faked w/ trickery later on.
    if (container.stretchy && container.type == 'columns') {
      var stretchyWidth = container.children.inject(0, function(sum, c) { return sum + (c.stretchy ? c.width : 0); });
      var fixedWidth = container.children.inject(0, function(sum, c) { return sum + (c.stretchy ? 0 : c.width); });
      var spacingWidth = container.children.inject(0, function(sum, c) { return sum + c.prepend + c.append; });
      
      container.children = container.children.each(function(c) {
        if (c.stretchy)
          c.width = {
            'percentage': Math.floor((c.width / stretchyWidth) * 100),
            'subtrahend': (fixedWidth + spacingWidth) * (c.width / stretchyWidth)
          };
      });
    }
    
    // If this container contains rows and any of its children are
    // stretchy, the stretchy children have a width of 100% minus their
    // prepend and append spacing.
    if (container.stretchy && container.type == 'rows') {
      container.children = container.children.each(function(c) {
        if (c.stretchy) c.width = {
          percentage: 100,
          subtrahend: c.prepend + c.append
        }
      });
    }
    
    return container;
  },

  // Given a list of shapes, find all the shapes in the same row or
  // column as the first shape in the list, and, as we accumulate
  // shapes, widen the search area. For example:
  //
  //   +-----+
  //   |  A  |  +-----+
  //   +-----+  |     |
  //            |  C  |
  //   +-----+  |     |
  //   |  B  |  +-----+
  //   +-----+
  //
  // Given the list [ A, B, C ] and the directive to accumulate a row
  // of shapes, we'd accumulate A, B, and C, even though initially the
  // only shape in the "same row" as A is C.
  accumulateShapes: function(L, type) {
    var test = this.tests[type];
  
    var A = [L[0]];
    var T = L.without(L[0]);
  
    var S = T[0];
    var m;
  
    while (S) {
      m = false;
    
      A.each(function(s) {
        if (S != s && test(S, s)) {
          m = S;
          throw $break;
        }
      });
    
      if (m) {
        A.push(m);
        T = T.without(m);
        S = T[0];
      } else {
        S = T[T.indexOf(S) + 1];
      }
    }
  
    return this.sortShapes(A, type);
  },
  
  sortShapes: function(shapes, type) {
    if (type == 'rows') {
      return shapes.sort(function(a, b) {
        if (a.top < b.top) return -1;
        else if (a.top > b.top) return 1;
        else if (a.left < b.left) return -1;
        else if (a.left > b.left) return 1;
        else return 0;
      });
    } else if (type == 'columns') {
      return shapes.sort(function(a, b) {
        if (a.left < b.left) return -1;
        else if (a.left > b.left) return 1;
        else if (a.top < b.top) return -1;
        else if (a.top > b.top) return 1;
        else return 0;
      });
    }
  },

  tests: {
    rows: function(shape, another) {
      return (shape.top >= another.top && shape.top <= another.bottom) ||
             (shape.bottom >= another.top && shape.bottom <= another.bottom) ||
             (shape.top <= another.top && shape.bottom >= another.bottom);
    },
  
    columns: function(shape, another) {
      return (shape.left >= another.left && shape.left <= another.right) ||
             (shape.right >= another.left && shape.right <= another.right) ||
             (shape.left <= another.left && shape.right >= another.right);
    }
  }
}

Plumb.UnsupportedLayout = new Error();
Plumb.UnsupportedLayout.name = "UnsupportedLayout";