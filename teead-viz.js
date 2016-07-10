
function TeeAdViz(domContainer, config) {
	config = config || {};

	//this.values/measurements
	//this.predictions
	//this.anomalyscores
	//this.thresholds = [upper, lower] // Both positive
	//this.anomalyScoreVisibility
	//this.predictionVisibility // nnot required
	this.measurementsAxisLabel = "Measurement"; //TODO config
	this.anomalyscoresAxisLabel = "Anomaly Score"; //TODO config

	//this.size
  var size = [600, [300, 100]]; //TODO

  this.measurementsPlot = new CanvasTimeSeriesIndicatorPlot(domContainer, [size[0], size[1][0]], {
    yAxisLabel: this.measurementsAxisLabel,
    updateViewCallback: (this.setViews).bind(this)
  });
  this.anomalyscoresPlot = new CanvasTimeSeriesPlot(domContainer, [size[0], size[1][1]], {
    yAxisLabel: this.anomalyscoresAxisLabel,
    updateViewCallback: (this.setViews).bind(this)
  });



  this.measurementsPlot.setZoomYAxis(false);
  this.anomalyscoresPlot.setZoomYAxis(false);
	this.measurementsPlot.updateDomains([new Date() - 60*60*1000, new Date()], [0, 1], false); // TODO Domain
  this.anomalyscoresPlot.updateDomains(this.measurementsPlot.getXDomain(), [0, 1], false); // TODO Domain
}

// public interface

TeeAdViz.prototype.setMeasurements = function(measurementsSet) {
	this.measurementsPlot.removeDataSet("measurements");
	this.measurementsPlot.removeDataSet("predictions");
	this.anomalyscoresPlot.removeDataSet("anomalyscores");

	//TODO this as member vars
	var measurements = [];
	var predictions = [];
	var anomalyscores = [];
	var anomalystates = [];

	//TODO move this - maybe
	$.each(dataSets, function(key, value) {
		this.measurements.push([value.time, value.measurement]);
		this.predictions.push([value.time, value.prediction]);
		this.anomalyscores.push([value.time, value.anomalyscore]);
		if (value.anomalyscore > 0.2) { //TODO dynamic
			this.anomalystates.push(value.time);
		}
	});

	this.measurementsPlot.addDataSet("measurements", "", measurements, "orange", true, true); //TODO color
	this.measurementsPlot.addDataSet("predictions", "", predictions, "steelblue", true, true); //TODO color
	this.measurementsPlot.setIndicatorDataSet(anomalystates, true, true); //TODO color?
	this.anomalyscoresPlot.addDataSet("anomalyscores", "Anomaly Score", anomalyscores, "red", true, true); //TODO color
	this.anomalyscoresPlot.updateDomains(measurementsPlot.getXDomain(), [0, 1], false); //TODO
};

TeeAdViz.prototype.addMeasurements = function(measurementsSet) {
	var beforeCalculatedXDomain = measurementsPlot.calculateXDomain();
	var beforeActualXDomain = measurementsPlot.getXDomain();

	//TODO extract this - maybe
	$.each(measurementsSet, function(key, value) {
		this.measurementsPlot.addDataPoint("measurements", [value.time, value.measurement], false, true);
		this.measurementsPlot.addDataPoint("predictions", [value.time, value.prediction], false, true);
		//TODO
		//measurementsPlot.addIndicatorDataPoint(VALUE, true, true);
		this.anomalyscoresPlot.addDataPoint("anomalyscores", [value.time, value.anomalyscore], false, true);
	});

	var afterCalculatedXDomain = measurementsPlot.calculateXDomain();
	var afterActualXDomain = measurementsPlot.getXDomain();

	if (beforeCalculatedXDomain[1] <= beforeActualXDomain[1] && afterCalculatedXDomain[1] > afterActualXDomain[1]) {
		var shifting = afterCalculatedXDomain[1] - beforeCalculatedXDomain[1];
		var xDomain = [measurementsPlot.getXDomain()[0]*1 + shifting  , measurementsPlot.getXDomain()[1]*1 + shifting];
		measurementsPlot.updateDomains(xDomain, [0, measurementsPlot.calculateYDomain()[1]], false);
		anomalyscoresPlot.updateDomains(measurementsPlot.getXDomain(), [0, 1], false);
	}
};

TeeAdViz.prototype.setThresholds = function() {
	if (arguments.length >= 2) {
		this.thresholds = [arguments[0], arguments[1]]; // TODO Math.abs() for second value
	} else if (arguments.length == 1) {
		this.thresholds = [arguments[0], arguments[0]];
	}

	// Rebuild indicators
};

TeeAdViz.prototype.setAnomalyScoreVisibility = function(visibility) {
	//neceseccary or should this be done by the consumer? (via jQuery, css, etc.)
	//TODO remove
};

TeeAdViz.prototype.setPredictionVisibility = function(visibility) {
	// add/remove prediction plot
};

// private methods

TeeAdViz.prototype.setViews = function(except, xDomain, yDomain) {
	var plots = [this.measurementsPlot, this.anomalyscoresPlot];

	$.each(plots, function(key, plot) {
		if (plot != except) {
			plot.updateDomains(xDomain, plot.getYDomain(), false);
		}
	});
};

TeeAdViz.prototype.plotAnomalyStates = function() {

};
