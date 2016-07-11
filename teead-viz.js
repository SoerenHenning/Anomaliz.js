
function TeeAdViz(domContainer, config) {
	config = config || {};

	this.size = [600, [300, 100]];  //in px //TODO config
	this.thresholds = [-0.2, 1.2]; // lower is <= 0, upper is >= 0 //TODO config
	this.predictionVisibility = true; //TODO config
	this.measurementsAxisLabel = "Measurement"; //TODO config
	this.anomalyscoresAxisLabel = "Anomaly Score"; //TODO config
	this.measurementsColor = "orange";
	this.predictionsColor = "steelblue";
	this.anomalyscoresColor = "red";
	this.indicatorColor = "red";
	this.measurementsClass = "measurements"; //TODO config
	this.anomalyscoresClass = "anomalyscores"; //TODO config
	this.measurementsPlotStartWithZero = true;  //TODO config
	this.indicatorOffset = 50; //in px //TODO config

	//this.size
  var size = this.size; //TODO

	this.values = {measurements: [], predictions: [], anomalyscores: []};

  this.measurementsPlot = new CanvasTimeSeriesIndicatorPlot(domContainer.append("div").attr("class", this.measurementsClass), [this.size[0], this.size[1][0]], {
    yAxisLabel: this.measurementsAxisLabel,
    updateViewCallback: (this.setViews).bind(this),
		indicatorColor: this.indicatorColor
  });
  this.anomalyscoresPlot = new CanvasTimeSeriesPlot(domContainer.append("div").attr("class", this.anomalyscoresClass), [this.size[0], this.size[1][1]], {
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

	var values = this.values;
	var anomalystates = [];
	var thresholds = this.thresholds;
	//TODO javascript for each
	$.each(measurementsSet, function(key, value) {
		values.measurements.push([value.time, value.measurement]);
		values.predictions.push([value.time, value.prediction]);
		values.anomalyscores.push([value.time, value.anomalyscore]);
		if (value.anomalyscore <= thresholds[0] || value.anomalyscore >= thresholds[1]) {
			anomalystates.push(value.time); // Push time to list of anomaly states
		}
	});

	this.measurementsPlot.removeDataSet("measurements");
	this.measurementsPlot.removeDataSet("predictions");
	this.anomalyscoresPlot.removeDataSet("anomalyscores");

	this.measurementsPlot.addDataSet("measurements", "", this.values.measurements, this.measurementsColor, false, false);
	if (this.predictionVisibility) {
		this.measurementsPlot.addDataSet("predictions", "", this.values.predictions, this.predictionsColor, false, false);
	}
	this.measurementsPlot.setIndicatorDataSet(anomalystates, false, false);
	this.anomalyscoresPlot.addDataSet("anomalyscores", "", this.values.anomalyscores, this.anomalyscoresColor, false, false);

	this.measurementsPlot.updateDomains(this.measurementsPlot.calculateXDomain(), this.measurementsPlot.getYDomain(), true);
	this.updateDomains();
};

TeeAdViz.prototype.addMeasurements = function(measurementsSet) {
	var beforeCalculatedXDomain = this.measurementsPlot.calculateXDomain();
	var beforeActualXDomain = this.measurementsPlot.getXDomain();

	var measurementsPlot = this.measurementsPlot;
	var anomalyscoresPlot = this.anomalyscoresPlot;
	var thresholds = this.thresholds;
	var values = this.values;
	//TODO javascript for each
	$.each(measurementsSet, function(key, value) {
		// This updated also this.values
		measurementsPlot.addDataPoint("measurements", [value.time, value.measurement], false, false);
		if (this.predictionVisibility) {
			measurementsPlot.addDataPoint("predictions", [value.time, value.prediction], false, false);
		} else {
			values.predictions.push([value.time, value.prediction]);
		}
		if (value.anomalyscore <= thresholds[0] || value.anomalyscore >= thresholds[1]) {
			measurementsPlot.addIndicatorDataPoint(value.time, false, false);
		}
		anomalyscoresPlot.addDataPoint("anomalyscores", [value.time, value.anomalyscore], false, false);
	});

	var afterCalculatedXDomain = this.measurementsPlot.calculateXDomain();
	var afterActualXDomain = this.measurementsPlot.getXDomain();

	if (beforeCalculatedXDomain[1] <= beforeActualXDomain[1] && afterCalculatedXDomain[1] > afterActualXDomain[1]) {
		var shifting = afterCalculatedXDomain[1] - beforeCalculatedXDomain[1];
		var xDomain = [this.measurementsPlot.getXDomain()[0]*1 + shifting  , this.measurementsPlot.getXDomain()[1]*1 + shifting];
		this.measurementsPlot.updateDomains(xDomain, measurementsPlot.getYDomain(), false);
	}
	this.updateDomains();
};

TeeAdViz.prototype.setThresholds = function() {
	if (arguments.length >= 2) {
		this.thresholds = [- Math.abs(arguments[0]), arguments[1]];
	} else if (arguments.length == 1) {
		this.thresholds = [arguments[0], arguments[0]];
	}

	var anomalystates = [];
	//TODO javascript for each
	var thresholds = this.thresholds;
	$.each(this.values.anomalyscores, function(key, value) {
		if (value[1] <= thresholds[0] || value[1] >= thresholds[1]) {
			anomalystates.push(value[0]); // Push time to list of anomaly states
		}
	});
	this.measurementsPlot.setIndicatorDataSet(anomalystates, false, false);
};

TeeAdViz.prototype.setPredictionVisibility = function(visibility) {
	this.predictionVisibility = visibility;
	if (this.predictionVisibility) {
		this.measurementsPlot.removeDataSet("predictions");
		this.measurementsPlot.addDataSet("predictions", "", this.values.predictions, this.predictionsColor, false, false);
		this.updateDomains();
	} else {
		this.measurementsPlot.removeDataSet("predictions");
	}
};

// private methods

TeeAdViz.prototype.setViews = function(except, xDomain, yDomain) {
	var plots = [this.measurementsPlot, this.anomalyscoresPlot];

	//TODO javascript for each
	$.each(plots, function(key, plot) {
		if (plot != except) {
			plot.updateDomains(xDomain, plot.getYDomain(), false);
		}
	});
};

TeeAdViz.prototype.updateDomains = function() {
	var measurementsYDomain = this.measurementsPlot.calculateYDomain();
	if (this.measurementsPlotStartWithZero) {
		measurementsYDomain[0] = 0;
	}
	measurementsYDomain[1] = measurementsYDomain[1] + ((this.indicatorOffset / this.size[1][0]) * (measurementsYDomain[1] - measurementsYDomain[0]));
	this.measurementsPlot.updateDomains(this.measurementsPlot.getXDomain(), measurementsYDomain, false);
	this.anomalyscoresPlot.updateDomains(this.measurementsPlot.getXDomain(), this.anomalyscoresPlot.calculateYDomain(), false);
};

TeeAdViz.prototype.plotAnomalyStates = function() {

};
