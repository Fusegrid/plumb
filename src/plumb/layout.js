Plumb.Layout = {
  setup: function() {
    Plumb.element.observe('mousedown', function(event) {
      Plumb.Selection.clear();
      
      if (Plumb.mode == "draw")
        Plumb.Creation.start(event);
    });
  }
}