/*
	Simple layer class by Elias Schütt
	Website: elias-schuett.de
	License: CC-BY-SA

	Not recommended for heavy animations.
*/

var Layer = function(container, index) {
	this.canvas = document.createElement("canvas");
	this.canvas.style.backgroundColor = "transparent";
	this.canvas.style.position = "absolute";
	this.canvas.style.zIndex = index || 0;
	this.canvas.width = container.getAttribute("width");
	this.canvas.height = container.getAttribute("height");
	container.appendChild(this.canvas);
};

Layer.prototype.setIndex = function(index) {
	this.canvas.style.zIndex = this.index;
};

Layer.prototype.getContext = function(type) {
	return this.canvas.getContext(this.contextType);
};