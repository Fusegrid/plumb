Plumb.Output = {
  
  stretchyOutput: function(boxes, container) {
    var MARGIN = 10;
    var COLUMN = 50;
    
    var fixedSpace = MARGIN;
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
      
      if (Object.isNumber(box.append) && index == boxes.length - 1) {
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
        
        if (!Object.isUndefined(box.children) && box.children.length > 0) {
          element.setStyle({
            "marginLeft": 0,
          });
          
          // FIXME: cargo culting, here
          usedFixedSpace += MARGIN;
          
          element.className = "container";
          Plumb.Output.stretchyOutput(box.children, element);
        }
        
        inner.insert(element);
        outer.insert(inner);
      });
      
      outer.setStyle({
        "marginRight": (fixedSpace - (usedFixedSpace + MARGIN)) + "px"
      });
      
      usedFixedSpace += MARGIN;
      
      container.insert(outer);
      
      stretchy = [];
    }
    
    lastWasStretchy = false;
    
    boxes.each(function(box) {
      if (Object.isNumber(box.width)) {
        if (stretchy.length > 0)
          emitStretchy();
        
        var element = new Element("div", { className: "box" });
        
        width = (COLUMN * box.width) + (MARGIN * (box.width - 1));
        left = MARGIN;
        
        if (Object.isNumber(box.prepend)) {
          left = MARGIN + (COLUMN * box.prepend) + (MARGIN * box.prepend);
        }
        
        if (!Object.isUndefined(box.children) && box.children.length > 0) {
          element.className = "container";
          left -= MARGIN;
          width += MARGIN;
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