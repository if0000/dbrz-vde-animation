//
//  Module: dbrzVDEPresentation
//  
//  Author: Istvan Finta @ Roni Zongor & Co. / TECH
//  https://tech.ronizongor.com
//  v:1.0.0
//
//  Description:
//
//  This module is responsible for the presentation of the VDE environment. It consists of three kind of elements to display:
//  - input field,
//  - measurements and metrics to display,
//  - control buttons.
//
//  Basically the measurement and metrics elements sould be svg based.
//

import {dbrzVDEInterfaceObserver} from "./dbrz-vde-interface.js";

class dbrzVDEPresentation extends dbrzVDEInterfaceObserver{

  constructor() {
    super();
  }
}

//  This is an IF which can subscribe to observables.
//  Besides has some sort of common features which needed to 
class dbrzPresentationElement {
  
  constructor() {

  }
}


//
//  Model related presentation classes
//
class dbrzVDEPresentationInputField extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
  }

  update(...args) {
    console.log("dbrzVDEPresentationInputField: " + args[0]);
  }
}

class dbrzVDEPresentationMetrics extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
  }

  update(...args) {
    console.log("dbrzVDEPresentationMetrics: " + args[0]);
  }

}

class dbrzVDEPresentationTextual extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
  }

  update(...args) {
    console.log("dbrzVDEPresentationTextual: " + args[0]);
  }

}


//  
//  Controll related presentations
//




export {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual};