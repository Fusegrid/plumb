LetterIdentification = {
  letters: $R("a", "z").toArray(),
  
  fromNumber: function(number) {
    if (!Object.isNumber(number)) throw ArgumentError;
    
    if (number < 26)
      return this.letters[number % 26];
    else
      return this.fromNumber(Math.floor(number / 26) - 1) + this.letters[number % 26];
  }
}

var ArgumentError = new Error();
ArgumentError.name = "ArgumentError";