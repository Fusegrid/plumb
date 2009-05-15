Plumb.Handle = {
  setup: function() {
    this.positioning = {
      tl: { top: -0.5, left: -0.5 },
      tr: { top: -0.5, right: -0.5 },
      bl: { bottom: -0.5, left: -0.5 },
      br: { bottom: -0.5, right: -0.5 },
      t: { top: -0.5, left: "50%", marginLeft: -0.5 },
      r: { right: -0.5, top: "50%", marginTop: -0.5 },
      b: { bottom: -0.5, left: "50%", marginLeft: -0.5 },
      l: { left: -0.5, top: "50%", marginTop: -0.5 }
    }
    
    for (rule in this.positioning) {
      for (name in this.positioning[rule]) {
        if (!Object.isString(this.positioning[rule][name]))
          this.positioning[rule][name] = (this.positioning[rule][name] * Plumb.HANDLE_SIZE) + "px";
      }
    }
  },
  
  create: function(options) {
    var handle = new Element('div', {'class': options.type + ' handle'});
    
    handle.setStyle({
      'position': 'absolute',
      'width': Plumb.HANDLE_SIZE + 'px',
      'height': Plumb.HANDLE_SIZE + 'px',
      'display': 'none'
    });
    
    handle.setStyle(this.positioning[options.type]);
    
    handle.observe('mousedown', function(e) { Plumb.Resizing.start(e); });
    
    options.shape.insert(handle);
    
    return handle;
  }
}