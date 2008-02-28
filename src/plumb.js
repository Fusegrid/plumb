var Plumb = {
  DEFAULTS: {
    layout: {
      width: 12
    },
    
    column: {
      width: 50,
      margin: 10
    },
    
    handle: {
      size: 8
    },
    
    output: {
      width: 25,
      margin: 5
    }
  },
  
  modules: $w("column creation dragging focus handle layout modes output resizing selection shape stretchiness toolbar"),
  elements: $w("layout toolbar"),
  
  setup: function(options) {
    options = options || {};
    
    // ensure that we have correct element references
    this.elements.each(function(e) {
      if (options[e] && options[e].element)
        options[e].element = $(options[e].element);
    });
    
    // propagate options
    this.modules.each(function(m) {
      if (this[m.capitalize()])
        this[m.capitalize()].options = Object.extend(this.DEFAULTS[m] || {}, options[m] || {});
    }.bind(this));
    
    // call setup routines
    this.modules.each(function(m) {
      if (this[m.capitalize()] && this[m.capitalize()].setup)
        this[m.capitalize()].setup();
    }.bind(this));
  }
}