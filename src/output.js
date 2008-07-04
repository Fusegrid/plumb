Plumb.Output = {
  htmlForContainer: function(container) {
    var html = "";
    
    if (!container.id)
      container.id = "container-" + (Math.random() * 1000000000).round();
    
    html += "<div id=\"" + container.id + "\">";
    
    container.children.map(function(child) {
      if (child.children) {
        html += Plumb.Output.htmlForContainer(child);
      } else {
        if (!child.id)
          child.id = "container-" + (Math.random() * 1000000000).round();
          
        html += "<div id=\"" + child.id + "\"></div>"
      }
    });
    
    html += "</div>"
    
    return html;
  },
  
  cssForContainer: function(container) {
    var O = this.getMeasurements();
    var css = {};
    
    if (!container.id)
      container.id = "container-" + (Math.random() * 1000000000).round();
    
    css[container.id] = {
      'float': container.type == 'columns' || container.root ? 'none' : 'left',
      'width': container.stretchy ?
        container.width.percentage + "% - " + (((O.margin + O.width) * container.width.subtrahend) + O.margin) + "px" :
        ((O.margin + O.width) * container.width) + O.margin + "px"
    };
    
    container.children.map(function(child) {
      if (child.children) {
        Object.extend(css, Plumb.Output.cssForContainer(child));
      } else {
        if (!child.id)
          child.id = "container-" + (Math.random() * 1000000000).round();
        
        css[child.id] = {
          'float': container.type == 'rows' ? 'none' : 'left',
          'margin-left': O.margin + ((O.margin + O.width) * (child.prepend || 0)) + "px",
          'margin-right': ((O.margin + O.width) * (child.append || 0)) + "px",
          'width': child.stretchy ?
            child.width.percentage + "% - " + (((O.margin + O.width) * child.width.subtrahend) - O.margin) + "px" :
            ((O.margin + O.width) * child.width) - O.margin + "px"
        }
      }
    });
    
    return css;
  },
  
  getMeasurements: function() {
    return {
      width: this.options.width,
      margin: this.options.margin
    };
  }
}