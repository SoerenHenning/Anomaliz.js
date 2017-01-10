// Copyright 2016 Sören Henning
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// CanvasTimeSeriesIndicatorPlot

function CanvasTimeSeriesIndicatorPlot(parentElement, canvasDimensions, config) {
	config = config || {};

	this.indicatorData = [];
	this.indicatorPath = config.indicatorPath || new Path2D("M1024 1375v-190q0-14-9.5-23.5t-22.5-9.5h-192q-13 0-22.5 9.5t-9.5 23.5v190q0 14 9.5 23.5t22.5 9.5h192q13 0 22.5-9.5t9.5-23.5zm-2-374l18-459q0-12-10-19-13-11-24-11h-220q-11 0-24 11-10 7-10 21l17 457q0 10 10 16.5t24 6.5h185q14 0 23.5-6.5t10.5-16.5zm-14-934l768 1408q35 63-2 126-17 29-46.5 46t-63.5 17h-1536q-34 0-63.5-17t-46.5-46q-37-63-2-126l768-1408q17-31 47-49t65-18 65 18 47 49z");
	this.indicatorBackgroundPath = config.indicatorBackgroundPath || new Path2D("M1010 60l768 1408q35 63-2 126-17 29-46.5 46t-63.5 17h-1536q-34 0-63.5-17t-46.5-46q-37-63-2-126l768-1408q17-31 47-49t65-18 65 18 47 49z");
	this.indicatorColor = config.indicatorColor || 'red';
	this.indicatorBackgroundColor = config.indicatorBackgroundColor || 'white';

	CanvasTimeSeriesPlot.call(this, parentElement, canvasDimensions, config);
}
CanvasTimeSeriesIndicatorPlot.prototype = Object.create(CanvasTimeSeriesPlot.prototype);

CanvasTimeSeriesIndicatorPlot.prototype.setIndicatorDataSet = function(dataSet, updateDomains, copyData) {
	dataSet = dataSet || [];
	if(copyData) {
		this.indicatorData = [];
		for(var i=0; i<dataSet.length; ++i) {
			this.indicatorData.push(dataSet[i]);
		}
	} else {
		this.indicatorData = dataSet;
	}

	this.updateLegend();

	if(updateDomains) {
		this.updateDomains(this.calculateXDomain(), this.calculateYDomain(), true);
	} else {
		this.updateDisplayIndices();
		this.drawCanvas();
	}
};

CanvasTimeSeriesIndicatorPlot.prototype.addIndicatorDataPoint = function(dataPoint, updateDomains, copyData) {
	if (this.indicatorData.length > 0 && this.indicatorData[this.indicatorData.length-1][0] > dataPoint[0]) {
		return;
	}
	this.indicatorData.push(copyData ? dataPoint.slice(0) : dataPoint);

	if(updateDomains) {
		this.updateDomains(this.calculateXDomain(), this.calculateYDomain(), true);
	} else {
		this.updateDisplayIndices();
		this.drawCanvas();
	}
};

CanvasTimeSeriesIndicatorPlot.prototype.drawCanvas = function() {

	CanvasTimeSeriesPlot.prototype.drawCanvas.call(this);

	var d = this.indicatorData;

	if(d.length < 1) {
		return;
	}

  this.canvas.lineWidth = 1;

	for(var i = 0; i < d.length; i++) {
		this.canvas.save();
		this.canvas.translate(this.xScale(d[i]) - 17, 5);
		this.canvas.scale(0.02, 0.02);
		this.canvas.strokeStyle = this.indicatorBackgroundColor;
		this.canvas.stroke(this.indicatorBackgroundPath);
		this.canvas.fillStyle = this.indicatorBackgroundColor;
		this.canvas.fill(this.indicatorBackgroundPath);
		this.canvas.strokeStyle = this.indicatorColor;
		this.canvas.stroke(this.indicatorPath);
		this.canvas.fillStyle = this.indicatorColor;
		this.canvas.fill(this.indicatorPath);
		this.canvas.restore();
	}

};


// Anomaliz

