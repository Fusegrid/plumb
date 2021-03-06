Plumb.Resizing = {
  HANDLE_TYPES: $w("tl tr bl br t r b l"),
  
  RULES: {
    t: function(measurements, handle) {
      var adjusted = {};
      var MIN = Plumb.Shape.MIN_HEIGHT;
    
      adjusted.top = handle.top;
      adjusted.height = (measurements.top + measurements.height) - handle.top;
        
      if (adjusted.top < 0) {
        adjusted.height += adjusted.top;
        adjusted.top = 0;
      }
    
      if (adjusted.height < MIN) {
        adjusted.top = (measurements.top + measurements.height) - MIN;
        adjusted.height = MIN;
      }
    
      return adjusted;
    },
    
    b: function(measurements, handle) {
      var adjusted = {};
      var MIN = Plumb.Shape.MIN_HEIGHT;
      
      adjusted.height = handle.top - measurements.top;
    
      if (adjusted.height < MIN)
        adjusted.height = MIN;
    
      return adjusted;
    },
    
    l: function(measurements, handle) {
      var adjusted = {};
      
      adjusted.left = handle.left;
      
      if (adjusted.left < 0)
        adjusted.left = 0;
        
      adjusted.width = (measurements.left + measurements.width) - adjusted.left;
      
      if (adjusted.width < 1) {
        adjusted.left = measurements.left - measurements.width;
        adjusted.width = 0;
      }
    
      return adjusted;
    },
    
    r: function(measurements, handle) {
      var adjusted = {};
      
      adjusted.width = handle.left - measurements.left + 1;
      
      if (adjusted.width < 1)
        adjusted.width = 1;
    
      return adjusted;
    }
  },
  
  setup: function() {
    Event.observe(Plumb.element, 'mousemove', function(e) { this.drag(e); }.bind(this));
    Event.observe(Plumb.element, 'mouseup', function(e) { this.finish(e); }.bind(this));
  },
  
  start: function(event) {
    this.begin(event.element());
    event.stop();
  },
  
  begin: function(handle) {
    this.resizing = true;
    this.shape = handle.up(".shape");
    this.measurements = this.shape.getMeasurements();
    
    this.type = handle.classNames().detect(function(n) {
      return this.HANDLE_TYPES.include(n);
    }.bind(this));
    
    Plumb.Selection.set(this.shape);
  },

  drag: function(event) {
    if (this.resizing) {
      var handle = {
        left: Plumb.Column.fromEvent(event),
        top: event.pointerY()
      }
      
      this.type.split("").each(function(component) {
        Object.extend(this.measurements, this.RULES[component](this.measurements, handle));
      }.bind(this));
      
      this.shape.setMeasurements(this.measurements);
      
      event.stop();
    }
  },

  finish: function(event) {
    this.resizing = false;
    Plumb.fire("plumb:finishedresizing");
  }
}