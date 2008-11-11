Plumb.Shape = {
  MIN_HEIGHT: 20,
  
  create: function(options) {
    var element = new Element('div', {'class': 'shape'}).setStyle({"position": "absolute"});
    Object.extend(element, Plumb.Shape.Methods);

    element.setMeasurements(options);

    Plumb.Resizing.HANDLE_TYPES.each(function(type) {
      Plumb.Handle.create({type: type, shape: element});
    });
    
    element.observe('mousedown', function(event) {
      if (Plumb.Modes.mode != "select") return;
      
      if (event.shiftKey) {
        Plumb.Selection.toggle(element);
        if (Plumb.Selection.include(element))
          Plumb.Dragging.start(event);
        else
          event.stop();
      } else {
        if (!Plumb.Selection.include(element))
          Plumb.Selection.set(element);
        Plumb.Dragging.start(event);
      }
    });

    Plumb.Layout.insert(element);
    
    return element;
  }
}

Plumb.Shape.Methods = {
  getMeasurements: function() {
    var C = Plumb.Column.getMeasurements();
    
    var m = {
      left: ((this.offsetLeft) - C.margin) / (C.width + C.margin),
      top: this.offsetTop,
      height: this.offsetHeight,
      width: ((this.offsetWidth) + C.margin) / (C.width + C.margin)
    };
    
    m.right = m.left + m.width - 1;
    m.bottom = m.top + m.height;
    
    return m;
  },
  
  setMeasurements: function(measurements) {
    var styles = {};
    var C = Plumb.Column.getMeasurements();
    var O = Plumb.Shape.options;
    
    if (!Object.isUndefined(measurements.left))
      styles.left = C.margin + (measurements.left * (C.width + C.margin)) + "px";
    
    if (!Object.isUndefined(measurements.top))
      styles.top = measurements.top + "px";
      
    if (!Object.isUndefined(measurements.height))
      styles.height = measurements.height - O.border + "px";
      
    if (!Object.isUndefined(measurements.width))
      styles.width = ((measurements.width * (C.width + C.margin)) - C.margin) - (O.border * 2) + "px";
      
    this.setStyle(styles);
  },
  
  focus: function() {
    this.down(".focus").focus();
  }
}