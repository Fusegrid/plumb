Plumb.Focus = {
  setup: function() {
    this.element = new Element('input', { 'class': 'focus' });
    
    this.element.setStyle({
      "position": "fixed",
      "left": "-1px",
      "top": "-1px",
      "width": "1px",
      "height": "1px",
      "margin": 0,
      "padding": 0,
      "border": "none"
    });
    
    this.element.observe('keydown', function(e) {
      if (e.keyCode == Event.KEY_BACKSPACE || e.keyCode == Event.KEY_DELETE) {
        Plumb.Selection.destroyAll();
        e.stop();
      }
    });
    
    this.element.observe('blur', function(e) {
      Plumb.Selection.clear();
    });
    
    Plumb.Layout.insert(this.element);
    
    Plumb.Layout.observe('plumb:selectionchanged', function() {
      if (Plumb.Selection.any())
        Plumb.Focus.focus();
    });
  },
  
  focus: function() {
    this.element.focus();
  }
}