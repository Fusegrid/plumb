Plumb.Layout = {
  setup: function() {
    this.options.width.times(function(i) { Plumb.Column.create(); });
    
    this.options.element.observe('mousedown', function(event) {
      Plumb.Selection.clear();
      if (Plumb.Modes.mode == "draw")
        Plumb.Creation.start(event);
    });
  },
  
  shapes: function() {
    return this.options.element.select(".shape");
  },
  
  insert: function(element) {
    // should be real proxy?
    this.options.element.insert(element);
  },
  
  updateMode: function() {
    Plumb.Modes.each(function(mode) {
      this.options.element.removeClassName(mode);
    }.bind(this));
    this.options.element.addClassName(Plumb.Modes.get());
  },
  
  getMeasurements: function() {
    var offset = this.options.element.cumulativeOffset();
    
    return {
      left: offset.left,
      top: offset.top,
      width: this.options.width,
      height: this.options.element.offsetHeight
    }
  },
  
  getHeight: function() {
    return this.options.element.offsetHeight;
  },
  
  observe: function(eventName, handler) {
    this.options.element.observe(eventName, handler);
  },
  
  fire: function(eventName) {
    this.options.element.fire(eventName);
  }
}