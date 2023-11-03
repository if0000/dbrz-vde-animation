//
//  Module: dbrzVDEEncoder
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:1.0.0
//
//  Description:
//
//  This is the encoder model. This is a simplified demonstrative implementation, not for production use! If you need a production ready algorithm contact us.
//  This module is responsible to encode the input character stream and depending on the settings provides insight into the current dictionary state in an Observer pattern like manner (one can subscribe for different measured values and states).
//  This implementation allows multiple occurence of that entries which are the result of virtual composition.
//  The environment must be able to handle such circumstances, when the input is longer than the possible longest string, solution: chunking the input, next to the preservation of the already built dictionary.
//

class dbrzVDEEncoder {
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
    this.progressString = "";

    this.nextEntryPos = 0;
    this.dictionary = [];
    this.dictionaryAux = new Map();

    this.relativeDist = -1;
    this.encodedId = -1;

    this.listOfObservedValues = new Map();
    this.presetObservables();
    
  }

  setInputString(input) {

    this.string = input;
    
    this.notifySubs(["string"]);

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

          this.checkpointDescription = "01 - Primary entry match.";
          this.notifySubs("");

        } else {

          this.checkpointDescription = "02 - One character longer than the longest primary entry.";
          this.notifySubs("");

          this.longestMatchingEntry = this.temporaryEntry;
          this.positonMatchPointer = this.dictionaryAux.get(this.longestMatchingEntry);
          this.temporaryEntry = this.string.charAt(this.progressCounter);

          this.checkpointDescription = "03 - Before decide if the domain is still the static part of the dictionary or the dynamic one.";
          this.notifySubs("");

          // Here we can decide if we should start the virtual word search
          // or we are still in the domain of static part.
          // This shoul highly simplify the virtual part
          if (this.positonMatchPointer < this.acceptedCharacters.length) {

            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;


          if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

            this.nextEntryPos = this.dictionary.length;
            this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);

          }

            this.encodedId = this.positonMatchPointer;

            this.checkpointDescription = "04 - Static part: two letters long word is written into the dictionary.";
            this.notifySubs("");

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
            
            this.temporaryEntry = this.temporaryEntry + this.string.charAt(this.progressCounter);
            // Match the next character
            if (subsEntryUnderInvestigation.charAt(j) == this.string.charAt(this.progressCounter)) {

              this.checkpointDescription = "05 - Character match during the examination of chaining of subsequent primary words.";
              this.notifySubs("");

              j = j + 1;

            // No more match:
            } else {

              this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;

              if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

                this.nextEntryPos = this.dictionary.length;
                this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
                this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);
    
              }

              this.calculateVirtualIndex();

              this.checkpointDescription = "06 - No more character match during virtual word composition. Index issue and dictionary update.";
              this.notifySubs("");

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

            this.checkpointDescription = "07 - End of a subsequent word with full match. Setup to check for the next one.";
            this.notifySubs("");

            this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
            this.temporaryEntry = this.string.charAt(this.progressCounter);
            j = 1;
            this.distance = this.distance + 1;
            subsEntryUnderInvestigation = undefined;

            this.checkpointDescription = "08 - State after setup.";
            this.notifySubs("");

          }

        // No more subsequent primary entries to check
        } else {

          this.progressCounter = (this.progressCounter - j);

          this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt((this.progressCounter));

          if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

            this.nextEntryPos = this.dictionary.length;
            this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);

          }

          this.calculateVirtualIndex();

          this.checkpointDescription = "09 - No more possibility to chaining, since no more primary entries in the dictionary.";
          this.notifySubs("");
          
          this.longestMatchingEntry = "";
          this.temporaryEntry = this.string.charAt(this.progressCounter);
          subsEntryUnderInvestigation = undefined;

          this.distance = 0;
          this.virtualMode = false;

        }
      }

      // End of the input string: the internal states has to be examined for proper handling.
      if(this.progressCounter == (this.string.length - 1)) {

        if(this.longestMatchingEntry.length != 0) {

          if(1 < j) {
            this.progressCounter = (this.progressCounter - j + 1);
          } else {
            this.progressCounter = (this.progressCounter - j);
          }

          this.checkpointDescription = "10 - End of string but the state variables are not empty - after progressCounter change.";
          this.notifySubs("");

          if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

            this.nextEntryPos = this.dictionary.length;
            this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);

          }

          this.calculateVirtualIndex();

          this.checkpointDescription = "11 - End of string but the state variables are not empty - after first swap and index calculation.";
          this.notifySubs("");
          
          this.longestMatchingEntry = "";
          this.temporaryEntry = this.string.charAt(this.progressCounter);
          subsEntryUnderInvestigation = undefined;

          this.distance = 0;
          this.virtualMode = false;

          this.checkpointDescription = "12 - End of string but the state variables are not empty - after second swap.";
          this.notifySubs("");

        } else {

          if( this.temporaryEntry != 0 ) {

            this.checkpointDescription = "13 - End of string but the state variables are not empty";
            this.notifySubs("");

            this.positonMatchPointer = this.dictionaryAux.get(this.temporaryEntry);
            this.calculateVirtualIndex();

            this.temporaryEntry = "";

            this.checkpointDescription = "14 - End of string and everything is empty";
            this.notifySubs("");

          } else {

            exit(0);

          }
        }
      }
    }
  }

  //#NOTE - 20231028: Transform it to consume json configuration instead
  monitorFunction(remark) {

    console.log('                                  ' + remark);

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

    if(this.distance == 0) {

      if(this.positonMatchPointer < this.acceptedCharacters.length) {
        
        this.encodedId = this.positonMatchPointer;

      } else {

        this.relativeDist = this.positonMatchPointer - this.acceptedCharacters.length;
        this.encodedId = ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.acceptedCharacters.length - 1;

      }

    } else {

      this.relativeDist = this.positonMatchPointer + this.distance - this.acceptedCharacters.length;
      this.encodedId = ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.distance + this.acceptedCharacters.length - 1;

    }
  }

  flushDictionary() {

  }

  rearrangeDictionary() {

  }

  presetObservables() {

    this.listOfObservedValues.set('checkpointDescription', new Set());
    this.listOfObservedValues.set('progressCounter', new Set());
    this.listOfObservedValues.set('string', new Set());
    this.listOfObservedValues.set('distance', new Set());
    this.listOfObservedValues.set('temporaryEntry', new Set());
    this.listOfObservedValues.set('longestMatchingEntry', new Set());
    this.listOfObservedValues.set('positionMatchPointer', new Set());
    this.listOfObservedValues.set('encodedId', new Set());
    this.listOfObservedValues.set('dictionary', new Set());
  }

  //
  //  Part of the Observer - external IF
  //
  subscribe(topic, subscriber) {
    if(this.listOfObservedValues.has(topic)) {
      this.listOfObservedValues.get(topic).add(subscriber);
      return 0;
    } else {
      //There is not such topic to subscribe on.
      return -1;
    }
  }

  //
  //  Part of the Observer - external IF
  //
  unsubscribe(topic, subscriber) {
    if(this.listOfObservedValues.has(topic)) {
      if(this.listOfObservedValues.get(topic).has(subscriber)) {
        this.listOfObservedValues.get(topic).delete(subscriber);
        return 0;
      } else {
        return -1;  
      }
    } else {
      //There is not such topic to unsubscribe from.
      return -1;
    }
  }

  //
  //  Part of the Observer - internal IF
  //  Possible to filter to which topics are observed at the given check point.
  //
  notifySubs(filterSetParams) {
    let filterSet;
    if("" != filterSetParams) {
      filterSet = new Set(filterSetParams);
    } else {
      filterSet = new Set(['checkpointDescription', 'progressCounter', 'string', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId', 'dictionary']);
    }

    for (const mapEntry of this.listOfObservedValues.entries()) {
      if(filterSet.has(mapEntry[0])) {
        if(mapEntry[1].size > 0) {
          for (const setEntry of mapEntry[1]) {
            setEntry.update(mapEntry[0], this[mapEntry[0]]);
          }
        }
      }
    }
  }

}

//export default dbrzVDEEncoder
export {dbrzVDEEncoder}

//const dbrzVDEE = new dbrzVDEEncoder();
//dbrzVDEE.initDictionary("");
//dbrzVDEE.setInputString("text to be encoded text to be encoded text to be encoded text to be encoded");
//dbrzVDEE.setInputString("text to be encoded text to be encoded");
//dbrzVDEE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
//dbrzVDEE.setInputString("text to be encoded");
//dbrzVDEE.encode();