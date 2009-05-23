Plumb.Output = {
  
  output: function(box, container) {
    box.children.each(function(child, index) {
      var element = new Element("div");
      
      element.addClassName("span-" + child.width);
      
      if (child.prepend > 0)
        element.addClassName("prepend-" + child.prepend);
      
      if (index == box.children.length - 1 || box.type == "rows")
        element.addClassName("last");
      else if (child.append > 0)
        element.addClassName("append-" + child.append);
        
      if (child.children && child.children.any()) {
        container.insert(element);
        this.output(child, element);
      } else {
        container.insert(element);
        element.setStyle({ height: child.height + "px" });
      }
    }.bind(this));
  }
  
}
