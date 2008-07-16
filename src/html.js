Plumb.HTML = Class.create({
  initialize: function(index) {
    this.children = [];
  },
  
  element: function() {
    var e = new Plumb.HTML();
    this.children.push(e);
    return e;
  },
  
  html: function(indent) {
    indent = indent || 0;
    var out = "";
    
    for (var i = 0; i < this.children.length; i++) {
      out += " ".times(indent) + Plumb.HTML.ELEMENT.evaluate(this.children[i]) + "\n";
      if (this.children[i].children.length > 0)
        out += this.children[i].html(indent + 2);
      else 
        out += " ".times(indent + 2) + "Lorem ipsum dolor.\n";
      out += " ".times(indent) + "</div>\n";
    }
    
    return out;
  },
  
  css: function(indent) {
    indent = indent || 0;
    var out = "";
    
    for (var i = 0; i < this.children.length; i++) {
      out += Plumb.HTML.CSS.evaluate(Object.extend({indent: " ".times(indent)}, this.children[i]));
      out += "\n\n";
      if (this.children[i].children.length > 0)
        out += this.children[i].css(indent);
    }
    
    return out;
  }
});

Object.extend(Plumb.HTML, {
  ELEMENT: new Template("<div id=\"#{id}\" class=\"#{className}\">"),
  CSS: new Template("#{indent}##{id} {\n#{indent}  width: #{width};\n#{indent}  margin-left: #{marginLeft};\n#{indent}  margin-right: #{marginRight};\n#{indent}}")
});