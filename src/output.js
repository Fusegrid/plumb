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
  
  totalFixedSpace: function(boxes) {
    var O = this.options;
    
    var space = 0;
    var lastWasStretchy = false;
    
    boxes.each(function(box, index) {
      if (box.stretchy) {
        space += O.margin;
        lastWasStretchy = true;
      } else {
        space += (O.width * box.width) + (O.margin * box.width);
        lastWasStretchy = false;
      }
      
      if (Object.isNumber(box.prepend)) {
        space += (O.width * box.prepend) + (O.margin * box.prepend);
        lastWasStretchy = false;
      }
      
      if (Object.isNumber(box.append) && index == boxes.length - 1) {
        space += (O.width * box.append) + (O.margin * box.append);
      }
    });
    
    space += O.margin;
    
    return space;
  },
  
  stretchyOutput: function(boxes, container) {
    var O = this.options;
    
    var fixedSpace = O.margin;
    var lastWasStretchy = false;
    var stretchySegments = 0;
    
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