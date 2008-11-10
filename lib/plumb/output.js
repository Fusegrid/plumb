Plumb.Output = {
  
  output: function(box, container) {
    box.children.each(function(child, index) {
      var element = new Element("div");
      
      element.addClassName("span-" + child.width);
      
      if (child.prepend > 0)
        element.addClassName("prepend-" + child.prepend);
      
      if (child.append > 0)
        element.addClassName("append-" + child.append);
        
      if (index == box.children.length - 1)
        element.addClassName("last");
        
      container.insert(element);
      
      if (child.children && child.children.any()) {
        this.output(child, element);
      } else {
        element.addClassName("column");
        element.setStyle({ height: child.height + "px" });
      }
    }.bind(this));
  }
  
}