function include(paths, callback) {
	var paths = typeof paths == "object" ? paths : [paths];
	var loadCount = 0;

	for (var i = 0, l = paths.length; i < l; i++) {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", paths[i] + "?r=" +new Date);
		document.getElementsByTagName("head")[0].appendChild(script);

		script.onload = function() {
			loadCount++;
			if (loadCount == l) { callback(); }
		};
	}
}

function log() {
	console.log(arguments);
}

// An advanced interval class which also calculates delta and fps
var Loop = function(callback, fps) {
	this.fps = null;
	this.delta = 1;
	this.lastTime = +new Date;
	this.callback = callback;
	this.request = null;
};

Loop.prototype.start = function() {

	var _this = this;
	this.request = requestAnimationFrame(function(now) {
		_this.start();
		_this.delta = (now - _this.lastTime);
		_this.fps = 1000/_this.delta;
		_this.delta = _this.delta / (1000/60) > 2 ? 1 : _this.delta / (1000/60);
		_this.lastTime = now;
		_this.callback();
	});
};

Loop.prototype.stop = function() { cancelAnimationFrame(this.request); };

// An advanced timeout class which also calculates the current progress
var Ticker = function(start, duration, callback) {

	var _this = this;

	this.start = start;
	this.duration = duration;

	// TODO easing options

	this.reverse = false;
	this.auto_reset = false;
	this.auto_reverse = false;

	this.callback = callback ? callback : null;
	this.timeout = callback ? setTimeout(function() {
		_this.callback();
		if (_this.auto_reset || _this.auto_reverse) { _this.reset(); }
	}, this.duration) : null;
};

Ticker.prototype.status = function() {
	var end = this.start + this.duration;
	var current = +new Date;
	var duration = end - this.start;
	var difference = current - this.start;
	var progress = this.reverse ? 1 - (difference / duration) : (difference / duration);

	if (current >= end) { progress = this.reverse ? 0 : 1; }

	return progress;
};

Ticker.prototype.reset = function() {
	if (this.auto_reverse) { this.reverse = this.reverse ? false : true; }

	var _this = this;
	this.timeout = this.callback ? setTimeout(function() {
		_this.callback();
		if (_this.auto_reset || _this.auto_reverse) { _this.reset(); }
	}, this.duration) : null;

	this.start = +new Date;
};

(function() {

	var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame)
	{ window.cancelAnimationFrame = function(id) { clearTimeout(id); }; }
}());