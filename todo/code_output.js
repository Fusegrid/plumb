BlueprintGeneration = {
  generate: function(root, output) {
    this.nextContainer = -1;
    this.elements = this.elementsForContainer(root);
    
    this.order.each(function(name) {
      output(name, this.parts[name].bind(this)());
    }.bind(this));
  },
  
  identifyContainer: function() {
    if (Object.isUndefined(this.nextContainer)) this.nextContainer = -1;
    return "container-" + LetterIdentification.fromNumber(this.nextContainer += 1);
  },
  
  elementsForContainer: function(container) {
    return container.children.inject($A(), function(elements, child, i) {
      // if this is the last thing in a row, note that
      if (i == container.children.length - 1 || container.type == "rows")
        child.last = true;
      
      // calculate prepend and append
      if (container.type == "rows") {
        child.prepend = child.left - container.left;
        child.append = container.right - child.right;
      } else {
        if (i > 0)
          child.prepend = child.left - container.children[i - 1].right - Columns.marginWidth;
        else
          child.prepend = child.left - container.left;
          
        if (i == container.children.length - 1)
          child.append = container.right - child.right;
        else
          child.append = 0;
      }
      
      // if this has children, we may need to nest
      if (child.children) {
        // rows inside columns need to be nested
        if (container.type == "columns" && child.type == "rows") {
          elements.push({
            id: this.identifyContainer(),
            last: child.last,
            prepend: child.prepend,
            append: child.append,
            width: child.width,
            children: this.elementsForContainer(child)
          });
        // columns inside rows don't
        } else if (container.type == "rows" && child.type == "columns") {
          var left = child.left;
          var right = child.right;
          
          child.left = container.left;
          child.right = container.right;
          
          elements = elements.concat(this.elementsForContainer(child));
          
          child.left = left;
          child.right = right;
        }
      } else {
        elements.push(child);
      }
      return elements;
    }.bind(this));
  }
}

BlueprintOutput = {
  order: ["HTML", "grid.css"],
  parts: {
    "HTML": function() {
      var htmlForElements = function(elements, level) {
        return elements.inject("", function(html, element) {
          var classes = $w("column");
          
          if (element.last)
            classes.push("last");
          
          classes.push("span-" + ((element.width + Columns.marginWidth) / (Columns.columnWidth + Columns.marginWidth)));
          
          if (element.prepend > 0)
            classes.push("prepend-" + (element.prepend / (Columns.columnWidth + Columns.marginWidth)));
          
          if (element.append > 0)
            classes.push("append-" + (element.append / (Columns.columnWidth + Columns.marginWidth)));
          
          if (element.children) {
            html += "  ".times(level) + "<div class=\"" + classes.join(" ") + "\">\n";
            html += htmlForElements(element.children, level + 1);
            html += "  ".times(level) + "</div>\n";
          } else {
            html += "  ".times(level) + "<div class=\"" + classes.join(" ") + "\"></div>\n";
          }
          return html;
        });
      }
      
      return "<div class=\"container\">\n" + htmlForElements(this.elements, 1) + "</div>";
    },
    
    "grid.css": function() {
      var stylesheet = new StylesheetRuleGroup();
      
      stylesheet.rule(".container", { "width": Columns.totalWidth + "px" });
      stylesheet.rule(".column", { "margin-right": Columns.marginWidth + "px" });
      
      stylesheet.group("spans", function(spans) {
        $R(1, Columns.columnCount).each(function(i) {
          spans.rule(".span-" + i, {
            "width": ((Columns.marginWidth + Columns.columnWidth) * i) - Columns.marginWidth + "px",
            "margin": i == Columns.columnCount ? 0 : null
          });
        });
      }, { compact: true });
      
      stylesheet.rule(".last", { "margin-right": "0px" });
      
      stylesheet.group("appends", function(appends) {
        $R(1, Columns.columnCount - 1).each(function(i) {
          appends.rule(".append-" + i, {
            "padding-right": ((Columns.marginWidth + Columns.columnWidth) * i) + "px"
          });
        });
      }, { compact: true });
      
      stylesheet.group("prepends", function(prepends) {
        $R(1, Columns.columnCount - 1).each(function(i) {
          prepends.rule(".prepend-" + i, {
            "padding-left": ((Columns.marginWidth + Columns.columnWidth) * i) + "px"
          });
        });
      }, { compact: true });
      
      return stylesheet.toString();
    }
  }
}
Object.extend(BlueprintOutput, BlueprintGeneration);

BlueprintOutputWithIds = {
  order: ["HTML", "CSS"],
  parts: {
    "HTML": function() {
      var htmlForElements = function(elements, level) {
        return elements.inject("", function(html, element) {
          if (element.children) {
            html += "  ".times(level) + "<div id=\"" + element.id + "\" class=\"column\">\n";
            html += htmlForElements(element.children, level + 1);
            html += "  ".times(level) + "</div>\n";
          } else {
            html += "  ".times(level) + "<div id=\"" + element.id + "\" class=\"column\"></div>\n";
          }
          return html;
        });
      }
        
      return "<div class=\"container\">\n" + htmlForElements(this.elements, 1) + "</div>";
    },
    
    "CSS": function() {
      var stylesheet = new StylesheetRuleGroup();
      
      stylesheet.rule(".container", {
        "width": Columns.totalWidth + "px"
      });
    
      stylesheet.rule(".column", {
        "float": "left",
        "margin-right": Columns.marginWidth + "px"
      });
      
      var addRulesForElements = function(elements) {
        elements.each(function(element) {
          var attributes = {};
        
          if (element.width) attributes["width"] = element.width + "px";
          if (element.last) attributes["margin-right"] = "0px";
          if (element.prepend > 0) attributes["padding-left"] = element.prepend + "px";
          if (element.append > 0) attributes["padding-right"] = element.append + "px";
        
          stylesheet.rule("#" + element.id, attributes);
        
          if (element.children)
            addRulesForElements(element.children);
        });
      }
      
      addRulesForElements(this.elements);
      
      return stylesheet.toString();
    }
  }
}
Object.extend(BlueprintOutputWithIds, BlueprintGeneration);

CodeOutput = {
  generate: function(outputStyle) {
    try {
      var root = new Container($$("#shapes .shape").map(function(shape) {
        return {
          left: shape.offsetLeft,
          top: shape.offsetTop,
          right: shape.offsetLeft + shape.offsetWidth,
          bottom: shape.offsetTop + shape.offsetHeight,
          width: shape.offsetWidth,
          height: shape.offsetHeight,
          id: shape.id == "" ? shape.blankId : shape.id
        };
      }));
    } catch (e) {
      if (e == UnsupportedLayout) {
        alert("Sorry, can't generate layouts like that.");
        return;
      } else {
        throw e;
      }
    }
    
    root.left = 0;
    root.right = Columns.totalWidth;
    root.width = Columns.totalWidth;
    
    $("output").innerHTML = "";
    
    outputStyle.generate(root, function(name, value) {
      $("output").insert(new Element("h4").insert(name.escapeHTML()));
      $("output").insert(new Element("pre").insert(value.escapeHTML()));
    });
  }
}