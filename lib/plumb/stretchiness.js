Plumb.Stretchiness = {
  setup: function() {
    this.button().observe('mousedown', function(e) {
      if (Plumb.Stretchiness.all())
        Plumb.Selection.invoke("removeClassName", "stretchy");
      else
        Plumb.Selection.invoke("addClassName", "stretchy");
        
      Plumb.Stretchiness.update();
      
      e.stop();
    });
    
    Plumb.Layout.observe("plumb:selectionchanged", function() {
      Plumb.Stretchiness.update();
    });
  },
  
  all: function() {
    return Plumb.Selection.any() && Plumb.Selection.all(function(s) { return s.hasClassName("stretchy"); });
  },
  
  button: function() {
    return Plumb.Toolbar.group("buttons").down(".stretchy");
  },
  
  update: function() {
    if (this.all())
      this.button().addClassName("set");
    else
      this.button().removeClassName("set");
  }
}