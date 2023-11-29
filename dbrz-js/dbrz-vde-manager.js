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

    this.dbrzVDEPIP = new dbrzVDEPresentationInputProcessing("dbrzVDEPresentationInputProcessing", true, new dbrzVDEPreprocessorKF());
    this.dbrzVDEPM = new dbrzVDEPresentationMetrics("dbrzVDEPresentationMeasurement");
    this.dbrzVDEPTTextProcessing = new dbrzVDEPresentationTextual("dbrzVDEPresentationInputString");
    this.dbrzVDEPEV = new dbrzVDEPresentationEncodedValue("dbrzVDEPresentationOutput");
    this.dbrzVDEPTDictionary = new dbrzVDEPresentationTextual("dbrzVDEPresentationDictionary");
    this.dbrzVDEPTLM = new dbrzVDEPresentationTextual("dbrzVDEPresentationLM");
    this.dbrzVDEPTDE = new dbrzVDEPresentationTextual("dbrzVDEPresentationTempEnt", true, new dbrzVDEPreprocessorNLSQN());
    this.dbrzVDEPTCCR = new dbrzVDEPresentationTextual("dbrzVDEPresentationCCR", true, new dbrzVDEPreprocessorCCCR());

    this.dbrzVDEE.subscribe('checkpointDescription', this.dbrzVDEPTTextProcessing);

    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPM);
    this.dbrzVDEE.subscribe('encodedId', this.dbrzVDEPM);
    this.dbrzVDEE.subscribe('longestEntryFound', this.dbrzVDEPM);
    this.dbrzVDEE.subscribe('reset', this.dbrzVDEPM);

    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPTCCR);
    this.dbrzVDEE.subscribe('longestEntryFound', this.dbrzVDEPTCCR);
    this.dbrzVDEE.subscribe('reset', this.dbrzVDEPTCCR);

    this.dbrzVDEE.subscribe('encodedId', this.dbrzVDEPEV);
    this.dbrzVDEE.subscribe('reset', this.dbrzVDEPEV);

    this.dbrzVDEE.subscribe('dictionary', this.dbrzVDEPTDictionary);

    this.dbrzVDEE.subscribe('longestMatchingEntry', this.dbrzVDEPTLM);

    this.dbrzVDEE.subscribe('dynamicEntry', this.dbrzVDEPTDE);
    this.dbrzVDEE.subscribe('reset', this.dbrzVDEPTDE);

    this.dbrzVDEE.subscribe('string', this.dbrzVDEPIP);
    this.dbrzVDEE.subscribe('progressCounter', this.dbrzVDEPIP);

    //
    //  These methods should be wire out to the UI
    //
    this.dbrzVDEE.initDictionary("");
  }
}

const dbrzVDEM = new dbrzVDEManager();