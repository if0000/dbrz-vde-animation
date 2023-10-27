//
//  Module: dbrzEncoderVDE
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:0.0.1
//
//  Description:
//
//  This is the encoder model. This is a simplified demonstrative implementation, not for production use! If you need a production ready algorithm contact us.
//  This module is responsible to encode the input character stream and depending on the settings provides insight into the current dictionary state.
//  The environment must be able to handle such circumstances, when the input is longer than the possible longest string, solution: chunking the input, next to the preservation of the already built dictionary.
//

class dbrzEncoderVDE {
  constructor() {

    this.acceptedCharacters;
    this.flushDictionary = true;

    this.positonMatchPointer = 0;
    this.distance = 0;

    this.longestMatchingEntry;
    this.temporaryEntry = "";
    this.virtualMode = false;

    this.string = "";
    this.dictionary = [];
    this.dictionaryAux = new Map();
    
  }

  setInputString(input) {

    this.string = input;

  }

  setOutputString() {

  }

  encode() {

    //let temporaryEntry = "";
    let subsEntryUnderInvestigation;
    let j = 0;

    for(let i = 0; i < this.string.length; i++) {

      // Searching for the longest fit in between the primary entries - just like the legacy LZW works, built incrementally to be able decode the encoded input.
      if(!this.virtualMode) {

        if (this.checkPrimaryEntryMatch(this.temporaryEntry + this.string.charAt(i))) {

          this.temporaryEntry = this.temporaryEntry + this.string.charAt(i);
          //#FIXME
          this.logFunction(59, i);

        } else {

          this.longestMatchingEntry = this.temporaryEntry;
          this.positonMatchPointer = this.dictionaryAux.get(this.longestMatchingEntry);
          this.temporaryEntry = this.string.charAt(i);
          //#FIXME
          this.logFunction(67, i);

          // Here we can decide if we should start the virtual word search
          // or we are still in the domain of static part.
          // This shoul highly simplify the virtual part
          if (this.positonMatchPointer < this.acceptedCharacters.length) {

            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
            let nextEntryPos = this.dictionary.length;
            this.dictionary[nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

          } else {

            j = 1;
            this.distance = 1;
            this.virtualMode = true;

          }
        }
      
      // Searching for the available longest fit virtual entry starting from the longest matching primary entry.
      } else {

        // The match is over the static part of the dictionary AND the subsequent entry exists.
        if(this.acceptedCharacters.length <= this.positonMatchPointer && (this.positonMatchPointer + this.distance) < this.dictionary.length) {

          // The end of the subsequent word has NOT been reached yet.
          if (subsEntryUnderInvestigation == undefined) {

            subsEntryUnderInvestigation = this.dictionary[(this.positonMatchPointer + this.distance)];

            i = i - 1;
            this.temporaryEntry = "";

          }

          if (j < subsEntryUnderInvestigation.length) {

            //#FIXME
            console.log('subsEntryUnderInvestigation: ' + subsEntryUnderInvestigation);

            // Match the next character
            if (subsEntryUnderInvestigation.charAt(j) == this.string.charAt(i)) {
              this.temporaryEntry = this.temporaryEntry + this.string.charAt(i);

              //#FIXME
              this.logFunction(114, i);

              j = j + 1;

            // No more match:
            } else {

              this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;

              let nextEntryPos = this.dictionary.length;
              this.dictionary[nextEntryPos] = this.longestMatchingEntry;
              this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

              //#FIXME
              this.logFunction(128, i);

              this.longestMatchingEntry = "";
              this.temporaryEntry = "";

              i = i - j + 1;

              this.distance = 0;
              this.virtualMode = false;

            }

          // The end of the subsequent word has already been reached.
          // Check the next subsequent primary entry.
          } else {

            this.logFunction(144, i);
            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
            this.temporaryEntry = this.string.charAt(i);
            j = 1;
            this.distance = this.distance + 1;
            subsEntryUnderInvestigation = undefined;
            //#FIXME
            this.logFunction(150, i);

          }

        // No more subsequent primary entries to check
        } else {

          i = i - j;

          this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt((i));
          let nextEntryPos = this.dictionary.length;
          this.dictionary[nextEntryPos] = this.longestMatchingEntry;
          this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);
          //#FIXME
          this.logFunction(164, i);
          
          this.longestMatchingEntry = "";
          this.temporaryEntry = "";

          i = i - 1;

          this.distance = 0;
          this.virtualMode = false;

        }
      }
    }
  }

  logFunction(position, counter) {
    console.log('                                  logline: ' + position);
    console.log('i: ' + counter);
    console.log('String progress: ' + this.string.slice(0,(counter + 1)));
    console.log('this.temporaryEntry: ' + this.temporaryEntry);
    console.log('this.longestMatchingEntry: ' + this.longestMatchingEntry);
    console.log('this.positonMatchPointer: ' + this.positonMatchPointer);
    console.log('Dictionary: ' + this.dictionary);
    console.log('');
  }

  checkPrimaryEntryMatch(wordToCheck) {

    return this.dictionaryAux.has(wordToCheck);

  }

  //Simplified: for the sake of simplicity those "bytes" which are out of the set will be skipped during processing
  initDictionary(acceptedChars) {

    if (acceptedChars.length == 0) {

      this.acceptedCharacters = "0123456789aábcdeéfghiíjklmnoópqrstuúüűvwxyzAÁBCDEÉFGHIÍJKLMNOÓPQRSTUÚÜŰVWXYZ ,.!\"'-@\n";


    } else {

      this.acceptedCharacters = acceptedChars;

    }

    for(let i = 0; i < this.acceptedCharacters.length; i++) {

      this.dictionaryAux.set(this.acceptedCharacters.charAt(i), i);
      this.dictionary[i] = this.acceptedCharacters.charAt(i);

    }
  }

  flushDictionary() {

  }

  rearrangeDictionary() {

  }

}

const dbrzEVDE = new dbrzEncoderVDE();
dbrzEVDE.initDictionary("");
//dbrzEVDE.setInputString("text to be encoded text to be encoded");
dbrzEVDE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
//dbrzEVDE.setInputString("text to be encoded");
dbrzEVDE.encode();