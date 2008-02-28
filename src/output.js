Plumb.Output = {
  elementForContainer: function(container) {
    var O = this.getMeasurements();
    
    var element = new Element("div", { 'id': container.id });
    
    if (container.root) element.addClassName("root");
    element.addClassName(container.type);
    
    element.setStyle({
      'float': container.type == 'columns' || container.root ? 'none' : 'left',
      'width': ((O.margin + O.width) * container.width) + O.margin + "px",
      'overflow': 'auto'
    });
    
    container.children.map(function(child) {
      if (child.children) {
        element.insert(Plumb.Output.elementForContainer(child));
      } else {
        var childElement = new Element("div", { 'className': 'shape', 'id': child.id });
        
        
        
        childElement.setStyle({
          'float': container.type == 'rows' ? 'none' : 'left',
          'marginLeft': O.margin + ((O.margin + O.width) * (child.prepend || 0)) + "px",
          'marginRight': ((O.margin + O.width) * (child.append || 0)) + "px",
          'width': ((O.margin + O.width) * child.width) - O.margin + "px"
        });
        
        element.insert(childElement);
      }
    });
    
    return element;
  },
  
  getMeasurements: function() {
    return {
      width: this.options.width,
      margin: this.options.margin
    };
  }
}