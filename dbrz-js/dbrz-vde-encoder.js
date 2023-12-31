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
//

class dbrzVDEEncoder {
  constructor() {

    this.dictDynSize = 128;
    this.allowedMaxVirtualExtent = 128;
    this.calcState = 0;

    //
    //  Event listener should be attached once, even if reset takes place.
    //
    this.elementResetEventAttached = document.getElementById("dbrzResetInitLoadBtn");
    this.elementResetEventAttached.addEventListener("click", () => {
      this.resetWithNewInput();
    });

    this.elementEventAttached = document.getElementById("dbrzPlayPauseBtn");
    this.elementEventAttached.addEventListener("click", () => {
      if(typeof this.outsourcedResolve === "function") {
        this.stepBystep = !this.stepBystep;
        this.outsourcedResolve("Resolved");
      } 
    });

    this.elementAutomaticSpeed = document.getElementById("dbrzAutomaticSpeed");

    this.elementDictSize = document.getElementById("dbrzDictSize");
    this.elementDictSizeDisp = document.getElementById("dbrzDictSizeDispVal");

    this.elementVirtExt = document.getElementById("dbrzMaxVirtExt");
    this.elementVirtExt.min = 0;
    this.elementVirtExt.max = 128;
    this.elementVirtExt.value = 128;

    this.elementVirtExtDisp = document.getElementById("dbrzAllMaxDispVal");

    this.elementDictSize.addEventListener("change", () => {
                                                            this.elementDictSizeDisp.innerHTML = this.elementDictSize.value;
                                                            //
                                                            //  Implementation of the Linear Growth Distance (LGD) functionality.
                                                            //  Alignment of the extent of virtual extension to prevent values greater than the size of the dictionary.
                                                            //
                                                            if(Number(this.elementVirtExt.value) > Number(this.elementDictSize.value)) {
                                                              this.elementVirtExt.max = Number(this.elementDictSize.value);
                                                              this.elementVirtExt.value = Number(this.elementDictSize.value);
                                                              this.elementVirtExtDisp.innerHTML = this.elementVirtExt.value;
                                                            } else {
                                                              this.elementVirtExt.max = Number(this.elementDictSize.value);
                                                            }
                                                            
                                                          });

    this.elementVirtExt.addEventListener("change", () => {
                                                            this.elementVirtExtDisp.innerHTML = this.elementVirtExt.value;
                                                         });

    
    this.elemntInputField = document.getElementById("dbrzVDEPresentationInputField");

    this.listOfObservedValues = new Map();
    this.presetObservables();

    this.encoderPartialReset()
  }


  resetWithNewInput() {
    this.dictDynSize = Number(this.elementDictSize.value);
    this.allowedMaxVirtualExtent = Number(this.elementVirtExt.value);
    this.encoderPartialReset();
    this.initDictionary("");
    this.setInputString(this.elemntInputField.value);
    this.checkpointDescription = "00 - Initialized with the given input and settings. To start processing press the play button";
    this.notifySubs(['checkpointDescription']);

    this.notifySubs(['dictDynSize', 'allowedMaxVirtualExtent']);

    this.encodeController();
  }

  //
  // Preserves the already subscribed subscribers.
  // Besides that everything else is cleared.
  //
  encoderPartialReset() {

    this.acceptedCharacters;

    this.positonMatchPointer = 0;
    this.distance = 0;

    this.longestMatchingEntry;
    this.temporaryEntry = "";
    this.dynamicEntry = "";
    this.virtualMode = false;

    this.checkpointDescription = "";

    this.string = "";
    this.progressCounter = 0;

    this.nextEntryPos = 0;
    this.dictionary = [];
    this.dictionaryAux = new Map();
    
    this.checkpointDescription = "00 - Initialized with the given input and settings. Now you are in the step-by-step mode. For further processing press the play button";
    this.notifySubs(['checkpointDescription', 'reset']);

    this.relativeDist = -1;
    this.encodedId = -1;

    if(this.timerId != undefined) {
      clearTimeout(this.timerId);
    }
    this.timerId = undefined;

    this.stepBystep = true;

    this.j = 0;
    this.subsEntryUnderInvestigation = undefined;
  }


