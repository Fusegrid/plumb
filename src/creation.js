Plumb.Creation = {
  setup: function() {
    Event.observe(window, 'mousemove', function(e) { Plumb.Creation.drag(e); });
    Event.observe(window, 'mouseup', function(e) { Plumb.Creation.finish(e); });
  },
  
  start: function(event) {
    var L = Plumb.Layout.getMeasurements();
    
    var pointer = event.pointer();
    
    this.layoutOffset = {
      left: L.left,
      top: L.top
    };
    
    this.origin = {
      left: pointer.x - this.layoutOffset.left,
      top: pointer.y - this.layoutOffset.top
    };
      
    event.stop();
  },
  
  drag: function(event) {
    if (this.origin) {
      var pointer = event.pointer();
      
      var pointerOffsetInLayout = {
        left: pointer.x - this.layoutOffset.left,
        top: pointer.y - this.layoutOffset.top
      };
      
      if (pointerOffsetInLayout.left > this.origin.left && pointerOffsetInLayout.top >= this.origin.top + Plumb.Shape.MIN_HEIGHT)
        this.create('br');
      else if (pointerOffsetInLayout.left < this.origin.left && pointerOffsetInLayout.top >= this.origin.top + Plumb.Shape.MIN_HEIGHT)
        this.create('bl');
      else if (pointerOffsetInLayout.left < this.origin.left && pointerOffsetInLayout.top <= this.origin.top - Plumb.Shape.MIN_HEIGHT)
        this.create('tl');
      else if (pointerOffsetInLayout.left > this.origin.left && pointerOffsetInLayout.top <= this.origin.top - Plumb.Shape.MIN_HEIGHT)
        this.create('tr');
    }
    
    event.stop();
  },
  
  create: function(type) {
    var C = Plumb.Column.getMeasurements();
    
    // Always put the shape either in the column we started dragging in, or if
    // starting from a margin, in the column we started dragging into.
    var measurements = {
      left: Math.floor(this.origin.left / (C.width + C.margin)),
      top: this.origin.top,
      width: 1,
      height: Plumb.Shape.MIN_HEIGHT
    }
    
    // If we started in the margin and are dragging right, move this shape
    // right a column.
    if (this.origin.left > ((measurements.left * (C.width + C.margin)) + C.width) &&
        this.origin.left < (measurements.left * (C.width + C.margin)) + C.width + C.margin &&
        type.include('r'))
          measurements.left += 1;
    
    // If we're dragging up, move the shape up to compensate for the initial
    // height.
    if (type.include('t'))
      measurements.top -= measurements.height;
      
    // Okay, create the shape.
    var shape = Plumb.Shape.create(measurements);
    
    // Select the shape
    Plumb.Selection.set(shape);
    
    // Start resizing!
    var handle = shape.down("." + type);
    Plumb.Resizing.begin(handle);
    
    this.origin = null;
  },
  
  finish: function(event) {
    this.origin = null;
  }
}