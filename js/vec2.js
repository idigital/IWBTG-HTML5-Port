var vec2 = {};

vec2.create = function(x, y) {
	return !isNaN(x) && !isNaN(y) ? [x, y] : [0, 0];
};

vec2.add = function(v1, v2, dest) {
	if (!dest) { dest = []; }

	v1 = typeof v1 == "object" ? v1 : [v1, v1];
	v2 = typeof v2 == "object" ? v2 : [v2, v2];

	dest[0] = v1[0] + v2[0];
	dest[1] = v1[1] + v2[1];

	return dest;
};

vec2.subtract = function(v1, v2, dest) {
	if (!dest) { dest = []; }

	v1 = typeof v1 == "object" ? v1 : [v1, v1];
	v2 = typeof v2 == "object" ? v2 : [v2, v2];

	dest[0] = v1[0] - v2[0];
	dest[1] = v1[1] - v2[1];

	return dest;
};

vec2.divide = function(v1, v2, dest) {
	if (!dest) { dest = []; }

	v1 = typeof v1 == "object" ? v1 : [v1, v1];
	v2 = typeof v2 == "object" ? v2 : [v2, v2];

	dest[0] = v1[0] / v2[0];
	dest[1] = v1[1] / v2[1];

	return dest;
};

vec2.multiply = function(v1, v2, dest) {
	if (!dest) { dest = []; }

	v1 = typeof v1 == "object" ? v1 : [v1, v1];
	v2 = typeof v2 == "object" ? v2 : [v2, v2];

	dest[0] = v1[0] * v2[0];
	dest[1] = v1[1] * v2[1];

	return dest;
};

vec2.diff = function(v1, v2, dest) {
	return [Math.abs(v1[0] - v2[0]), Math.abs(v1[1] - v2[1])];
};

vec2.getX = function(v1, v2, y, dest) {
	var y1 = v1[1] < v2[1] ? v1[1] : v2[1];
	var y2 = v1[1] > v2[1] ? v1[1] : v2[1];

	var x1 = v1[0] < v2[0] ? v1[0] : v2[0];
	var x2 = v1[0] > v2[0] ? v1[0] : v2[0];

	var slope = (x2 - x1) / (y2 - y1);
	return slope * (y - y1) + x1;
};

vec2.getY = function(v1, v2, x, dest) {
	var y1 = v1[1] < v2[1] ? v1[1] : v2[1];
	var y2 = v1[1] > v2[1] ? v1[1] : v2[1];

	var x1 = v1[0] < v2[0] ? v1[0] : v2[0];
	var x2 = v1[0] > v2[0] ? v1[0] : v2[0];

	var slope = (y2 - y1) / (x2 - x1);
	return slope * (x - x1) + y1;
};

vec2.length = function(v1, v2, dest) {
	var diff = v1.diff(v2);
	return Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));
};

vec2.clone = function(vec) {
	return [vec[0], vec[1]];
};