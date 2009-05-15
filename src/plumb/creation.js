Plumb.Creation = {
  setup: function() {
    Event.observe(Plumb.element, 'mousemove', function(e) { Plumb.Creation.drag(e); });
    Event.observe(Plumb.element, 'mouseup', function(e) { Plumb.Creation.finish(e); });
  },
  
  start: function(event) {
    this.origin = event.pointer();
    event.stop();
  },
  
  drag: function(event) {
    if (this.origin) {
      var pointer = event.pointer();
      
      if (pointer.x > this.origin.x && pointer.y >= this.origin.y + Plumb.Shape.MIN_HEIGHT)
        this.create('br');
      else if (pointer.x < this.origin.x && pointer.y >= this.origin.y + Plumb.Shape.MIN_HEIGHT)
        this.create('bl');
      else if (pointer.x < this.origin.x && pointer.y <= this.origin.y - Plumb.Shape.MIN_HEIGHT)
        this.create('tl');
      else if (pointer.x > this.origin.x && pointer.y <= this.origin.y - Plumb.Shape.MIN_HEIGHT)
        this.create('tr');
    }
    
    event.stop();
  },
  
  create: function(type) {
    // Always put the shape either in the column we started dragging in, or if
    // starting from a margin, in the column we started dragging into.
    var measurements = {
      left: Math.floor(this.origin.x / (Plumb.WIDTH + Plumb.MARGIN)),
      top: this.origin.y,
      width: 1,
      height: Plumb.Shape.MIN_HEIGHT
    }
    
    // If we started in the margin and are dragging right, move this shape
    // right a column.
    if (this.origin.x > ((measurements.left * (Plumb.WIDTH + Plumb.MARGIN)) + Plumb.WIDTH) &&
        this.origin.x < (measurements.left * (Plumb.WIDTH + Plumb.MARGIN)) + Plumb.WIDTH + Plumb.MARGIN &&
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
