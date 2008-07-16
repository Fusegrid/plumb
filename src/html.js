Plumb.HTML = Class.create({
  initialize: function(index) {
    this.children = [];
  },
  
  child: function() {
    var e = new Plumb.HTML();
    this.children.push(e);
    return e;
  },
  
  element: function(parent) {
    for (var i = 0; i < this.children.length; i++) {
      var child = new Element("div");
      
      child.className = this.children[i].className;
      
      child.setStyle({
        width: this.children[i].width,
        marginLeft: this.children[i].marginLeft,
        marginRight: this.children[i].marginRight
      });
      
      if (this.children[i].children.length > 0)
        this.children[i].element(child);
      
      parent.insert(child);
    }
  }
});