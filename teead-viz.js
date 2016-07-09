
function TeeAdViz(domContainer, config) {
	config = config || {};

	//this.values/measurements
	//this.predictions
	//this.anomalyscores
	//this.thresholds = [upper, lower]
	//this.anomalyScoreVisibility
	//this.predictionVisibility

	//this.size
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

TeeAdViz.prototype.setMeasurements = function(measurementsSet) {

};

TeeAdViz.prototype.addMeasurements = function(measurementsSet) {

};

TeeAdViz.prototype.setThresholds = function() {
	if (arguments.length >= 2) {
		this.thresholds = [arguments[0], arguments[1]]
	} else if (arguments.length == 1) {
		this.thresholds = [arguments[0], arguments[0]]
	}
	
	// Rebuild indicators
};

TeeAdViz.prototype.setAnomalyScoreVisibility = function(visibility) {
	//neceseccary or should this be done by the consumer? (via jQuery, css, etc.)
};

TeeAdViz.prototype.setPredictionVisibility = function(visibility) {
	// add/remove prediction plot
};
