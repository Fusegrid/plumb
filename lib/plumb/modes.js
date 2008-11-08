Plumb.Modes = {
  modes: ["draw", "select"],
  mode: "draw",
  
  setup: function() {
    this.each(function(mode, element) {
      element.observe('mousedown', function(e) {
        Plumb.Modes.set(mode);
        e.stop();
      });
    });
    
    this.update();
  },
  
  get: function() {
    return this.mode;
  },
  
  set: function(mode) {
    this.mode = mode;
    this.update();
  },
  
  each: function(iterator) {
    this.modes.each(function(mode) {
      iterator(mode, Plumb.Toolbar.group("modes").down("." + mode));
    });
  },
  
  button: function() {
    return Plumb.Toolbar.group("modes").down("." + this.mode);
  },
  
  update: function() {
    this.each(function(mode, element) {
      element.removeClassName("set");
    });
    this.button().addClassName("set");
    
    Plumb.Layout.updateMode();
  }
}