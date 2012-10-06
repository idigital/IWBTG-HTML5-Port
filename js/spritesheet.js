var Spritesheet = function(src, w, h, callback) {

	var _this = this;

	this.img = new Image();
	this.img.src = src;

	this.loaded = false;
	this.callback = callback;

	this.img.onload = function() {
		_this.loaded = true;
		_this.callback();
	};

	this.w = w;
	this.h = h;

	this.currentState = null;
	this.states = {};

	this.buffer = document.createElement("canvas");
	this.bfr = this.buffer.getContext("2d");
};

function cloneCanvas(original) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	ctx.drawImage(original, 0, 0);

	return canvas;
}

Spritesheet.prototype.addState = function(state, x, y) {

	this.states[state] = {};
	this.states[state].frames = [];
	this.states[state].frames_m = [];
	this.states[state].counter = {};
	this.states[state].counter.duration = 0;
	this.states[state].counter.frame = 0;

	this.bfr.clearRect(0, 0, this.w, this.h);

	var x = x * this.w;
	var y = y * this.h;

	this.bfr.drawImage(
		this.img,
		x, y,
		this.w, this.h,
		0, 0,
		this.w, this.h
	);

	this.states[state].frames.push(cloneCanvas(this.buffer));

	// mirrored sprite
	this.bfr.save();
	this.bfr.translate(this.w, 0);
	this.bfr.scale(-1, 1);
	this.bfr.clearRect(0, 0, this.w, this.h);

	this.bfr.drawImage(
		this.img,
		x, y,
		this.w, this.h,
		0, 0,
		this.w, this.h
	);

	this.states[state].frames_m.push(cloneCanvas(this.buffer));
	this.bfr.restore();

	this.setState(state);
	return { animate: this.animate(arguments) };
};

Spritesheet.prototype.animate = function(args) {
	var _this = this;
	return function() {

		var state = args[0];
		var base_x = args[1];
		var base_y = args[2]

		var axis = arguments[0];
		var end = arguments[1];
		var duration = arguments[2];

		_this.states[state].duration = duration;

		for (var i = 1, l = end+1; i < l; i++) {

			_this.bfr.clearRect(0, 0, _this.w, _this.h);

			var x = axis == "x" ? i * _this.w : base_x;
			var y = axis == "y" ? i * _this.h : base_y;

			_this.bfr.drawImage(
				_this.img,
				x, y,
				_this.w,
				_this.h,
				0, 0,
				_this.w,
				_this.h
			);

			_this.states[state].frames.push(cloneCanvas(_this.buffer));

			_this.bfr.save();
			_this.bfr.translate(_this.w, 0);
			_this.bfr.scale(-1, 1);
			_this.bfr.clearRect(0, 0, _this.w, _this.h);

			_this.bfr.drawImage(
				_this.img,
				x, y,
				_this.w,
				_this.h,
				0, 0,
				_this.w,
				_this.h
			);

			_this.states[state].frames_m.push(cloneCanvas(_this.buffer));

			_this.bfr.restore();
		}
	}
};

Spritesheet.prototype.setState = function(state) {
	this.currentState = state;
};

Spritesheet.prototype.getState = function(state, mirror) {

	var state = state || this.currentState;
	var mirror = mirror || 0;

	var frame = this.states[state].counter.frame;
	var duration = this.states[state].counter.duration;

	var img = mirror ? this.states[state].frames_m[frame] : this.states[state].frames[frame];

	if (duration < this.states[state].duration) {
		this.states[state].counter.duration++;
	} else {
		if (frame < this.states[state].frames.length-1)
		{ this.states[state].counter.frame++; } else { this.states[state].counter.frame = 0; }
		this.states[state].counter.duration = 1;
	}

	return img;
};