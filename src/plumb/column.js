Plumb.Column = {
  create: function() {
    Plumb.Layout.insert(new Element("div", {"class": "column"}));
  },
  
  getMeasurements: function() {
    return {
      width: this.options.width,
      margin: this.options.margin
    };
  },
  
  fromEvent: function(event) {
    var L = Plumb.Layout.getMeasurements();
    
    var x = event.pointerX() - L.left;
    var column = Math.round((x - (this.options.margin + (this.options.width / 2))) / (this.options.margin + this.options.width));
    
    if (column < 0)
      column = 0;
      
    if (column >= L.width)
      column = L.width - 1;
    
    return column;
  }
}