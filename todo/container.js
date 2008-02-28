var Container = Class.create({
  initialize: function(shapes, type) {
    this.type = type || 'rows';
    shapes = $A(shapes);
    var originalShapesLength = shapes.length;
    var section;
    this.children = [];
    
    while (shapes.length > 0) {
      section = Container.accumulateShapes(shapes, this.type);
      shapes = shapes.without.apply(shapes, section);
      
      if (section.length > 1 && section.length == originalShapesLength) {
        shapes = section;
        section = Container.accumulateShapes(shapes, this.type == 'rows' ? 'columns' : 'rows');
        
        if (section.length > 1 && section.length == originalShapesLength)
          throw UnsupportedLayout;
        
        shapes = shapes.without.apply(shapes, section);
        this.type = this.type == 'rows' ? 'columns' : 'rows';
      }
      
      if (section.length == 1)
        this.children.push(section[0]);
      else
        this.children.push(new Container(section, this.type == 'rows' ? 'columns' : 'rows'));
    }
    
    this.left = this.children.min(function(c) { return c.left; });
    this.top = this.children.min(function(c) { return c.top; });
    this.right = this.children.max(function(c) { return c.right; });
    this.bottom = this.children.max(function(c) { return c.bottom; });
    
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    
    this.children = Container.sortShapes(this.children, this.type);
  }
});

Container.sortShapes = function(shapes, type) {
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
}

Container.accumulateShapes = function(L, type) {
  var test = Container.tests[type];
  
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
  
  return Container.sortShapes(A, type);
}

Container.tests = {
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

var UnsupportedLayout = new Error();
UnsupportedLayout.name = "UnsupportedLayout";