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

//import {dbrzVDEInterfaceObserver} from "./dbrz-vde-interface.js";

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
    if(arguments.length > 0) {
      if (document.getElementById(arguments[0]) != null) {
        this.dbrzPresentationInputField = document.getElementById(arguments[0]);
      } else {
        //default VDE container is the parent to which has to be attached
      }
    } else {
      //default VDE container is the parent to which has to be attached
    }
  }

  update() {
    if(arguments.length > 1) {
      this.dbrzPresentationInputField.innerHTML = "dbrzVDEPresentationInputField - topic: " + arguments[0] + ", value: " + arguments[1];
      //console.log("dbrzVDEPresentationInputField - topic: " + arguments[0] + ", value: " + arguments[1]);
    }
  }
}

class dbrzVDEPresentationMetrics extends dbrzVDEInterfaceObserver {

  constructor(svg) {
    super();
    if(arguments.length > 0) {
      if (document.getElementById(arguments[0]) != null) {
        this.svg = document.getElementById(svg);
      } else {
        //default VDE container is the parent to which has to be attached
      }
    } else {
      //default VDE container is the parent to which has to be attached
    }
  }

  update() {
    if(arguments.length > 1) {
      //console.log("dbrzVDEPresentationMetrics - topic: " + arguments[0] + ", value: " + arguments[1]);
    }
  }

}

class dbrzVDEPresentationTextual extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
    if(arguments.length > 0) {
      if (document.getElementById(arguments[0]) != null) {
        this.dbrzPresentationTextualContainer = document.getElementById(arguments[0]);
      } else {
        //default VDE container is the parent to which has to be attached
      }
    } else {
      //default VDE container is the parent to which has to be attached
    }
  }

  update() {
    if(arguments.length > 1) {
      this.dbrzPresentationTextualContainer.innerHTML = "dbrzVDEPresentationTextual - topic: " + arguments[0] + ", value: " + arguments[1];
      //console.log("dbrzVDEPresentationTextual - topic: " + arguments[0] + ", value: " + arguments[1]);
    }
  }

}


//  
//  Controll related presentations
//




//export {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual};