Plumb.Dragging = {
  setup: function() {
    Event.observe(window, 'mousemove', function(e) { Plumb.Dragging.drag(e); });
    Event.observe(window, 'mouseup', function(e) { Plumb.Dragging.finish(e); });
  },
  
  start: function(event) {
    var L = Plumb.Layout.getMeasurements();
    
    this.dragging = true;
    this.shape = event.element();
    
    var S = this.shape.getMeasurements();
    
    this.pointerOffset = {
      left: Plumb.Column.fromEvent(event) - S.left,
      top: event.pointerY() - S.top
    }
    
    this.layoutOffset = {
      left: L.left,
      top: L.top
    };
    
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
      var L = Plumb.Layout.getMeasurements();
      var S = this.shape.getMeasurements();
      
      var offset = {
        left: Plumb.Column.fromEvent(event) - this.pointerOffset.left,
        top: event.pointerY() - this.pointerOffset.top
      }
      
      if (offset.left < 0)
        offset.left = 0;
      
      if (offset.left + S.width > L.width)
        offset.left = L.width - S.width;
      
      if (offset.top < 0)
        offset.top = 0;
      
      if (offset.top + S.height > L.height)
        offset.top = L.height - S.height;
        
      this.selectionMemo.each(function(memo) {
        var O = memo.shape.getMeasurements();
        
        var otherOffset = {
          left: offset.left - memo.left,
          top: offset.top - memo.top
        }
        
        if (otherOffset.left < 0)
          offset.left -= otherOffset.left;
      
        if (otherOffset.left + S.width > L.width)
          offset.left -= (otherOffset.left + O.width) - L.width;
      
        if (otherOffset.top < 0)
          offset.top -= otherOffset.top;
      
        if (otherOffset.top + O.height > L.height)
          offset.top -= (otherOffset.top + O.height) - L.height;
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
    Plumb.Layout.fire("plumb:finisheddragging");
  }
}