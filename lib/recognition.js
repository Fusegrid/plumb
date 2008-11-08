Plumb.Recognition = {
  getShapes: function() {
    return Plumb.Layout.shapes().map(function(shape) {
      return Object.extend(shape.getMeasurements(), { stretchy: shape.hasClassName('stretchy') });
    });
  },
  
  recognize: function(shapes) {
    this.index = 0;
    return this.buildContainer(shapes || this.getShapes());
  },
  
  buildContainer: function(shapes, type) {
    var container = {};
    container.root = Object.isUndefined(type);
    container.type = type || 'rows';
    container.children = [];
    
    container.id = (this.index++).toLetters();
    
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
      
      if (section.length == 1) {
        section[0].id = (this.index++).toLetters();
        container.children.push(section[0]);
      } else
        container.children.push(this.buildContainer(section, container.type == 'rows' ? 'columns' : 'rows'));
    }
    
    container.children = this.sortShapes(container.children, container.type);
    
    container.left = container.children.min(function(c) { return c.left; });
    container.top = container.children.min(function(c) { return c.top; });
    container.right = container.children.max(function(c) { return c.right; });
    container.bottom = container.children.max(function(c) { return c.bottom; });
    
    if (container.root) {
      container.left = 0;
      container.right = Plumb.Layout.getMeasurements().width - 1;
    }
    
    container.height = container.bottom - container.top;
    container.width = container.right - container.left + 1;
    
    
    // This container is stretchy if any of its children are.
    container.stretchy = container.children.any(function(c) { return c.stretchy; });
    
    // If this container contains columns, the stretchy children's
    // widths are equal to the percentage of stretchy width
    // they occupy:
    //
    //   child width / total stretchy width
    //
    if (container.stretchy && container.type == 'columns') {
      var stretchyWidth = container.children.inject(0, function(sum, c) { return sum + (c.stretchy ? c.width : 0); });
      
      container.children.each(function(c) {
        if (c.stretchy)
          c.width = c.width / stretchyWidth;
      });
    }
    
    // If this container contains rows, its stretchy children's
    // widths are 100%.
    if (container.stretchy && container.type == 'rows') {
      container.children.each(function(c) {
        if (c.stretchy)
          c.width = 1;
      });
    }
    
    // If the root container is stretchy, it has a width of 100%.
    if (container.stretchy && container.root)
      container.width = 1;
      
    
    // Add append and prepend boxes
    
    if (container.type == "rows") {
      var children = [];
      
      container.children.each(function(c, i) {
        var prepend, append;
      
        if (c.left > container.left)
          prepend = c.left - container.left;
        else
          prepend = 0;
          
        if (c.right < container.right)
          append = container.right - c.right;
        else
          append = 0;
        
        if (prepend > 0 || append > 0) {
          var child = {
            type: "columns",
            left: container.left,
            right: container.right,
            top: c.top,
            bottom: c.bottom,
            height: c.bottom - c.top,
            width: c.stretchy ? 1 : container.width,
            children: [],
            stretchy: container.stretchy
          }
          
          if (prepend > 0)
            child.children.push({ type: "spacing", width: prepend, stretchy: false, id: c.id + "-prepend" });
          
          if (c.type == "columns") {
            child.id = c.id;
            child.children = child.children.concat(c.children);
          } else {
            child.id = (this.index++).toLetters();
            child.children.push(c);
          }
          
          if (append > 0)
            child.children.push({ type: "spacing", width: append, stretchy: false, id: c.id + "-append" });
          
          children.push(child);
          
        } else {
          children.push(c);
        }
      }.bind(this));
      
      container.children = children;
      
    } else {
      var children = [];
    
      container.children.each(function(c, i) {
        var prepend, append;
        
        if (i == 0 && c.left > container.left)
          prepend = c.left - container.left;
        else if (i > 0 && c.left > container.children[i - 1].right + 1)
          prepend = c.left - (container.children[i - 1].right + 1);
        else
          prepend = 0;
        
        if (prepend > 0)
          children.push({ type: "spacing", width: prepend, stretchy: false, id: c.id + "-prepend" });
        
        children.push(c);
        
        // For columns, we append space only on the last column, every
        // other columns use only prepending.
        if (i == container.children.length - 1 && c.right < container.right)
          append = container.right - c.right;
        else
          append = 0;
        
        if (append > 0)
          children.push({ type: "spacing", width: append, stretchy: false, id: c.id + "-append" });
      }.bind(this));
      
      container.children = children;
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

Plumb.UnsupportedLayout = new Error("Couldn't subdivide rows and columns (layout is unsupported)");
Plumb.UnsupportedLayout.name = "UnsupportedLayout";