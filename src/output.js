Plumb.Output = {
  
  // To make things simpler at the recognition stage, Plumb assumes
  // there are no margins anywhere. But, since margins are often
  // necessary in designs, the output function must take that into
  // account.
  //
  // Plumb describes the width of an element either as a width in
  // columns or as a percentage of the remaining fixed space; that is,
  // the space left over after other fixed width elements, prepending
  // and appending, and margins are taken into account. For example,
  // if there is one 100%-wide element and the margins are 10px, its
  // final width will be 100% - 20px.
  //
  // This function operates on a list of boxes and a "host" container
  // element. We scan the boxes, inserting the appropriate elements
  // into the container, recursing if there are nested boxes.
  //
  // Nesting works like this...
  //
  // Fixed width elements:
  //
  //   margin-left: { options.margin }
  //   width: { (columns * (options.width + options.margin)) -
  //     options.margin }
  //   float: left;
  //
  // If a stretchy element IS NOT next to other stretchy elements...
  //
  // There's an outer wrap:
  //
  //   margin-left: { the amount of fixed space to the left of this
  //     element (WITHOUT its own margin) }
  //   margin-right: { the amount of fixed space to the right of this
  //     element (WITH its own margin) }
  //
  // An inner wrap:
  //
  //   width: { percentage from the recognition function }
  //   float: left;
  //
  // And the element itself:
  //
  //   margin-left: { options.margin }
  //
  // If a stretchy element IS next to other stretchy elements...
  //
  // There's an outer wrap:
  //
  //   margin-left: { the amount of fixed space to the left of the
  //     first stretchy element (WITHOUT its own margin) }
  //   margin-right: { the amount of fixed space to the right of the
  //     last stretchy elemenet (WITH its own margin) }
  //
  // And for each stretchy element, an inner wrap:
  //
  //   width: { percentage from the recognition function }
  //   float: left;
  //
  // And each stretchy element:
  //
  //   margin-left: { options.margin }
  //
  // Prepended space is considered to be equivalent to a fixed-width
  // element.
  //
  // So -- the algorithm works like this:
  //
  // - Calculate the total fixed space in this row of boxes.
  // - For each box,
  //   - If it's fixed,
  //     - Are there stretchy boxes waiting to be output?
  //       - If so, output those
  //     - Create and insert the box into the container
  //     - If it has children, recurse
  //   - If it's stretchy,
  //     - Does it have a prepend and are there stretchy boxes waiting?
  //       - If so, output those
  //     - Add it to the list of stretchy boxes to be output
  // - If there are remaining stretchy boxes, output those
  //
  // To output stretchy boxes:
  //
  // - Create the appropriate wrapping, and for each box
  //   - Create the box and insert into the container
  //   - If it has children, recurse
  
  calculateFixedSpace: function(boxes) {
    var O = this.options;
    
    var space = 0;
    var lastWasStretchy = false;
    
    boxes.each(function(box, index) {
      if (box.stretchy) {
        if (!lastWasStretchy) space += O.margin;
        lastWasStretchy = true;
      } else {
        space += (O.width * box.width) + (O.margin * box.width);
        lastWasStretchy = false;
      }
    });
    
    space += O.margin;
    
    return space;
  },
  
  output: function(box, container) {
    if (box.type == "columns")
      this.outputColumns(box, container);
    else
      this.outputRows(box, container);
  },
  
  outputRows: function(parent, container) {
    var O = this.options;
    var boxes = parent.children;
    
    boxes.each(function(box) {
      if (box.stretchy) {
        var left = 0;
        var right = 0;
      
        // assemble elements
        var outer = new Element("div");
      
        if (box.children && box.children.length > 0)
          right -= O.margin;
          
        if (parent.root)
          right += O.margin;
      
        outer.setStyle({
          "marginLeft": left + "px",
          "marginRight": right + "px"
        });
      
        var inner = new Element("div");
        var element = new Element("div", { "class": "box" });
      
        if (box.id) element.id = box.id;
    
        inner.setStyle({
          "float": "left",
          "width": (box.width * 100) + "%"
        });
      
        if (box.children && box.children.length > 0) {
          element.className = "container";
          Plumb.Output.outputColumns(box, element);
        } else {
          element.setStyle({
            "marginLeft": O.margin + "px",
          });
        }
      
        inner.insert(element);
        outer.insert(inner);
        container.insert(outer);
        
      } else {
        // calculate measurements
        width = (O.width * box.width) + (O.margin * (box.width - 1));
        left = O.margin;
      
        // create and insert element
        var element = new Element("div", { className: "box" });
        if (box.id) element.id = box.id;
      
        if (box.children && box.children.length > 0) {
          element.className = "container";
          width += O.margin;
          left -= O.margin;
        }
      
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": left + "px"
        });
        
        if (box.children && box.children.length > 0)
          Plumb.Output.outputColumns(box, element);
      
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
    
    var stretchyRightMarginAdjustment = (numberOfStretchyGroups - 1 ) * O.margin;
    
    var emitStretchy = function() {
      // calculate widths and margins
      var left = usedFixedSpace;
      var right = (totalFixedSpace - (left + O.margin)) - stretchyRightMarginAdjustment;
      
      usedFixedSpace += O.margin;
      
      // assemble elements
      var outer = new Element("div");
      
      outer.setStyle({
        "marginLeft": left + "px",
        "marginRight": right + "px"
      });
      
      stretchy.each(function(box, index) {
        var inner = new Element("div");
        var element = new Element("div", { "class": "box" });
        
        if (box.id) element.id = box.id;
      
        inner.setStyle({
          "float": "left",
          "width": (box.width * 100) + "%"
        });
        
        if (box.children && box.children.length > 0) {
          element.className = "container";
          Plumb.Output.outputRows(box, element);
        } else {
          element.setStyle({
            "marginLeft": O.margin + "px",
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
        
        usedFixedSpace += width + left;
        
        // create and insert element
        var element = new Element("div", { className: "box" });
        if (box.id) element.id = box.id;
        
        if (box.children && box.children.length > 0) {
          element.className = "container";
          width += O.margin;
          left -= O.margin;
        }
        
        element.setStyle({
          "float": "left",
          "width": width + "px",
          "marginLeft": left + "px"
        });
        
        if (box.children && box.children.length > 0)
          Plumb.Output.outputRows(box, element);
        
        container.insert(element);
      }
    });
    
    if (stretchy.length > 0)
      emitStretchy();
  }
}