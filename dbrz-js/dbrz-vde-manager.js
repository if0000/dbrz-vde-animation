//
//  Module: dbrzVDEManager
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:1.0.0
//
//  Description:
//
//  This is the management module of the VDE compression procedure.
//

//import {dbrzVDEEncoder} from "./dbrz-vde-encoder.js";
//import {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual} from "./dbrz-vde-presentation.js";

class dbrzVDEManager {
  constructor() {
    this.dbrzVDEE = new dbrzVDEEncoder();
    this.dbrzVDEE.initDictionary("");

    this.dbrzVDEPIF = new dbrzVDEPresentationInputField("dbrzVDEPresentationInputField");
    this.dbrzVDEPIP = new dbrzVDEPresentationInputProcessing("dbrzVDEPresentationInputProcessing");
    this.dbrzVDEPM = new dbrzVDEPresentationMetrics("dbrzVDEPresentationMeasurement");
    this.dbrzVDEPTTextProcessing = new dbrzVDEPresentationTextual("dbrzVDEPresentationInputString");
    this.dbrzVDEPTOutput = new dbrzVDEPresentationTextual("dbrzVDEPresentationOutput");
    this.dbrzVDEPTDictionary = new dbrzVDEPresentationTextual("dbrzVDEPresentationDictionary");

    this.dbrzVDEE.subscribe('checkpointDescription', this.dbrzVDEPTTextProcessing);
    this.dbrzVDEE.subscribe('string', this.dbrzVDEPTTextProcessing);
    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPM);
    this.dbrzVDEE.subscribe('encodedId', this.dbrzVDEPTOutput);
    this.dbrzVDEE.subscribe('dictionary', this.dbrzVDEPTDictionary);

    this.dbrzVDEE.subscribe('string', this.dbrzVDEPIP);
    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPIP);

    //
    //  These methods should be wire out to the UI
    //
    this.dbrzVDEE.setInputString("hi i am an input string to be encoded hi i am an input string to be encoded hi i am an input string to be encoded");
    //this.dbrzVDEE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
    this.dbrzVDEE.unsubscribe('string', this.dbrzVDEPTInputProcessing);
    this.dbrzVDEE.encode(true);
  }
}

const dbrzVDEM = new dbrzVDEManager();