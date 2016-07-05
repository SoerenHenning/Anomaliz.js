
function TeeAdViz(domContainer, config) {
	config = config || {};

  var size = [600, [300, 100]]; //TODO

  this.measurementsPlot = new CanvasTimeSeriesIndicatorPlot(d3.select(domContainer), [size[0], size[1[0]]], {
    yAxisLabel: "Measurement", // TODO Var
    updateViewCallback: setViews
  });
  this.anomalyscoresPlot = new CanvasTimeSeriesPlot(d3.select(domContainer), [size[0], size[1[1]]], {
    yAxisLabel: "Anomaly Score", // TODO Var
    updateViewCallback: setViews
  });
  measurementsPlot.setZoomYAxis(false);
  anomalyscoresPlot.setZoomYAxis(false);
  anomalyscoresPlot.updateDomains(measurementsPlot.getXDomain(), [0, 1], false); // TODO Domain
}

CanvasDataPlot.prototype.setMeasurements = function(measurementsSet) {

};

CanvasDataPlot.prototype.addMeasurements = function(measurementsSet) {

};
