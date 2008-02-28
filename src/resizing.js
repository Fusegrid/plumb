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
      var L = Plumb.Layout.getMeasurements();
      
      adjusted.height = handle.top - measurements.top;
      
      if (measurements.top + adjusted.height > L.height)
        adjusted.height = L.height - measurements.top;
    
      if (adjusted.height < MIN)
        adjusted.height = MIN;
    
      return adjusted;
    },
    
    l: function(measurements, handle) {
      var adjusted = {};
      var C = Plumb.Column.getMeasurements();
      
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
      
    // l: function(measurements, handle) {
    //   var adjusted = { };
    //   var C = Plumb.Column.getMeasurements();
    //   
    //   adjusted.left = (Math.floor((handle.left - C.margin) / (C.width + C.margin)) * (C.width + C.margin)) + C.margin;
    //   
    //   // If the handle is being dragged left and we're not over the
    //   // margin yet, correct our adjustment by one column.
    //   if (handle.left < measurements.left && (((handle.left - C.margin) % (C.margin + C.width)) > C.width))
    //     adjusted.left += C.margin + C.width;
    //   
    //   // Don't allow the shape to be resized off the layout
    //   if (adjusted.left < C.margin)
    //     adjusted.left = C.margin;
    //       
    //   adjusted.width = (measurements.left + measurements.width) - adjusted.left;
    //   
    //   // Enforce bound on left edge
    //   if (adjusted.width < C.width) {
    //     adjusted.left = (measurements.left + measurements.width) - C.width;
    //     adjusted.width = C.width;
    //   }
    //   
    //   return adjusted;
    // },
    
    r: function(measurements, handle) {
      var adjusted = {};
      var C = Plumb.Column.getMeasurements();
      var L = Plumb.Layout.getMeasurements();
      
      adjusted.width = handle.left - measurements.left + 1;
      
      if (adjusted.width < 1)
        adjusted.width = 1;
        
      if (measurements.left + adjusted.width >= L.width)
        adjusted.width = L.width - measurements.left;
    
      return adjusted;
    }
    
    
    // r: function(measurements, handle) {
    //   var adjusted = { };
    //   var C = Plumb.Column.getMeasurements();
    // 
    //   adjusted.width = handle.left - measurements.left;
    // 
    //   if (adjusted.width < C.width)
    //     adjusted.width = C.width;
    // 
    //   adjusted.width = (Math.ceil((adjusted.width + C.margin) / (C.width + C.margin)) * (C.width + C.margin)) - C.margin;
    //   
    //   // If the handle is being dragged right and we're not over the
    //   // margin yet, correct our adjustment by one column.
    //   if ((handle.left > measurements.left + measurements.width) && (((handle.left - C.margin) % (C.margin + W)) > C.width))
    //     adjusted.width -= C.margin + C.width;
    //   
    //   // Enforce bound on right edge
    //   if ((measurements.left + adjusted.width) > ((C.margin + C.width) * Plumb.Layout.columns)) {
    //     adjusted.width = ((C.margin + C.width) * Plumb.Layout.columns) - measurements.left;
    //   }
    // 
    //   return adjusted;
    // }
  },
  
  setup: function() {
    Event.observe(window, 'mousemove', function(e) { this.drag(e); }.bind(this));
    Event.observe(window, 'mouseup', function(e) { this.finish(e); }.bind(this));
  },
  
  start: function(event) {
    this.begin(event.element());
    event.stop();
  },
  
  // begin: function(handle, pointer) {
    
  begin: function(handle) {
    var L = Plumb.Layout.getMeasurements();
    
    this.resizing = true;
    this.shape = handle.up(".shape");
    this.measurements = this.shape.getMeasurements();
    
    this.layoutOffset = {
      left: L.left,
      top: L.top
    };
    
    this.type = handle.classNames().detect(function(n) {
      return this.HANDLE_TYPES.include(n);
    }.bind(this));
    
    Plumb.Selection.set(this.shape);
    
    // this.handle = handle;
    // this.shape = this.handle.up(".shape");
    // 
    // var handleOffset = this.handle.cumulativeOffset();
    // 
    // this.pointerOffsetInHandle = {
    //   left: pointer.x - handleOffset.left,
    //   top: pointer.y - handleOffset.top,
    // }
    // 
    // this.layoutOffset = Plumb.Layout.element.cumulativeOffset();
    // this.handleDimensions = this.handle.getDimensions();
    // 
    // this.measurements = {
    //   left: this.shape.offsetLeft,
    //   top: this.shape.offsetTop,
    //   width: this.shape.offsetWidth,
    //   height: this.shape.offsetHeight
    // };
    // 
    // this.type = this.handle.classNames().detect(function(n) {
    //   return this.HANDLE_TYPES.include(n);
    // }.bind(this));
    // 
    // Plumb.Selection.set(this.shape);
  },

  drag: function(event) {
    if (this.resizing) {
      var handle = {
        left: Plumb.Column.fromEvent(event),
        top: event.pointerY() - this.layoutOffset.top
      }
      
      this.type.split("").each(function(component) {
        Object.extend(this.measurements, this.RULES[component](this.measurements, handle));
      }.bind(this));
      
      this.shape.setMeasurements(this.measurements);
      
      event.stop();
      
      // var pointer = event.pointer();
      // 
      // var handle = {
      //   left: pointer.x - this.layoutOffset.left - this.pointerOffsetInHandle.left + (this.handleDimensions.width / 2),
      //   top: pointer.y - this.layoutOffset.top - this.pointerOffsetInHandle.top + (this.handleDimensions.height / 2)
      // };
      // 
      // this.type.split("").each(function(component) {
      //   Object.extend(this.measurements, this.RULES[component](this.measurements, handle));
      // }.bind(this));
      // 
      // this.shape.setStyle({
      //   left: this.measurements.left + "px",
      //   top: this.measurements.top + "px",
      //   width: this.measurements.width + "px",
      //   height: this.measurements.height + "px"
      // });
      // 
      // event.stop();
    }
  },

  finish: function(event) {
    this.resizing = false;
  }
}