Plumb.Output = {
  
  stretchyOutput: function(boxes, container) {
    var O = this.options;
    
    var fixedSpace = O.margin;
    var lastWasStretchy = false;
    var stretchySegments = 0
    
    boxes.each(function(box, index) {
      if (Object.isNumber(box.width)) {
        fixedSpace += (O.width * box.width) + (O.margin * box.width);
        lastWasStretchy = false;
      } else {
        if (!lastWasStretchy) {
          fixedSpace += O.margin;
          stretchySegments += 1;
        }
        lastWasStretchy = true;
      }
      
      if (Object.isNumber(box.prepend)) {
        fixedSpace += (O.width * box.prepend) + (O.margin * box.prepend);
        lastWasStretchy = false;
      }
      
      if (Object.isNumber(box.append) && index == boxes.length - 1) {
        fixedSpace += (O.width * box.append) + (O.margin * box.append);
      }
    });
    
    fixedSpace -= (stretchySegments - 1) * O.margin;
    
    var usedFixedSpace = 0;
    var stretchy = [];
    
    var emitStretchy = function() {
      var outer = new Element("div");
      
      outer.setStyle({
        "marginLeft": usedFixedSpace + "px"
      });
      
      if (Object.isNumber(stretchy[0].prepend)) {
        var prependSpace = (O.width * stretchy[0].prepend) + (O.margin * stretchy[0].prepend);
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
          "marginLeft": O.margin + "px",
        });
        
        if (Object.isNumber(box.prepend) && index == 0 && lastWasStretchy) {
          inner.setStyle({
            "marginLeft": (O.width * box.prepend) + (O.margin * box.prepend)
          });
        }
        
        if (!Object.isUndefined(box.children) && box.children.length > 0) {
          element.setStyle({
            "marginLeft": 0,
          });
          
          // FIXME: cargo culting, here
          usedFixedSpace += O.margin;
          
          element.className = "container";
          Plumb.Output.stretchyOutput(box.children, element);
        }
        
        inner.insert(element);
        outer.insert(inner);
      });
      
      outer.setStyle({
        "marginRight": (fixedSpace - (usedFixedSpace + O.margin)) + "px"
      });
      
      usedFixedSpace += O.margin;
      
      container.insert(outer);
      
      stretchy = [];
    }
    
    lastWasStretchy = false;
    
    boxes.each(function(box) {
      if (Object.isNumber(box.width)) {
        if (stretchy.length > 0)
          emitStretchy();
        
        var element = new Element("div", { className: "box" });
        
        width = (O.width * box.width) + (O.margin * (box.width - 1));
        left = O.margin;
        
        if (Object.isNumber(box.prepend)) {
          left = O.margin + (O.width * box.prepend) + (O.margin * box.prepend);
        }
        
        if (!Object.isUndefined(box.children) && box.children.length > 0) {
          element.className = "container";
          left -= O.margin;
          width += O.margin;
        }
        
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": left + "px"
        });
        
        if (!Object.isUndefined(box.children) && box.children.length > 0) {
          Plumb.Output.stretchyOutput(box.children, element);
        }
        
        container.insert(element);
        
        usedFixedSpace += width + left;
        
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