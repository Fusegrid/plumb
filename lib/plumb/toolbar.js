Plumb.Toolbar = {
  group: function(name) {
    return this.options.element.down("." + name);
  },
  
  fire: function(eventName) {
    this.options.element.select(".group").invoke("fire", eventName);
  }
};