  setInputString(input) {

    this.string = input.replace(/[^0-9a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\.\s,!\"\'\-\+\*\@\(\)\[\]]/g, "");
    this.notifySubs(["string"]);

  }


  async encodeController() {

    for(this.progressCounter = 0; this.progressCounter < this.string.length; this.progressCounter++) {
      if(this.stepBystep) {
        await new Promise((resolve, reject) => {this.outsourcedResolve = resolve;});
        this.encodeInAsyncEnv();
      } else {
        await new Promise((resolve, reject) => {this.timerId = setTimeout(resolve, (this.elementAutomaticSpeed.max - this.elementAutomaticSpeed.value))});
        this.encodeInAsyncEnv();
      }
    }
  }


  encodeInAsyncEnv() {
    //
    //  Normal mode
    //  Searching for the longest fit in between the primary entries - just like the legacy LZW works, built incrementally to be able decode the encoded input.
    //
    if(!this.virtualMode) {

      if (this.checkPrimaryEntryMatch(this.temporaryEntry + this.string.charAt(this.progressCounter))) {

        this.temporaryEntry = this.temporaryEntry + this.string.charAt(this.progressCounter);

        this.checkpointDescription = "01 - Primary entry match.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

      } else {

        this.checkpointDescription = "02 - One character longer than the longest primary entry.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        this.longestMatchingEntry = this.temporaryEntry;
        this.positonMatchPointer = this.dictionaryAux.get(this.longestMatchingEntry);
        this.temporaryEntry = this.string.charAt(this.progressCounter);

        this.checkpointDescription = "03 - Before decide if the domain is still the static part of the dictionary or the dynamic one.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        //
        //  Here we can decide if we should start the virtual word search
        //  or we are still in the domain of static part.
        //  This should highly simplify the virtual part
        //
        if (this.positonMatchPointer < this.acceptedCharacters.length) {

          this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;


          if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

            //
            // Implementation of the limited dictionary size
            //
            if(this.dictionary.length < (this.dictDynSize + this.acceptedCharacters.length)) {
              this.nextEntryPos = this.dictionary.length;
              this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
              this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);
              this.dynamicEntry = this.longestMatchingEntry;
              this.notifySubs(['dynamicEntry']);
            }

          }

          this.encodedId = this.positonMatchPointer;

          this.checkpointDescription = "04 - Static part: two letters long word is written into the dictionary.";
          this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

          this.longestEntryFound = this.longestMatchingEntry;
          this.notifySubs(['longestEntryFound']);

          this.encodedId = -1;

        } else {

          this.j = 1;
          this.distance = 1;
          this.virtualMode = true;

        }
      }
    
    //
    //  Searching for the available longest fit virtual entry starting from the longest matching primary entry.
    //
    } else {

      //
      //  The match is over the static part of the dictionary AND the subsequent entry exists.
      //  The '&&  (this.distance < this.allowedMaxVirtualExtent)' condition is the implementation of the Linear Growth Distance (LGD) functionality, which serves as a good basis for ML, QC or any other multi dimensional based optimization procedure inline with dictionary restructing, dictionary flushing, extension positioning, etc.
      //
      if(((this.positonMatchPointer + this.distance) < this.dictionary.length) &&  (this.distance < this.allowedMaxVirtualExtent)) {

        //
        //  The end of the subsequent word has NOT been reached yet.
        //
        if (this.subsEntryUnderInvestigation == undefined) {

          this.subsEntryUnderInvestigation = this.dictionary[(this.positonMatchPointer + this.distance)];

          this.progressCounter = this.progressCounter - 1;
          this.temporaryEntry = "";

        }

        if (this.j < this.subsEntryUnderInvestigation.length) {
          
          this.temporaryEntry = this.temporaryEntry + this.string.charAt(this.progressCounter);

          //
          // Match the next character
          //
          if (this.subsEntryUnderInvestigation.charAt(this.j) == this.string.charAt(this.progressCounter)) {

            this.checkpointDescription = "05 - Character match during the examination of chaining of subsequent primary words.";
            this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

            this.j = this.j + 1;

          //
          // No more match:
          //
          } else {

            this.progressCounter = this.progressCounter - this.j + 1
            this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt(this.progressCounter);
            this.temporaryEntry = this.string.charAt(this.progressCounter);

            if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

              //
              // Implementation of the limited dictionary size
              //
              if(this.dictionary.length < (this.dictDynSize + this.acceptedCharacters.length)) {
                this.nextEntryPos = this.dictionary.length;
                this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
                this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);

                this.dynamicEntry = this.longestMatchingEntry;
                this.notifySubs(['dynamicEntry']);
              }

              this.distance = (this.distance - 1);
              //
              //Mixed mode calc alignment aid
              //
              this.calcState = 6;
              this.calculateVirtualIndex();
              this.calcState = 0;

              this.checkpointDescription = "06 - No more character match during virtual word composition. Index issue and dictionary update.";
              this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);
  
              this.longestEntryFound = this.longestMatchingEntry;
              this.notifySubs(['longestEntryFound']);
  
              this.encodedId = -1;
  
              this.longestMatchingEntry = "";
              this.subsEntryUnderInvestigation = undefined;
  
              this.distance = 0;
              this.virtualMode = false;
  
            } else {
              // 
              //  It is provided here that temporaryEntry holds the required string without loss.
              //
              //  SIMPLE SOLUTION: 
              //    In case of this situation takes place it means that finally - after the primary, then composite virtual construction - a 'very long' (a.k.a. constructed) primary entry has been found.
              //    This is good. It may happen that this preceeds or succeeds the original positionMatchPointer. Whatever the situation is it can be handled in that way as it would be just a simple primary entry found so far:
              //     - the entire composed word so far has to be passed to this.temporaryEntry,
              //     - every virtual mode related settings have to be reseted (this.virtualMode, this.j, this.distance, this.subsEntryUnderInvestigation, etc),
              //     - proper settings of the progressCounter,
              //     - continue the searching for an even longer match.
              //
              this.temporaryEntry = this.longestMatchingEntry;

              this.subsEntryUnderInvestigation = undefined;
  
              this.distance = 0;
              this.virtualMode = false;
            }

          }

        //
        // The end of the subsequent word has already been reached.
        // Check the next subsequent primary entry.
        //
        } else {

          this.checkpointDescription = "07 - End of a subsequent word with full match. Setup to check for the next one.";
          this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

          this.longestMatchingEntry = this.longestMatchingEntry + this.temporaryEntry;
          this.temporaryEntry = this.string.charAt(this.progressCounter);
          this.j = 1;
          this.distance = this.distance + 1;
          this.subsEntryUnderInvestigation = undefined;

          this.checkpointDescription = "08 - State after setup.";
          this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        }

