Plumb.Output = {
  htmlOptions: function(c) {
    var O = Plumb.Output.options;
    var options = {};
    
    options.id = c.id;
    
    options.className = c.type ? c.type : "box";
    if (c.root) options.className += " root"
    
    var width = (c.width * O.width) + (c.width * O.margin);
    if (!c.type) width -= O.margin;
    if (c.root) width += O.margin;
    options.width = width + "px";
    
    var left = (c.prepend * O.width) + (c.prepend * O.margin);
    if (!c.type) left += O.margin;
    options.marginLeft = left + "px";
      
    var right = (c.append * O.width) + (c.append * O.margin);
    options.marginRight = right + "px";
    
    return options;
  },
  
  elementOutput: function(c, parent) {
    var options = Plumb.Output.htmlOptions(c);
    
    parent.className = options.className;
      
    parent.setStyle({
      width: options.width,
      marginLeft: options.marginLeft,
      marginRight: options.marginRight
    });
    
    if (!c.type) parent.setStyle({ height: c.height + "px" });
    
    if (!Object.isUndefined(c.children) && c.children.length > 0) {
      for (var i = 0; i < c.children.length; i++) {
        var child = new Element("div");
        Plumb.Output.elementOutput(c.children[i], child)
        parent.insert(child);
      }
    }
  }
}