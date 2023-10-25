//
//  Module: dbrzEncoderVDE
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:0.0.1
//
//  Description:
//
//  This is the encoder model.
//  This module is responsible to encode the input character stream and depending on the settings provides insight into the current dictionary state.
//  The environment must be able to handle such circumstances, when the input is longer than the possible longest string, solution: chunking the input, next to the preservation of the already built dictionary.
//

class dbrzEncoderVDE {
  constructor() {
    this.flushDictionary = true;

    this.positonMatchPointer = 0;
    //this.positonMatchStartPointer = 0;
    //this.positonMatchStopPointer = 0;
    //this.characterMatchPointer = 0;

    this.lastPrimaryEntry;
    this.lastVirtualEntry;
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
    let temporaryEntry;
    let subsEntryUnderInvestigation;
    for(let i = 0; i < this.string.length; i++) {
      if(this.virtualMode) {
        // The match is over the static part of the dictionary
        if(acceptedCharacters.length <= this.positonMatchPointer) {
          // The end of the subsequent word has NOT been reached yet.
          if () {
            if (checkPrimaryEntryMatch(temporaryEntry + this.string.charAt(i))) {

            } else {

            }
          // The end of the subsequent word has been reached yet.
          } else {

          }
        }
      } else {
        if (checkPrimaryEntryMatch(temporaryEntry + this.string.charAt(i))) {
          temporaryEntry = temporaryEntry + this.string.charAt(i);
        } else {
          this.lastPrimaryEntry = temporaryEntry;
          this.positonMatchPointer = this.dictionaryAux.get(this.lastPrimaryEntry);
          temporaryEntry = charAt(i);
          this.virtualMode = true;
        }
      }
    }
  }

  checkPrimaryEntryMatch(wordToCheck) {
    return this.dictionaryAux.has(wordToCheck);
  }

  //simplified: for the sake of simplicity those "bytes" which are out of the set will be skipped during processing
  initDictionary(acceptedChars) {
    let acceptedCharacters;
    if (acceptedChars.length == 0) {
      acceptedCharacters = "0123456789aábcdeéfghiíjklmnoópqrstuúüűvwxyzAÁBCDEÉFGHIÍJKLMNOÓPQRSTUÚÜŰVWXYZ ,.!\"'-@\n";
    } else {
      acceptedCharacters = acceptedChars;
    }
    for(let i = 0; i < acceptedCharacters.length; i++) {
      this.dictionaryAux.set(acceptedCharacters.charAt(i), i);
      this.dictionary[i] = acceptedCharacters.charAt(i);
    }
  }

  flushDictionary() {

  }

  rearrangeDictionary() {

  }

}