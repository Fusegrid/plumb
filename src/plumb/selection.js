Plumb.Selection = {
  selection: [],
  
  any: function(iterator) {
    return this.selection.any(iterator);
  },
  
  all: function(iterator) {
    return this.selection.all(iterator);
  },
  
  invoke: function() {
    this.selection.invoke.apply(this.selection, arguments);
  },
  
  include: function(shape) {
    return this.selection.include(shape);
  },
  
  each: function(iterator) {
    this.selection.each(iterator);
  },
  
  count: function() {
    return this.selection.length;
  },
  
  set: function(shape) {
    this.clear();
    this.selection = [shape];
    shape.select(".handle").invoke("show");
    Plumb.Layout.fire("plumb:selectionchanged");
  },
  
  add: function(shape) {
    this.selection.push(shape);
    shape.select(".handle").invoke("show");
    Plumb.Layout.fire("plumb:selectionchanged");
  },
  
  remove: function(shape) {
    this.selection = this.selection.without(shape);
    shape.select(".handle").invoke("hide");
    Plumb.Layout.fire("plumb:selectionchanged");
  },
  
  toggle: function(shape) {
    if (this.include(shape))
      this.remove(shape);
    else
      this.add(shape);
  },
  
  clear: function() {
    this.selection.each(function(shape) {
      shape.select(".handle").invoke("hide");
    });
    this.selection = [];
    Plumb.Layout.fire("plumb:selectionchanged");
  },
  
  destroyAll: function() {
    this.selection.each(function(shape) {
      shape.remove();
    });
    this.selection = [];
    Plumb.Layout.fire("plumb:selectionchanged");
  }
}