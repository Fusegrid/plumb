Plumb.Output = {
  
  calculateFixedSpace: function(boxes) {
    var O = this.options;
    
    var space = 0;
    var lastWasStretchy = false;
    
    boxes.each(function(box, index) {
      if (box.stretchy) {
        if (!lastWasStretchy)
          space += O.margin;
        
        lastWasStretchy = true;
      } else {
        space += box.width * (O.width + O.margin);
        
        lastWasStretchy = false;
      }
    });
    
    space += O.margin;
    
    return space;
  },
  
  output: function(box, container) {
    if (box.root)
      box = { children: [box], type: box.type == "rows" ? "columns" : "rows" };
    
    if (box.type == "columns")
      this.outputColumns(box, container);
    else
      this.outputRows(box, container);
  },
  
  outputRows: function(parent, container) {
    var O = this.options;
    var boxes = parent.children;
    
    boxes.each(function(box, i) {
      if (box.stretchy) {
        var left = 0;
        var right = 0;
        
        if (box.root)
          right = O.margin;
      
        // assemble elements
        var outer = new Element("div");
        
        if (box.id) outer.id = box.id + "-outer";
      
        outer.setStyle({
          "marginLeft": left + "px",
          "marginRight": right + "px"
        });
      
        var inner = new Element("div");
        var element = new Element("div", { "class": "box stretchy row" });
        
        if (box.type == "spacing")
          element.addClassName("spacing");
      
        var inner = new Element("div");
        
        if (box.id) inner.id = box.id + "-inner";
    
        inner.setStyle({
          "float": "left",
          "width": (box.width * 100) + "%"
        });
      
        if (box.children && box.children.length > 0) {
          element.className = "container stretchy row";
          Plumb.Output.outputColumns(box, element);
        } else {
          element.setStyle({
            "height": box.height + "px",
            "marginLeft": O.margin + "px",
            "height": box.height + "px"
          });
        }
      
        inner.insert(element);
        outer.insert(inner);
        container.insert(outer);
        
      } else {
        // calculate measurements
        width = (O.width * box.width) + (O.margin * (box.width - 1));
        
        left = O.margin;
        right = 0;
      
        // create and insert element
        var element = new Element("div", { className: "box row" });
        
        if (box.type == "spacing")
          element.addClassName("spacing");
          
        if (box.id) element.id = box.id;
      
        if (box.children && box.children.length > 0) {
          element.className = "container row";
          width += O.margin;
          left -= O.margin;
        }
      
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": left + "px"
        });
        
        if (box.children && box.children.length > 0) {
          Plumb.Output.outputColumns(box, element);
        } else {
          element.setStyle({
            "height": box.height + "px"
          });
        }
      
        container.insert(element);
      }
      
    });
  },
  
  outputColumns: function(parent, container) {
    var O = this.options;
    
    var boxes = parent.children;
    
    var totalFixedSpace = this.calculateFixedSpace(boxes);
    var usedFixedSpace = 0;
    var stretchy = [];
    
    var lastWasStretchy = false;
    var numberOfStretchyGroups = 0;
    
    boxes.each(function(box) {
      if (box.stretchy && !lastWasStretchy) {
        numberOfStretchyGroups += 1;
        lastWasStretchy = true;
      }
      
      if (!box.stretchy)
        lastWasStretchy = false;
    });
    var stretchyRightMarginAdjustment = numberOfStretchyGroups * O.margin;
    
    var emitStretchy = function() {
      // calculate widths and margins
      var left = usedFixedSpace;
      var right = (totalFixedSpace - (left + O.margin)) - stretchyRightMarginAdjustment;
        
      if (stretchy[0].root)
        right += O.margin;
      
      usedFixedSpace += O.margin;
      
      // assemble elements
      var outer = new Element("div");
      outer.id = stretchy.map(function(s) { return s.id; }).compact().join("") + "-outer";
      
      outer.setStyle({
        "marginLeft": left + "px",
        "marginRight": right + "px"
      });
      
      stretchy.each(function(box, index) {
        var inner = new Element("div");
        var element = new Element("div", { "class": "box stretchy column" });
        
        if (box.type == "spacing")
          element.addClassName("spacing");
        
        if (box.id) inner.id = box.id + "-inner";
        if (box.id) element.id = box.id;
      
        inner.setStyle({
          "float": "left",
          "width": (box.width * 100) + "%"
        });
        
        if (box.children && box.children.length > 0) {
          element.className = "container stretchy column";
          Plumb.Output.outputRows(box, element);
        } else {
          element.setStyle({
            "marginLeft": O.margin + "px",
            "height": box.height + "px"
          });
        }
        
        inner.insert(element);
        outer.insert(inner);
      });
      
      container.insert(outer);
      
      stretchy = [];
    }
    
    boxes.each(function(box) {
      if (box.stretchy) {
        stretchy.push(box);
        
      } else {
        if (stretchy.length > 0)
          emitStretchy();
        
        // calculate width and left margin, adjust used fixed space
        width = (box.width * (O.width + O.margin)) - O.margin;
        
        left = O.margin;
        right = 0;
        
        usedFixedSpace += width + left;
        
        // create and insert element
        var element = new Element("div", { className: "box column" });
        
        if (box.type == "spacing")
          element.addClassName("spacing");
          
        if (box.id) element.id = box.id;
        
        if (box.children && box.children.length > 0) {
          element.className = "container column";
          width += O.margin;
          left -= O.margin;
        }
        
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": left + "px"
        });
        
        if (box.children && box.children.length > 0) {
          Plumb.Output.outputRows(box, element);
        } else {
          element.setStyle({
            "height": box.height + "px"
          });
        }
        
        container.insert(element);
      }
    });
    
    if (stretchy.length > 0)
      emitStretchy();
  }
}