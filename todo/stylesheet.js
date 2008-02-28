var StylesheetRuleGroup = Class.create({
  initialize: function(name, initializer, options) {
    this.name = name;
    this.options = options || {};
    this.children = [];
    if (initializer) initializer(this);
  },
  
  rule: function(selector, attributes, options) {
    this.children.push(new StylesheetRule(selector, attributes, Object.extend(Object.clone(this.options), options)));
  },
  
  group: function(name, initializer, options) {
    this.children.push(new StylesheetRuleGroup(name, initializer, Object.extend(Object.clone(this.options), options)));
  },
  
  toString: function() {
    return (this.name ? "/* " + this.name + " */\n\n" : "") + this.children.map(function(child) {
      return child.toString();
    }).join(this.options.compact ? "\n" : "\n\n");
  }
});

var StylesheetRule = Class.create({
  initialize: function(selector, attributes, options) {
    this.selector = selector;
    this.attributes = attributes;
    this.options = options || {};
  },
  
  toString: function() {
    var attributes = $H(this.attributes).map(function(attribute) {
      if (attribute.value != null)
        return (this.options.compact ? "" : "  ") + attribute.key.underscore().dasherize() + ": " + attribute.value + ";";
    }.bind(this)).compact();
    
    if (this.options.compact)
      return this.selector + " { " + attributes.join(" ") + " }";
    else
      return this.selector + " {\n" + attributes.join("\n") + "\n}";
  }
});