function Anomaliz(domContainer, config) {
	config = config || {};

  this.width = config.width || 600; // in px
  this.measurementsHeight = config.measurementsHeight || 300; // in px
  this.anomalyscoresHeight = config.anomalyscoresHeight || 100; // in px
	this.thresholds = config.thresholds || [null, null]; // usually lower is <= 0, upper is >= 0; null for no threshold
	this.predictionVisibility = config.predictionVisibility || false;
	this.anomalyscoresVisibility = config.anomalyscoresVisibility || false;
	this.measurementsAxisLabel = config.measurementsAxisLabel || "Measurement";
	this.anomalyscoresAxisLabel = config.anomalyscoresAxisLabel || "Anomaly Score";
	this.measurementsColor = config.measurementsColor || "orange";
	this.predictionsColor = config.predictionsColor || "steelblue";
	this.anomalyscoresColor = config.anomalyscoresColor || "red";
	this.indicatorColor = config.indicatorColor || "red";
	this.measurementsClass = config.measurementsClass || "measurements";
	this.anomalyscoresClass = config.anomalyscoresClass || "anomalyscores";
	this.measurementsPlotStartWithZero = config.measurementsPlotStartWithZero || true;
	this.yAxisSpacing = config.yAxisSpacing || 65; // in px
	this.indicatorOffset = config.indicatorOffset || 65; // in px
	this.defaultTimeSpan = config.defaultTimeSpan || 60*1000; // one minute
	this.defaultStartTime = config.defaultStartTime || new Date();
	this.defaultMeasurementsYDomain = config.defaultMeasurementsYDomain || [0,1];
	this.defaultAnomalyscoresYDomain = config.defaultAnomalyscoresYDomain || [0,1];

	this.values = {measurements: [], predictions: [], anomalyscores: []};
	this.measurementsPlotContainer = domContainer.append("div").attr("class", this.measurementsClass);
	this.anomalyscoresPlotContainer = domContainer.append("div").attr("class", this.anomalyscoresClass);

	this.anomalyscoresPlotContainer.attr("hidden",this.anomalyscoresVisibility ? null : true);

  this.measurementsPlot = new CanvasTimeSeriesIndicatorPlot(this.measurementsPlotContainer, [this.width, this.measurementsHeight], {
    yAxisLabel: this.measurementsAxisLabel,
		disableLegend: true,
		plotMargins: {top: 20, right: 20, bottom: 30, left: this.yAxisSpacing},
    updateViewCallback: (this.setViews).bind(this),
		indicatorColor: this.indicatorColor
  });
  this.anomalyscoresPlot = new CanvasTimeSeriesPlot(this.anomalyscoresPlotContainer, [this.width, this.anomalyscoresHeight], {
    yAxisLabel: this.anomalyscoresAxisLabel,
		disableLegend: true,
		plotMargins: {top: 20, right: 20, bottom: 30, left: this.yAxisSpacing},
    updateViewCallback: (this.setViews).bind(this)
  });

  this.measurementsPlot.setZoomYAxis(false);
  this.anomalyscoresPlot.setZoomYAxis(false);
	this.measurementsPlot.updateDomains([this.defaultStartTime - this.defaultTimeSpan, this.defaultStartTime], this.defaultMeasurementsYDomain, false);
  this.anomalyscoresPlot.updateDomains(this.measurementsPlot.getXDomain(), this.defaultAnomalyscoresYDomain, false);
}

// public interface

Anomaliz.prototype.setMeasurements = function(measurementsSet) {

	var anomalystates = [];
	measurementsSet.forEach(function(value) {
		if (isNumeric(value.measurement)) {
			this.values.measurements.push([value.time, value.measurement]);
		}
		if (isNumeric(value.prediction)) {
			this.values.predictions.push([value.time, value.prediction]);
		}
		if (isNumeric(value.anomalyscore)) {
			this.values.anomalyscores.push([value.time, value.anomalyscore]);
			if ((this.thresholds[0] != null && value.anomalyscore <= this.thresholds[0]) || (this.thresholds[1] != null && value.anomalyscore >= this.thresholds[1])) {
				anomalystates.push(value.time); // Push time to list of anomaly states
			}
		}
	}, this);

	this.measurementsPlot.removeDataSet("measurements");
	this.measurementsPlot.removeDataSet("predictions");
	this.anomalyscoresPlot.removeDataSet("anomalyscores");

	this.measurementsPlot.addDataSet("measurements", "", this.values.measurements, this.measurementsColor, false, false);
	if (this.predictionVisibility) {
		this.measurementsPlot.addDataSet("predictions", "", this.values.predictions, this.predictionsColor, false, false);
	}
	this.measurementsPlot.setIndicatorDataSet(anomalystates, false, false);
	this.anomalyscoresPlot.addDataSet("anomalyscores", "", this.values.anomalyscores, this.anomalyscoresColor, false, false);

	if (this.values.measurements.length != 0 || this.values.predictions.length != 0 || this.values.anomalyscores.length != 0) {
		this.measurementsPlot.updateDomains(this.measurementsPlot.calculateXDomain(), this.measurementsPlot.getYDomain(), true);
		this.updateDomains();
	}
};

