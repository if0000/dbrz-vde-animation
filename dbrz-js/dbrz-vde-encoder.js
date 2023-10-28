//
//  Module: dbrzEncoderVDE
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:1.0.0
//
//  Description:
//
//  This is the encoder model. This is a simplified demonstrative implementation, not for production use! If you need a production ready algorithm contact us.
//  This module is responsible to encode the input character stream and depending on the settings provides insight into the current dictionary state.
//  This implementation allows multiple occurence of that entries which are the result of virtual composition.
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
    this.progressCounter = 0;

    this.dictionary = [];
    this.dictionaryAux = new Map();

    this.relativeDist = -1;
    this.encodedId = -1;
    
  }

  setInputString(input) {

    this.string = input;

  }

  setOutputString() {

  }

  encode() {

    let subsEntryUnderInvestigation;
    let j = 0;

    for(this.progressCounter = 0; this.progressCounter < this.string.length; this.progressCounter++) {

      // Searching for the longest fit in between the primary entries - just like the legacy LZW works, built incrementally to be able decode the encoded input.
      if(!this.virtualMode) {

        if (this.checkPrimaryEntryMatch(this.temporaryEntry + this.string.charAt(this.progressCounter))) {

          this.temporaryEntry = this.temporaryEntry + this.string.charAt(this.progressCounter);

          this.monitorFunction("01 - Primary entry match.");

        } else {

          this.monitorFunction("02 - One character longer than the longest primary entry.");

          this.longestMatchingEntry = this.temporaryEntry;
          this.positonMatchPointer = this.dictionaryAux.get(this.longestMatchingEntry);
          this.temporaryEntry = this.string.charAt(this.progressCounter);

          this.monitorFunction("03 - Before decide if the domain is still the static part of the dictionary or the dynamic one.");

          // Here we can decide if we should start the virtual word search
          // or we are still in the domain of static part.
          // This shoul highly simplify the virtual part
          if (this.positonMatchPointer < this.acceptedCharacters.length) {

            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
            let nextEntryPos = this.dictionary.length;
            this.dictionary[nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

            this.encodedId = this.positonMatchPointer;

            this.monitorFunction("04 - Static part: two letters long word is written into the dictionary.");

          } else {

            j = 1;
            this.distance = 1;
            this.virtualMode = true;

          }
        }
      
      // Searching for the available longest fit virtual entry starting from the longest matching primary entry.
      } else {

        // The match is over the static part of the dictionary AND the subsequent entry exists.
        if((this.positonMatchPointer + this.distance) < this.dictionary.length) {

          // The end of the subsequent word has NOT been reached yet.
          if (subsEntryUnderInvestigation == undefined) {

            subsEntryUnderInvestigation = this.dictionary[(this.positonMatchPointer + this.distance)];

            this.progressCounter = this.progressCounter - 1;
            this.temporaryEntry = "";

          }

          if (j < subsEntryUnderInvestigation.length) {

            //#FIXME
            console.log('subsEntryUnderInvestigation: ' + subsEntryUnderInvestigation);
            
            this.temporaryEntry = this.temporaryEntry + this.string.charAt(this.progressCounter);
            // Match the next character
            if (subsEntryUnderInvestigation.charAt(j) == this.string.charAt(this.progressCounter)) {

              this.monitorFunction("05 - Character match during the examination of chaining of subsequent primary words.");

              j = j + 1;

            // No more match:
            } else {

              this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;

              let nextEntryPos = this.dictionary.length;
              this.dictionary[nextEntryPos] = this.longestMatchingEntry;
              this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

              this.calculateVirtualIndex();

              this.monitorFunction("06 - No more character match during virtual word composition. Index issue and dictionary update.");

              this.longestMatchingEntry = "";
              this.temporaryEntry = this.string.charAt(this.progressCounter);
              subsEntryUnderInvestigation = undefined;

              this.progressCounter = this.progressCounter - j + 1;

              this.distance = 0;
              this.virtualMode = false;

            }

          // The end of the subsequent word has already been reached.
          // Check the next subsequent primary entry.
          } else {

            this.monitorFunction("07 - End of a subsequent word with full match. Setup the check for the next one.");

            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
            this.temporaryEntry = this.string.charAt(this.progressCounter);
            j = 1;
            this.distance = this.distance + 1;
            subsEntryUnderInvestigation = undefined;

            this.monitorFunction("08 - State after setup.");

          }

        // No more subsequent primary entries to check
        } else {

          this.progressCounter = (this.progressCounter - j);

          this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt((this.progressCounter));
          let nextEntryPos = this.dictionary.length;
          this.dictionary[nextEntryPos] = this.longestMatchingEntry;
          this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

          this.calculateVirtualIndex();

          this.monitorFunction("09 - No more possibility to chaining, since no more primary entries in the dictionary.");
          
          this.longestMatchingEntry = "";
          this.temporaryEntry = this.string.charAt(this.progressCounter);
          subsEntryUnderInvestigation = undefined;

          this.distance = 0;
          this.virtualMode = false;

        }
      }

      // End of the input string: the internal states has to be examined for proper handling.
      if(this.progressCounter == (this.string.length - 1)) {
        if(this.longestMatchingEntry != "") {
          this.progressCounter = (this.progressCounter - j);

          this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt((this.progressCounter));
          let nextEntryPos = this.dictionary.length;
          this.dictionary[nextEntryPos] = this.longestMatchingEntry;
          this.dictionaryAux.set(this.longestMatchingEntry, nextEntryPos);

          this.calculateVirtualIndex();

          this.monitorFunction("10 - End of string but the state variables are still not empty.");
          
          this.longestMatchingEntry = "";
          this.temporaryEntry = this.string.charAt(this.progressCounter);
          subsEntryUnderInvestigation = undefined;

          this.distance = 0;
          this.virtualMode = false;
        }
      }
    }
  }

  //#NOTE - 20231028: Transform it to consume json configuration instead
  monitorFunction(remark) {
    console.log('                                  ' + remark);
    console.log('progressCounter: ' + this.progressCounter);
    console.log('input progress: ' + this.string.slice(0,(this.progressCounter + 1)));
    console.log('temporaryEntry: ' + this.temporaryEntry);
    console.log('longestMatchingEntry: ' + this.longestMatchingEntry);
    console.log('positonMatchPointer: ' + this.positonMatchPointer);
    console.log('encodedId: ' + this.encodedId);
    console.log('dictionary: ' + this.dictionary);
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

  calculateVirtualIndex() {
    this.relativeDist = this.positonMatchPointer + this.distance - 1 - (this.acceptedCharacters.length);
    this.encodedId = ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.distance + (this.acceptedCharacters.length - 1);
  }

  flushDictionary() {

  }

  rearrangeDictionary() {

  }

}

const dbrzEVDE = new dbrzEncoderVDE();
dbrzEVDE.initDictionary("");
//dbrzEVDE.setInputString("text to be encoded text to be encoded text to be encoded text to be encoded");
dbrzEVDE.setInputString("text to be encoded text to be encoded");
//dbrzEVDE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
//dbrzEVDE.setInputString("text to be encoded");
dbrzEVDE.encode();