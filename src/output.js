Plumb.Output = {
  
  output: function(c, parent) {
    var O = Plumb.Output.options;
    var element = parent.element();
    
    element.id = c.id;
    
    element.className = c.type ? c.type : "box";
    if (c.root) element.className += " root"
    
    if (c.stretchy) {
      var subtrahend = (c.width.subtrahend * O.width) + (c.width.subtrahend * O.margin);
      if (!c.type) subtrahend += O.margin * 2;
      element.width = c.width.percentage + "% - " + subtrahend + "px";
    } else {
      var width = (c.width * O.width) + (c.width * O.margin) + O.margin;
      if (!c.type) width -= O.margin * 2;
      element.width = width + "px";
    }
    
    var left = (c.prepend * O.width) + (c.prepend * O.margin);
    if (!c.type) left += O.margin;
    element.marginLeft = left + "px";
      
    var right = (c.append * O.width) + (c.append * O.margin);
    element.marginRight = right + "px";
  
    if (!Object.isUndefined(c.children) && c.children.length > 0) {
      for (var i = 0; i < c.children.length; i++)
        arguments.callee(c.children[i], element);
    }
  }
  
}