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
class dbrzVDEPresentationEncodedValue extends dbrzVDEInterfaceObserver {

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
      if (arguments[1] > -1) {
        this.dbrzPresentationInputField.innerHTML = arguments[1];
      } else {
        this.dbrzPresentationInputField.innerHTML = "";
      }
    }
  }
}

class dbrzVDEPresentationDynEntry extends dbrzVDEInterfaceObserver {

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
    this.cummulatedDynamicEntries = "";
  }

  update() {
    if(arguments.length > 1) {
      if(arguments[0] == "reset") {
        this.cummulatedDynamicEntries = "";
        this.dbrzPresentationInputField.innerHTML = "";
      } else {
        if(this.cummulatedDynamicEntries.length == 0) {
          this.cummulatedDynamicEntries = arguments[1];
        } else {
          this.cummulatedDynamicEntries = this.cummulatedDynamicEntries + "," + arguments[1];
        }
        this.dbrzPresentationInputField.innerHTML = this.cummulatedDynamicEntries;
      }
    }
  }
}

class dbrzVDEPresentationInputProcessing extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
    if(arguments.length > 0) {
      if (document.getElementById(arguments[0]) != null) {
        this.dbrzPresentationInputProcessing = document.getElementById(arguments[0]);
      } else {
        //default VDE container is the parent to which has to be attached
      }
    } else {
      //default VDE container is the parent to which has to be attached
    }

    this.inputString;
    this.progressStatus = 0;

    this.colorizedProgress;
  }

  update() {
    if(arguments.length > 0) {
      if(arguments[0] == "string") {
        this.inputString = arguments[1];
      } else {
        this.dbrzPresentationInputProcessing.innerHTML = this.inputString.slice(0, arguments[1]);
      }
    }
  }
}

class dbrzVDEPresentationMetrics extends dbrzVDEInterfaceObserver {

  constructor() {
    super();
    if(arguments.length > 0) {
      if (document.getElementById(arguments[0]) != null) {
        this.canvas = document.getElementById(arguments[0]);
      } else {
        //default VDE container is the parent to which has to be attached
      }
    } else {
      //default VDE container is the parent to which has to be attached
    }

    this.chart = new Chart("dbrzVDEPresentationMeasurement", {
      type: "line",
      data: {
        labels: [],
        datasets: [{ 
          data: [],
          borderColor: "red",
          fill: false
        }]
      },
      options: {
        legend: {display: false}
      }
    });

    this.tempProgressCounter = 0;
    this.tempEncodedId = 0;
    this.processedInputSize = 0;
    this.encodedOutputSize = 0;
    this.ratio = 0;
  }

  update() {
    if(arguments.length > 1) {
      //
      // 'progressCounter' is propagated more frequently than real dictionary update.
      // Therefore value from this is temporarily stored in the local progressCounter.
      // However, it's value is used only when the 'dynamicEntry' event takes place. 
      // Actually, that event serves as a trigger.
      //
      // During the ration computing (this.encodedOutputSize = this.encodedOutputSize + 3;):
      // +3 is applied since if all characters in the dictionary static part can be represented with 8 bits and the dynamic part can contain 256 primary entries. The total number of primary and virtual entries in the dynamic part can be expressed as 256*257/2 = 32896, which requires 16bits. So, the full addressing requires 8 + 16 = 24bits = 3 bytes. As an alternative by limiting the number of primary entries by one the dynamic addressing would decresing with one bit.
      //
      if(arguments[0] == "progressCounter") {
        this.tempProgressCounter = arguments[1];
      }

      if(arguments[0] == "encodedId") {
        this.tempEncodedId = arguments[1];
      }

      if(arguments[0] == "dynamicEntry") {
        this.processedInputSize = this.tempProgressCounter;
        this.encodedOutputSize = this.encodedOutputSize + 3;

        this.ratio = this.encodedOutputSize / this.processedInputSize;

        this.chart.data.labels.push(this.processedInputSize);
        this.chart.data.datasets[0].data.push(this.ratio);
        this.chart.update();
      }

      if(arguments[0] == "reset") {

        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    
        this.tempProgressCounter = 0;
        this.tempEncodedId = 0;
        this.processedInputSize = 0;
        this.encodedOutputSize = 0;
        this.ratio = 0;
      }
    }
  }

}

//
// Such cases should be handled, whether:
//  - cumulative or delta processing / presentation takes place,
//  - formatting issues, etc.
//
// Probably it is worth to use either builder or chain of responsibility pattern, eg.: setAttribute() in other projects, and dynamic configuration during creation via the return this.
// Additionally, parameter pass in json format also could be beneficial.
//  
//
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

    if(arguments[1]) {
      this.preformatting = true;
    } else {
      this.preformatting = false;
    }
  }

  preprocessorComaToBreakLine(param) {
    let result = (String(param)).replaceAll(",", "<br />");
    return result;
  }

  update() {
    if(arguments.length > 1) {
      if(this.preformatting) {
        this.dbrzPresentationTextualContainer.innerHTML = this.preprocessorComaToBreakLine(arguments[1]);
      } else {
        this.dbrzPresentationTextualContainer.innerHTML = arguments[1];
      }
    }
  }

}

//  Frequency charts are also beneficial


//  
//  Controll related presentations
//




//export {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual};