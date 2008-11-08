Object.extend(Number.prototype, {
  toLetters: function() {
    if (isNaN(this)
      return "";
    else if (this < 26)
      return String.fromCharCode((this % 26) + 97);
    else
      return (Math.floor(this / 26) - 1).toLetters() + String.fromCharCode((this % 26) + 97);
  }
});