Plumb.Dragging = {
  setup: function() {
    Event.observe(Plumb.element, 'mousemove', function(e) { Plumb.Dragging.drag(e); });
    Event.observe(Plumb.element, 'mouseup', function(e) { Plumb.Dragging.finish(e); });
  },
  
  start: function(event) {
    this.dragging = true;
    this.shape = event.element();
    
    var S = this.shape.getMeasurements();
    
    this.pointerOffset = {
      left: Plumb.Column.fromEvent(event) - S.left,
      top: event.pointerY() - S.top
    }
    
    this.selectionMemo = Plumb.Selection.selection.without(this.shape).map(function(other) {
      var O = other.getMeasurements();
      
      return {
        shape: other,
        left: S.left - O.left,
        top: S.top - O.top
      };
    }.bind(this));
    
    event.stop();
  },
  
  drag: function(event) {
    if (this.dragging) {
      var S = this.shape.getMeasurements();
      
      var offset = {
        left: Plumb.Column.fromEvent(event) - this.pointerOffset.left,
        top: event.pointerY() - this.pointerOffset.top
      }
      
      if (offset.left < 0)
        offset.left = 0;
      
      if (offset.top < 0)
        offset.top = 0;
        
      this.selectionMemo.each(function(memo) {
        var O = memo.shape.getMeasurements();
        
        var otherOffset = {
          left: offset.left - memo.left,
          top: offset.top - memo.top
        }
        
        if (otherOffset.left < 0)
          offset.left -= otherOffset.left;
      
        if (otherOffset.top < 0)
          offset.top -= otherOffset.top;
      });
      
      this.shape.setMeasurements(offset);
      
      this.selectionMemo.each(function(memo) {
        memo.shape.setMeasurements({
          left: offset.left - memo.left,
          top: offset.top - memo.top
        });
      }.bind(this));
    }
  },
  
  finish: function(event) {
    this.dragging = false;
    Plumb.fire("plumb:finisheddragging");
  }
}