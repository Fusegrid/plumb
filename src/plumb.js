//= require <prototype.js>

/* Plumb (c) 2007-2009 Michael Daines
 * Distributed under the terms of an MIT-style license */

var Plumb = {
  WIDTH: 30,
  MARGIN: 10,
  BORDER: 1,
  HANDLE_SIZE: 8,
  
  setup: function(element) {
    this.element = $(element);
    
    Plumb.Creation.setup();
    Plumb.Dragging.setup();
    Plumb.Handle.setup();
    Plumb.Layout.setup();
    Plumb.Resizing.setup();
    Plumb.Shape.setup();
  },
  
  setMode: function(mode) {
    this.mode = mode;
    this.fire("plumb:modechanged");
  },
  
  observe: function(eventName, handler) {
    Plumb.element.observe(eventName, handler);
  },
  
  fire: function(eventName) {
    Plumb.element.fire(eventName);
  }
}

//= require "plumb/column.js"
//= require "plumb/creation.js"
//= require "plumb/dragging.js"
//= require "plumb/handle.js"
//= require "plumb/layout.js"
//= require "plumb/resizing.js"
//= require "plumb/selection.js"
//= require "plumb/shape.js"
