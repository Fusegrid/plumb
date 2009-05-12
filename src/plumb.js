//= require <prototype.js>

/* Plumb (c) 2007-2009 Michael Daines
 * Distributed under the terms of an MIT-style license */

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
      width: 50,
      margin: 10
    },
    
    shape: {
      border: 0
    }
  },
  
  modules: $w("layout column creation dragging focus handle modes resizing selection shape toolbar output"),
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

//= require "plumb/column.js"
//= require "plumb/creation.js"
//= require "plumb/dragging.js"
//= require "plumb/focus.js"
//= require "plumb/handle.js"
//= require "plumb/layout.js"
//= require "plumb/modes.js"
//= require "plumb/output.js"
//= require "plumb/recognition.js"
//= require "plumb/resizing.js"
//= require "plumb/selection.js"
//= require "plumb/shape.js"
//= require "plumb/toolbar.js"
