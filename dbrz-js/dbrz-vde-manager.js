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

class dbrzVDEManager {
  constructor() {
    this.dbrzVDEE = new dbrzVDEEncoder();
    this.dbrzVDEE.initDictionary("");
    this.dbrzVDEE.setInputString("texttexttexttexttexttexttexttexttexttexttexttext");
    this.dbrzVDEE.encode();
  }
}

const dbrzVDEM = new dbrzVDEManager();