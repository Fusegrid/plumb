Plumb.Layout = {
  setup: function() {
    Plumb.element.observe('mousedown', function(event) {
      Plumb.Selection.clear();
      
      if (Plumb.mode == "draw")
        Plumb.Creation.start(event);
    });
  },
  
  getWidth: function() {
    return Plumb.shapes().max(function(shape) {
      return shape.getMeasurements().right;
    });
  }
}