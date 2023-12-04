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

//import {dbrzVDEInterfaceObserver} from "./dbrz-vde-interface.js";

class dbrzVDEPresentation extends dbrzVDEInterfaceObserver{

  constructor() {
    super();
  }
}

//
//  This is an IF which can subscribe to observables.
//  Besides has some sort of common features which needed to 
//
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
        //
        // default VDE container is the parent to which has to be attached
        //
      }
    } else {
      //
      // default VDE container is the parent to which has to be attached
      //
    }
    this.output = "";
  }

  update() {
    if(arguments.length > 1) {
      if(arguments[0] == "reset") {
        this.output = "";
        this.dbrzPresentationInputField.innerHTML = "";
      }
      if(arguments[0] == "encodedId") {
        if (arguments[1] > -1) {
          if(this.output == "") {
            this.output = arguments[1];
          } else {
            this.output = this.output + ", " + arguments[1];
          }
          this.dbrzPresentationInputField.innerHTML = this.output;
        }
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
        //
        // default VDE container is the parent to which has to be attached
        //
      }
    } else {
      //
      // default VDE container is the parent to which has to be attached
      //
    }

    if(arguments[1]) {
      this.preProcessing = true;
      this.preProcessorObject = arguments[2];
    } else {
      this.preProcessing = false;
    }

    this.inputString;
    this.progressStatus = 0;
  }

  update() {
    if(arguments.length > 0) {
      if(arguments[0] == "reset") {

        if(this.preProcessing) {
          this.preProcessorObject.reset();
        }

        this.inputString = "";
        this.progressStatus = 0;
        this.dbrzPresentationInputProcessing.innerHTML = "";

      } 
      if(arguments[0] == "string") {
        this.inputString = arguments[1];
      } 
      if(arguments[0] != "string" && arguments[0] != "reset") {
        if(this.preProcessing) {
          this.dbrzPresentationInputProcessing.innerHTML = this.preProcessorObject.preProcess("", this.inputString.slice(0, arguments[1])).getResult();
        } else {
          this.dbrzPresentationInputProcessing.innerHTML = this.inputString.slice(0, arguments[1]);
        }
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
        //
        // default VDE container is the parent to which has to be attached
        //
      }
    } else {
      //
      // default VDE container is the parent to which has to be attached
      //
    }

    this.chart = new Chart("dbrzVDEPresentationMeasurement", {
      type: "line",
      data: {
        labels: [],
        datasets: [{ 
          data: [],
          borderColor: "#00ffff",
          fill: false
        }]
      },
      options: {
        legend: {display: false},
      }
    });

    this.dbrzVDEPCCCR = new dbrzVDEPreprocessorCCCR();
    this.processedInputSize = 0;
  }

  update() {
    if(arguments.length > 1) {

      if(arguments[0] == "dictDynSize") {
        this.dbrzVDEPCCCR.preProcess(arguments[0], arguments[1]);
      }

      if(arguments[0] == "progressCounter") {

        this.processedInputSize = arguments[1];
        this.dbrzVDEPCCCR.preProcess(arguments[0], arguments[1]);
      }

      if(arguments[0] == "longestEntryFound") {

        this.chart.data.labels.push(this.processedInputSize);
        this.chart.data.datasets[0].data.push(this.dbrzVDEPCCCR.preProcess(arguments[0], arguments[1]).getResult());
        this.chart.update();
      }

      if(arguments[0] == "reset") {

        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    
        this.dbrzVDEPCCCR.reset();
        this.processedInputSize = 0;
      }
    }
  }

}

//
// Such cases should be handled, whether:
//  - cumulative or delta processing / presentation takes place,
//  - formatting issues, etc.
//
// Probably it is worth to use either builder or chain of responsibility pattern, eg.: setAttribute() in other projects, and dynamic configuration during creation via the return 'this'.
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
        //
        // default VDE container is the parent to which has to be attached
        //
      }
    } else {
      //
      //default VDE container is the parent to which has to be attached
      //
    }

    if(arguments[1]) {
      this.preProcessing = true;
      this.preProcessorObject = arguments[2];
    } else {
      this.preProcessing = false;
    }
  }

  update() {
    if(arguments.length > 1) {
      if(arguments[0] == "reset") {
        if(this.preProcessing) {
          this.preProcessorObject.reset();
        }
        this.dbrzPresentationTextualContainer.innerHTML = "";
      } else {
        if(this.preProcessing) {
          this.dbrzPresentationTextualContainer.innerHTML = this.preProcessorObject.preProcess(arguments[0], arguments[1]).getResult();
        } else {
          this.dbrzPresentationTextualContainer.innerHTML = arguments[1];
        }
      }
    }
  }

}


//
//  New Line with SeQuence Number
//
class dbrzVDEPreprocessorNLSQN {

  constructor() {
    this.entriescounter = 0;
    this.output = "";
  }

  preProcess(inp1, inp2) {
    if(this.output == "") {
      this.output = this.entriescounter + " - <pre class=\"dbrz-vde-inline\">" + inp2 + "</pre><br />";
    } else {
      this.output = this.output + this.entriescounter + " - <pre class=\"dbrz-vde-inline\">" + inp2 + "</pre><br />";
    }
    this.entriescounter++;

    return this;
  }

  getResult() {
    return this.output;
  }

  reset() {
    this.entriescounter = 0;
    this.output = "";
  }

}


//
//  Keep Formatting
//
class dbrzVDEPreprocessorKF {

  constructor() {
    this.outputInternal = "";
    this.output = "";
  }

  preProcess(inp1, inp2) {

    this.output = "<pre class=\"dbrz-vde-inline\">" + inp2 + "</pre>";
    return this;
  }

  getResult() {
    return this.output;
  }

  reset() {
    this.outputInternal = "";
    this.output = "";
  }

}

//
//  Computes Current Compression Ratio
//  This is used as a common source of truth.
//
//  'progressCounter' is propagated more frequently than real dictionary update.
//  Therefore value from this is temporarily stored in the local progressCounter.
//  However, it's value is used only when the 'longestEntryFound' event takes place. 
//  Actually, that event serves as a trigger.
//
//
class dbrzVDEPreprocessorCCCR {

  constructor() {
    this.baseDictSize = 97;
    this.dictSize = 128;
    this.valueToAdd = 14;
    this.tempProgressCounter = 0;
    this.processedInputSize = 0;
    this.encodedOutputSize = 0;
    this.ratio = 0;
  }

  preProcess(inp1, inp2) {
    if(inp1 == "dictDynSize") {
      this.dictSize = Number(inp2);
      this.valueToAdd = Math.ceil(Math.log2(this.baseDictSize + (((this.dictSize) * (this.dictSize + 1)) / 2)));
    }

    if(inp1 == "progressCounter") {
      this.tempProgressCounter = inp2;
    }

    if(inp1 == "longestEntryFound") {
      this.processedInputSize = 7 * this.tempProgressCounter;
      this.encodedOutputSize = this.encodedOutputSize + this.valueToAdd;

      this.ratio = (this.encodedOutputSize / this.processedInputSize).toFixed(2);
    }

    return this;
  }

  getResult() {
    return this.ratio;
  }

  reset() {
    this.dictSize = 128;
    this.valueToAdd = 14;
    this.tempProgressCounter = 0;
    this.processedInputSize = 0;
    this.encodedOutputSize = 0;
    this.ratio = 0;
  }

}

//  Frequency charts are also beneficial


//  
//  Controll related presentations
//




//export {dbrzVDEPresentationInputField, dbrzVDEPresentationMetrics, dbrzVDEPresentationTextual};