      //
      // No more subsequent primary entries to check
      //
      } else {

        this.progressCounter = (this.progressCounter - this.j);

        this.longestMatchingEntry = this.longestMatchingEntry + this.string.charAt((this.progressCounter));

        if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

          //
          // Implementation of the limited dictionary size
          //
          if(this.dictionary.length < (this.dictDynSize + this.acceptedCharacters.length)) {
            this.nextEntryPos = this.dictionary.length;
            this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);
            this.dynamicEntry = this.longestMatchingEntry;
            this.notifySubs(['dynamicEntry']);
          }

        }

        //
        //Mixed mode calc alignment aid
        //
        this.calcState = 9;
        this.calculateVirtualIndex();
        this.calcState = 0;

        this.checkpointDescription = "09 - No more possibility to chaining, since no more primary entries in the dictionary.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        this.longestEntryFound = this.longestMatchingEntry;
        this.notifySubs(['longestEntryFound']);

        this.encodedId = -1;
        
        this.longestMatchingEntry = "";
        this.temporaryEntry = this.string.charAt(this.progressCounter);
        this.subsEntryUnderInvestigation = undefined;

        this.distance = 0;
        this.virtualMode = false;

      }
    }

    //
    // End of the input string: the internal states has to be examined for proper handling.
    //
    if(this.progressCounter == (this.string.length - 1)) {

      if(this.longestMatchingEntry.length != 0) {

        if(1 < this.j) {
          this.progressCounter = (this.progressCounter - this.j + 1);
        } else {
          this.progressCounter = (this.progressCounter - this.j);
        }

        this.checkpointDescription = "10 - End of string but the state variables are not empty - after progressCounter change.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        if(!this.dictionaryAux.has(this.longestMatchingEntry)) {

          //
          // Implementation of the limited dictionary size
          //
          if(this.dictionary.length < (this.dictDynSize + this.acceptedCharacters.length)) {
            this.nextEntryPos = this.dictionary.length;
            this.dictionary[this.nextEntryPos] = this.longestMatchingEntry;
            this.dictionaryAux.set(this.longestMatchingEntry, this.nextEntryPos);

            this.dynamicEntry = this.longestMatchingEntry;
            this.notifySubs(['dynamicEntry']);
          }

        }

        //
        // Mixed mode calc alignment aid
        //
        this.calcState = 11;
        this.calculateVirtualIndex();
        this.calcState = 0;

        this.checkpointDescription = "11 - End of string but the state variables are not empty - after first swap and index calculation.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

        this.longestEntryFound = this.longestMatchingEntry;
        this.notifySubs(['longestEntryFound']);

        this.encodedId = -1;
        
        this.longestMatchingEntry = "";
        this.temporaryEntry = this.string.charAt(this.progressCounter);
        this.subsEntryUnderInvestigation = undefined;

        this.distance = 0;
        this.virtualMode = false;

        this.checkpointDescription = "12 - End of string but the state variables are not empty - after second swap.";
        this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

      } else {

        if( this.temporaryEntry != 0 ) {

          this.checkpointDescription = "13 - End of string but the state variables are not empty";
          this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

          this.positonMatchPointer = this.dictionaryAux.get(this.temporaryEntry);
          //
          // Mixed mode calc alignment aid
          //
          this.calcState = 14;
          this.calculateVirtualIndex();
          this.calcState = 0;

          this.temporaryEntry = "";

          this.checkpointDescription = "14 - End of string and everything is empty. To restart press the 'Feed the encoder' button.";
          this.notifySubs(['checkpointDescription', 'progressCounter', 'distance', 'temporaryEntry', 'longestMatchingEntry', 'positionMatchPointer', 'encodedId']);

          this.encodedId = -1;

        } else {

          //exit(0);

        }
      }
    }
  }

  
  checkPrimaryEntryMatch(wordToCheck) {

    return this.dictionaryAux.has(wordToCheck);

  }


  //
  // Simplified: for the sake of simplicity those "bytes" which are out of the set will be skipped during processing
  //
  initDictionary(acceptedChars) {

    if (acceptedChars.length == 0) {

      this.acceptedCharacters = "0123456789aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyzAÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ ,.!\"'-+*@\t\n\r\(\)\[\]";

    } else {

      this.acceptedCharacters = acceptedChars;

    }

    for(let i = 0; i < this.acceptedCharacters.length; i++) {

      this.dictionaryAux.set(this.acceptedCharacters.charAt(i), i);
      this.dictionary[i] = this.acceptedCharacters.charAt(i);

    }

    this.notifySubs(["dictionary"]);
  }


  calculateVirtualIndex() {

    //
    // I. No virtual index calculation needed, pure LZW mode.
    //
    if(this.allowedMaxVirtualExtent == 0) {

      this.encodedId = this.positonMatchPointer;

    } else {

      this.relativeDist = this.positonMatchPointer + this.distance - this.acceptedCharacters.length;

      //
      // II. Pure VDE mode.
      //
      if(this.allowedMaxVirtualExtent == this.dictDynSize) {

        if(this.positonMatchPointer < this.acceptedCharacters.length) {
        
          this.encodedId = this.positonMatchPointer;
  
        } else {

          this.encodedId = this.acceptedCharacters.length + ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.distance;

        }

      //
      // III. Mixed mode.
      //
      //      0 < this.allowedMaxVirtualExtent < this.dictDynSize
      //
      } else {

        //
        //  #FIXME - From here the examination of calcState could be desired, since might require this.distance alignment
        //

        //
        // III.1 - Pure VDE mode.
        //
        if(this.relativeDist < this.allowedMaxVirtualExtent) {

          if(this.positonMatchPointer < this.acceptedCharacters.length) {
        
            this.encodedId = this.positonMatchPointer;
    
          } else {
  
            this.encodedId = this.acceptedCharacters.length + ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.distance;
  
          }

        }
        //
        // III.2 - Still pure VDE mode
        //
        if(this.relativeDist == this.allowedMaxVirtualExtent) {

          this.encodedId = this.acceptedCharacters.length + ((this.relativeDist * (this.relativeDist + 1)) / 2) + this.distance;

        }
        //
        // III.3 - Mixed mode: up to this.acceptedCharacters.length behaves just like VDE. Over that range it turns to a multiplication. 
        //
        if(this.relativeDist > this.allowedMaxVirtualExtent) {

          let overRange = this.relativeDist - this.allowedMaxVirtualExtent;
          this.encodedId = this.acceptedCharacters.length + ((this.allowedMaxVirtualExtent *  (this.allowedMaxVirtualExtent + 1)) / 2) + (overRange * this.allowedMaxVirtualExtent) + this.distance;

        }

      }
    }
  }


  rearrangeDictionary() {

  }


  presetObservables() {

    this.listOfObservedValues.set('reset', new Set());
    this.listOfObservedValues.set('dictDynSize', new Set());
    this.listOfObservedValues.set('allowedMaxVirtualExtent', new Set());
    this.listOfObservedValues.set('checkpointDescription', new Set());
    this.listOfObservedValues.set('progressCounter', new Set());
    this.listOfObservedValues.set('string', new Set());
    this.listOfObservedValues.set('distance', new Set());
    this.listOfObservedValues.set('temporaryEntry', new Set());
    this.listOfObservedValues.set('longestMatchingEntry', new Set());
    this.listOfObservedValues.set('positionMatchPointer', new Set());
    this.listOfObservedValues.set('encodedId', new Set());
    this.listOfObservedValues.set('dictionary', new Set());
    this.listOfObservedValues.set('dynamicEntry', new Set());
    this.listOfObservedValues.set('longestEntryFound', new Set());
  }

  //
  //  Part of the Observer - external IF
  //
  subscribe(topic, subscriber) {

    if(this.listOfObservedValues.has(topic)) {

      this.listOfObservedValues.get(topic).add(subscriber);
      return 0;

    } else {

      //
      //  There is not such topic to subscribe on.
      //
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

      //
      //  There is not such topic to unsubscribe from.
      //
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

//export {dbrzVDEEncoder}