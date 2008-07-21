Plumb.Output = {
  classAndStyles: function(c) {
    var O = Plumb.Output.options;
    var options = {};
    
    options.id = c.id;
    
    options.className = c.type ? c.type : "box";
    if (c.root) options.className += " root"
    
    if (!c.stretchy) {
      var width = (c.width * O.width) + (c.width * O.margin);
      if (!c.type) width -= O.margin;
      if (c.root) width += O.margin;
      options.width = width + "px";
    }
    
    var left = (c.prepend * O.width) + (c.prepend * O.margin);
    if (!c.type) left += O.margin;
    options.marginLeft = left + "px";
      
    var right = (c.append * O.width) + (c.append * O.margin);
    options.marginRight = right + "px";
    
    return options;
  },
  
  elementOutput: function(c, parent) {
    var options = Plumb.Output.classAndStyles(c);
    
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
  
  stretchyOutput: function(boxes, parent) {
    var O = Plumb.Output.options;
    
    var fixedSpace = O.margin;
    var lastWasStretchy = false;
    var stretchySegments = 0
    
    boxes.each(function(box, index) {
      if (Object.isNumber(box.width)) {
        fixedSpace += (COLUMN * box.width) + (MARGIN * box.width);
        lastWasStretchy = false;
      } else {
        if (!lastWasStretchy) {
          fixedSpace += MARGIN;
          stretchySegments += 1;
        }
        lastWasStretchy = true;
      }
      
      if (Object.isNumber(box.prepend)) {
        fixedSpace += (COLUMN * box.prepend) + (MARGIN * box.prepend);
        lastWasStretchy = false;
      }
      
      if (Object.isNumber(box.append) && index == spec.length - 1) {
        fixedSpace += (COLUMN * box.append) + (MARGIN * box.append);
      }
    });
    
    fixedSpace -= (stretchySegments - 1) * MARGIN;
    
    var usedFixedSpace = 0;
    var stretchy = [];
    
    var emitStretchy = function() {
      var outer = new Element("div");
      
      outer.setStyle({
        "marginLeft": usedFixedSpace + "px"
      });
      
      if (Object.isNumber(stretchy[0].prepend)) {
        var prependSpace = (COLUMN * stretchy[0].prepend) + (MARGIN * stretchy[0].prepend);
        outer.setStyle({
          "marginLeft": (usedFixedSpace + prependSpace) + "px"
        });
        usedFixedSpace += prependSpace;
      }
      
      stretchy.each(function(box, index) {
        var inner = new Element("div");
        var element = new Element("div", { "class": "box" });
      
        inner.setStyle({
          "float": "left",
          "width": box.width.percentage + "%"
        });
        
        element.setStyle({
          "marginLeft": MARGIN + "px",
        });
        
        if (Object.isNumber(box.prepend) && index == 0 && lastWasStretchy) {
          inner.setStyle({
            "marginLeft": (COLUMN * box.prepend) + (MARGIN * box.prepend)
          });
        }
        
        inner.insert(element);
        outer.insert(inner);
      });
      
      outer.setStyle({
        "marginRight": (fixedSpace - (usedFixedSpace + MARGIN)) + "px"
      });
      
      usedFixedSpace += MARGIN;
      
      parent.insert(outer);
      
      stretchy = [];
    }
    
    lastWasStretchy = false;
    
    boxes.each(function(box) {
      if (Object.isNumber(box.width)) {
        if (stretchy.length > 0)
          emitStretchy();
        
        var element = new Element("div", { "class": "box" });
        
        width = (COLUMN * box.width) + (MARGIN * (box.width - 1))
        
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": MARGIN + "px"
        });
        
        if (Object.isNumber(box.prepend)) {
          element.setStyle({
            "marginLeft": MARGIN + (COLUMN * box.prepend) + (MARGIN * box.prepend) + "px"
          });
          
          usedFixedSpace += (COLUMN * box.prepend) + (MARGIN * box.prepend);
        }
        
        parent.insert(element);
        
        usedFixedSpace += width + MARGIN;
        
        lastWasStretchy = false;
      } else {
        if (Object.isNumber(box.prepend) && stretchy.length > 0) {
          emitStretchy();
          lastWasStretchy = true;
        }
        
        stretchy.push(box);
      }
    });
    
    if (stretchy.length > 0)
      emitStretchy();
  }
}