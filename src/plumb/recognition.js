Plumb.Recognition = {
  getShapes: function() {
    return Plumb.Layout.shapes().map(function(shape) {
      return shape.getMeasurements();
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
    
    var originalShapesLength = shapes.length;
    var section;
    
    while (shapes.length > 0) {
      section = this.accumulateShapes(shapes, container.type);
      shapes = shapes.without.apply(shapes, section);
      
      if (section.length > 1 && section.length == originalShapesLength) {
        shapes = section;
        section = this.accumulateShapes(shapes, container.type == 'rows' ? 'columns' : 'rows');
        
        if (section.length > 1 && section.length == originalShapesLength) {
          if (this.detectOverlap(section))
            throw Plumb.Overlap;
          else
            throw Plumb.UnsupportedLayout;
        }
        
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
    
    if (container.root) {
      container.left = 0;
      container.right = Plumb.Layout.getMeasurements().width - 1;
    }
    
    container.height = container.bottom - container.top;
    container.width = container.right - container.left + 1;
    
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
    
    return container;
  },
  
  detectOverlap: function(shapes) {
    for (var i = 0; i < shapes.length; i += 1) {
      for (var j = 0; j < shapes.length; j += 1) {
        if (i != j) {
          if (shapes[i].right > shapes[j].left && shapes[i].left < shapes[j].right &&
              shapes[i].bottom > shapes[j].top && shapes[i].top < shapes[j].bottom)
                return true;
        }
      }
    }
    
    return false;
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
      return (shape.top >= another.top && shape.top < another.bottom) ||
             (shape.bottom > another.top && shape.bottom <= another.bottom) ||
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

Plumb.Overlap = new Error("Couldn't subdivide rows and columns (overlap)");
Plumb.Overlap.name = "Overlap";
