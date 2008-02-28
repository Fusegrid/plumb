ShapeIdentification = {
  next: 0,
  
  identify: function(shape, id) {
    if (!shape.blankId) {
      shape.blankId = "untitled-" + LetterIdentification.fromNumber(this.next);
      this.next += 1;
    }
    
    var element = shape.down(".identification");
    
    if (!Object.isElement(element)) {
      element = new Element('div', {'class': 'identification'});
      shape.insert(element);
    }
    
    id = Object.isUndefined(id) ? "" : id.strip();
    
    if (id == "") {
      element.innerHTML = "#" + shape.blankId;
      element.addClassName("blank");
      shape.id = "";
    } else {
      element.innerHTML = "#" + id;
      element.removeClassName("blank");
      shape.id = id;
    }
  },
  
  setup: function() {
    $("identification").observe('keydown', function() {
      (function() {
        if (ShapeSelection.selection.length == 1) {
          ShapeIdentification.identify(ShapeSelection.selection[0], $("identification").value);
        }
      }).defer();
    });
  },
  
  update: function() {
    if (ShapeSelection.selection.length == 1) {
      $("identification").enable();
      $("identification").value = ShapeSelection.selection[0].id;
    } else {
      $("identification").disable();
      $("identification").value = "";
    }
  }
}