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

    this.dbrzVDEPIF = new dbrzVDEPresentationInputField();
    this.dbrzVDEPM = new dbrzVDEPresentationMetrics();
    this.dbrzVDEPTTextProcessing = new dbrzVDEPresentationTextual();
    this.dbrzVDEPTOutput = new dbrzVDEPresentationTextual();
    this.dbrzVDEPTDictionary = new dbrzVDEPresentationTextual();

    this.dbrzVDEE.subscribe('checkpointDescription', this.dbrzVDEPTTextProcessing);
    this.dbrzVDEE.subscribe('string', this.dbrzVDEPTTextProcessing);
    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPM);
    this.dbrzVDEE.subscribe('encodedId', this.dbrzVDEPTOutput);
    this.dbrzVDEE.subscribe('dictionary', this.dbrzVDEPTDictionary);


    this.dbrzVDEE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
    this.dbrzVDEE.unsubscribe('string', this.dbrzVDEPTInputProcessing);
    this.dbrzVDEE.encode(false);
  }
}

const dbrzVDEM = new dbrzVDEManager();