Anomaliz.prototype.addMeasurements = function(measurementsSet) {
	var beforeCalculatedXDomain = this.measurementsPlot.calculateXDomain();
	var beforeActualXDomain = this.measurementsPlot.getXDomain();
	var beforeEmpty = this.values.measurements.length == 0 && this.values.predictions.length == 0 && this.values.anomalyscores.length == 0;

	measurementsSet.forEach(function(value) {
		// This updated also this.values
		if (isNumeric(value.measurement)) {
			this.measurementsPlot.addDataPoint("measurements", [value.time, value.measurement], false, false);
		}
		if (isNumeric(value.prediction)) {
			if (this.predictionVisibility) {
				this.measurementsPlot.addDataPoint("predictions", [value.time, value.prediction], false, false);
			} else {
				this.values.predictions.push([value.time, value.prediction]);
			}
		}
		if (isNumeric(value.anomalyscore)) {
			if ((this.thresholds[0] != null && value.anomalyscore <= this.thresholds[0]) || (this.thresholds[1] != null && value.anomalyscore >= this.thresholds[1])) {
				this.measurementsPlot.addIndicatorDataPoint(value.time, false, false);
			}
			this.anomalyscoresPlot.addDataPoint("anomalyscores", [value.time, value.anomalyscore], false, false);
		}
	}, this);

	var afterCalculatedXDomain = this.measurementsPlot.calculateXDomain();
	var afterActualXDomain = this.measurementsPlot.getXDomain();

	if (beforeEmpty) {
		var xDomain;
		if (afterCalculatedXDomain[1] - afterCalculatedXDomain[0] < this.defaultTimeSpan) {
			xDomain = [afterCalculatedXDomain[0], afterCalculatedXDomain[0] + this.defaultTimeSpan];
		} else {
			xDomain = [afterCalculatedXDomain[1] - this.defaultTimeSpan, afterCalculatedXDomain[1]];
		}
		this.measurementsPlot.updateDomains(xDomain, this.measurementsPlot.getYDomain(), false);
	} else {
		if (beforeCalculatedXDomain[1] <= beforeActualXDomain[1] && afterCalculatedXDomain[1] > afterActualXDomain[1]) {
			var shifting = afterCalculatedXDomain[1] - beforeCalculatedXDomain[1];
			var xDomain = [this.measurementsPlot.getXDomain()[0]*1 + shifting  , this.measurementsPlot.getXDomain()[1]*1 + shifting];
			this.measurementsPlot.updateDomains(xDomain, this.measurementsPlot.getYDomain(), false);
		}
	}
	this.updateDomains();
};

Anomaliz.prototype.setThresholds = function() {
	if (arguments.length >= 2) {
		this.thresholds = [(arguments[0] == null) ? null : - Math.abs(arguments[0]), arguments[1]];
	} else if (arguments.length == 1) {
		this.thresholds = [arguments[0], arguments[0]];
	}

	var anomalystates = [];
	this.values.anomalyscores.forEach(function(value) {
		if ((this.thresholds[0] != null && value[1] <= this.thresholds[0]) || (this.thresholds[1] != null && value[1] >= this.thresholds[1])) {
			anomalystates.push(value[0]); // Push time to list of anomaly states
		}
	}, this);
	this.measurementsPlot.setIndicatorDataSet(anomalystates, false, false);
};

Anomaliz.prototype.setPredictionVisibility = function(visibility) {
	this.predictionVisibility = visibility;
	if (this.predictionVisibility) {
		this.measurementsPlot.removeDataSet("predictions");
		this.measurementsPlot.addDataSet("predictions", "", this.values.predictions, this.predictionsColor, false, false);
		this.updateDomains();
	} else {
		this.measurementsPlot.removeDataSet("predictions");
	}
};

Anomaliz.prototype.setAnomalyScoreVisibility = function(visibility) {
	this.anomalyscoresVisibility = visibility;
	this.anomalyscoresPlotContainer.attr("hidden", visibility ? null : true);
};

// private methods

Anomaliz.prototype.setViews = function(except, xDomain, yDomain) {
	var plots = [this.measurementsPlot, this.anomalyscoresPlot];

	plots.forEach(function(plot) {
		if (plot != except) {
			plot.updateDomains(xDomain, plot.getYDomain(), false);
		}
	});
};

Anomaliz.prototype.updateDomains = function() {
	var measurementsYDomain = this.measurementsPlot.calculateYDomain();
	if (this.measurementsPlotStartWithZero) {
		measurementsYDomain[0] = 0;
	}
	measurementsYDomain[1] = measurementsYDomain[1] + ((this.indicatorOffset / this.measurementsHeight) * (measurementsYDomain[1] - measurementsYDomain[0]));
	this.measurementsPlot.updateDomains(this.measurementsPlot.getXDomain(), measurementsYDomain, false);
	this.anomalyscoresPlot.updateDomains(this.measurementsPlot.getXDomain(), this.anomalyscoresPlot.calculateYDomain(), false);
};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
