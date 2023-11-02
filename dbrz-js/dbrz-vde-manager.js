//
//  Module: dbrzVDEManager
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:1.0.0
//
//  Description:
//
//  This is the manager module of the VDE compression procedure and the collection of related interfaces.
//

import {dbrzVDEEncoder} from "./dbrz-vde-encoder.js";
import {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual} from "./dbrz-vde-presentation.js";

class dbrzVDEManager {
  constructor() {
    this.dbrzVDEE = new dbrzVDEEncoder();
    this.dbrzVDEE.initDictionary("");

    this.dbrzVDEPIF = new dbrzVDEPresentationInputField();
    this.dbrzVDEPM = new dbrzVDEPresentationMetrics();
    this.dbrzVDEPTOutput = new dbrzVDEPresentationTextual();
    this.dbrzVDEPTDictionary = new dbrzVDEPresentationTextual();
    this.dbrzVDEPTInputProcessing = new dbrzVDEPresentationTextual();

    this.dbrzVDEE.subscribe('progressString', this.dbrzVDEPTInputProcessing);
    this.dbrzVDEE.subscribe('encodedId', this.dbrzVDEPTOutput);
    this.dbrzVDEE.subscribe('dictionary', this.dbrzVDEPTDictionary);


    this.dbrzVDEE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
    //this.dbrzVDEE.encode();
  }
}

const dbrzVDEM = new dbrzVDEManager();