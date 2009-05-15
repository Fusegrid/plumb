Plumb.Shape = {
  MIN_HEIGHT: 20,
  
  setup: function() {
    Event.observe(window, "keypress", function(e) {
      if (e.keyCode == Event.KEY_BACKSPACE) {
        Plumb.Selection.destroyAll();
        e.stop();
      }
    });
  },
  
  create: function(options) {
    var element = new Element('div', { className: "shape" }).setStyle("position: absolute;");
    Object.extend(element, Plumb.Shape.Methods);

    element.setMeasurements(options);

    Plumb.Resizing.HANDLE_TYPES.each(function(type) {
      Plumb.Handle.create({type: type, shape: element});
    });
    
    element.observe('mousedown', function(event) {
      if (Plumb.mode != "select") return;
      
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

    Plumb.element.insert(element);
    
    return element;
  }
}

Plumb.Shape.Methods = {
  getMeasurements: function() {
    var m = {
      left: ((this.offsetLeft) - Plumb.MARGIN) / (Plumb.WIDTH + Plumb.MARGIN),
      top: this.offsetTop,
      height: this.offsetHeight,
      width: ((this.offsetWidth) + Plumb.MARGIN) / (Plumb.WIDTH + Plumb.MARGIN)
    };
    
    m.right = m.left + m.width - 1;
    m.bottom = m.top + m.height;
    
    return m;
  },
  
  setMeasurements: function(measurements) {
    var styles = {};
    
    if (!Object.isUndefined(measurements.left))
      styles.left = Plumb.MARGIN + (measurements.left * (Plumb.WIDTH + Plumb.MARGIN)) + "px";
    
    if (!Object.isUndefined(measurements.top))
      styles.top = measurements.top + "px";
      
    if (!Object.isUndefined(measurements.height))
      styles.height = measurements.height - (Plumb.BORDER * 2) + "px";
      
    if (!Object.isUndefined(measurements.width))
      styles.width = ((measurements.width * (Plumb.WIDTH + Plumb.MARGIN)) - Plumb.MARGIN) - (Plumb.BORDER * 2) + "px";
      
    this.setStyle(styles);
  },
  
  focus: function() {
    this.down(".focus").focus();
  }
}