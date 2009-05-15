Plumb.Column = {
  fromEvent: function(event) {
    var x = event.pointerX();
    var column = Math.round((x - (Plumb.MARGIN + (Plumb.WIDTH / 2))) / (Plumb.MARGIN + Plumb.WIDTH));
    
    if (column < 0)
      column = 0;
    
    return column;
  }
}