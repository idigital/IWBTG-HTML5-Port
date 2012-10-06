window.onload = function() {
	include(["js/vec2.js", "js/spritesheet.js"], init);
};

var IWBTG = {};

IWBTG.game = (function() {

	var gravity = 2.0,
		running = true,
		player,
		sprites,
		map,
		canvas,
		ctx,
		CX, CY,
		clearing = [],
		loop;

	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);

	function keyUp(e) {
		if (!e) { var e = window.event; }
		var c = e.keyCode;
	}

	function keyDown(e) {
		if (!e) { var e = window.event; }
		var c = e.keyCode;

		// ESC
		if (c == 27) {
			e.preventDefault();
			running ? pause() : play();
		}
	}

	function clear(x, y, w, h) {

		if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
			clearing.push([x, y, w, h]);
			return;
		}

		for (var i = 0, l = clearing.length; i < l; i++) {
			var x = clearing[i][0];
			var y = clearing[i][1];
			var w = clearing[i][2];
			var h = clearing[i][3];
			ctx.clearRect(x, y, w, h);
		}

		clearing = [];
	}

	function update() {
		player.update();
	}

	function draw() {
		clear();
		sprites.draw();
		player.draw();
		map.draw();
	}

	function init() {

		canvas = document.getElementById("canvas");
		ctx = canvas.getContext("2d");

		CX = Math.round(canvas.width/2);
		CY = Math.round(canvas.height/2);

		player = new IWBTG.player(globals);
		map = new IWBTG.map(globals);
		sprites = new IWBTG.sprites(globals);

		var preload = new Ticker(+new Date, 100, function() {
			if (player.ready() && map.ready() && sprites.ready()) {
				preload.auto_reset = false;

				loop = new Loop(function() {
					if (running) {
						update();
						draw();
					}
				});

				loop.start();

				var debug = new Ticker(+new Date, 1000, function() {
					document.getElementById("fps").innerHTML = "FPS: " + loop.fps.toFixed(2);
					document.getElementById("delta").innerHTML = "Delta: " + loop.delta.toFixed(2);
				});

				debug.auto_reset = 1;
			}
		});

		preload.auto_reset = true;
	}

	function pause() {
		running = false;
	}

	function play() {
		running = true;
	}

	function globals() {
		return {
			gravity : gravity,
			delta : loop ? loop.delta : null,
			canvas : canvas,
			clear : clear
		}
	}

	return {
		init : init,
		pause : pause,
		play : play
	}
});

IWBTG.player = (function(globals) {

	var globals = globals;
	var canvas = globals().canvas;
	var ctx = canvas.getContext("2d");

	var w = 25;
	var h = 25;

	var speed = 3;
	var dir = null;
	var lastDir = null;
	var bullets = [];

	var jump = false;
	var jump_max = 100;
	var dbjump = false;
	var dbjump_max = 50;

	var pos = vec2.create(250, 500);
	var vel = vec2.create();

	var dir = null;
	var ground = true;

	var spritesheet = new Spritesheet("img/sprites/player.png", w, h, function() {
		this.addState("idle", 0, 0).animate("x", 3, 6);
		this.addState("moving", 0, 1).animate("x", 4, 2);
		this.addState("jumping", 0, 2).animate("x", 1, 2);
		this.addState("falling", 0, 3).animate("x", 1, 4);
		this.addState("sliding", 0, 4).animate("x", 1, 2);
		this.addState("bullet", 0, 6).animate("x", 1, 1);
	});

	var mirror = false;

	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);

	function keyUp(e) {
		if (!e) { var e = window.event; }
		var c = e.keyCode;

		if (c == 65 || c == 37 || c == 68 || c == 39) {
			dir = null;

		} else if (c == 87 || c == 38 || c == 32) {
			jump = false;
			dbjump = dbjump ? -1 : false;
		}
	}

	function keyDown(e) {
		if (!e) { var e = window.event; }
		var c = e.keyCode;

		// A | Left
		if (c == 65 || c == 37) {
			e.preventDefault();
			dir = "l";
			lastDir = "l";
		}

		// D | Right
		if (c == 68 || c == 39) {
			e.preventDefault();
			dir = "r";
			lastDir = "r";
		}

		// Shift
		if (c == 16) {
			e.preventDefault();
			shoot();
		}		

		// W | Up | Space
		if (c == 87 || c == 38 || c == 32) {
			e.preventDefault();
			if (ground == true)
			{ jump = true; }
			else if (dbjump == 0)
			{ jump = false; dbjump = true; }
		}
	}

	function collisionCheck() {

		var next = vec2.clone(pos);
		next = vec2.add(next, vel);

		for (var i = 0, l = props.length; i < l; i++) {

			if (
				next[0] + w > props[i].pos[0] && next[0] < props[i].pos[0] + props[i].w &&
				next[1] + h > props[i].pos[1] && next[1] < props[i].pos[1] + props[i].h
			) {
				var overlap = [];

				overlap[0] = next[0] > props[i].pos[0] && next[0] < props[i].pos[0] + props[i].w ? next[0] : props[i].pos[0];
				overlap[1] = next[1] > props[i].pos[1] && next[1] < props[i].pos[1] + props[i].h ? next[1] : props[i].pos[1];

				overlap.w = next[0] + w < props[i].pos[0] + props[i].w ? next[0] < props[i].pos[0] ? (next[0] + w) - props[i].pos[0] : w : (props[i].pos[0] + props[i].w) - overlap[0];
				overlap.h = next[1] + h < props[i].pos[1] + props[i].h ? next[1] < props[i].pos[1] ? (next[1] + h) - props[i].pos[1] : h : (props[i].pos[1] + props[i].h) - overlap[1];

				if (overlap.w > overlap.h) {
					if (overlap[1] == next[1]) {
						vel[1] = 0;
						pos[1] = props[i].pos[1] + props[i].h;
						jump = false;
					} else {
						vel[1] = 0;
						pos[1] = props[i].pos[1] - h;
						ground = true;
					}
				} else {
					if (overlap[0] == next[0]) {
						vel[0] = 0;
						pos[0] = props[i].pos[0] + props[i].w;
					} else {
						vel[0] = 0;
						pos[0] = props[i].pos[0] - w;
					}
				}
			}
		}
	}

	function update() {

		var delta = globals().delta;
		var gravity = globals().gravity;

		if (dir == "l") {
			vel[0] = -speed;
			mirror = true;
		}
		else if (dir == "r") {
			vel[0] = speed;
			mirror = false;
		}
		else {
			vel[0] = 0;
		}

		if (jump != false || dbjump > 0) { spritesheet.setState("jumping"); }
		else if (ground == false) { spritesheet.setState("falling"); }
		else if (dir == null) { spritesheet.setState("idle"); }
		else { spritesheet.setState("moving"); }

		ground = false;

		if (jump) {
			jump = jump === true ? pos[1] : jump;

			if (pos[1] > jump - jump_max) {
				vel[1] = -speed*2;
			} else {
				jump = false;
			}

		} else if (dbjump > 0) {
			dbjump = dbjump === true ? pos[1] : dbjump;

			if (pos[1] > dbjump - dbjump_max) {
				vel[1] = -speed*2;
			} else {
				dbjump = -1;
			}

		// Gravity
		} else if (pos[1] + h < canvas.height-32) {
			
			if (vel[1] < -1)
			{ vel[1] *= 0.2;  }
			else if (vel[1] < speed*gravity)
			{ vel[1] += 0.3; }

		} else {
			vel[1] = 0;
			pos[1] = canvas.height-h-32;
			ground = true;
			dbjump = 0;
		}

		vel = vec2.multiply(vel, delta);
		//collisionCheck();
		pos = vec2.add(pos, vel);

		for (var i = 0, l = bullets.length; i < l; i++) {
			if (bullets[i]) {
				if (bullets[i][2] == 1)
				{ bullets[i][0] += speed*4*delta; }
				else
				{ bullets[i][0] -= speed*4*delta; }

				if (bullets[i][0] < 0 || bullets[i][0] > canvas.width) { bullets.splice(i, 1); }
			}
		}
	}

	function draw() {
		var gravity = globals.gravity;
		var delta = globals.delta;
		var clear_range = (speed*gravity)*delta;

		ctx.drawImage(spritesheet.getState(null, mirror), Math.round(pos[0]), Math.round(pos[1]));
		globals().clear(Math.round(pos[0]), Math.round(pos[1]), w, h);

		for (var i = 0, l = bullets.length; i < l; i++) {

			var x = Math.round(bullets[i][0]);
			var y = Math.round(bullets[i][1]);

			ctx.drawImage(spritesheet.getState("bullet"), 0, 0, 4, 4, x, y, 4, 4);
			globals().clear(x, y, 4, 4);
		}
	}

	function shoot() {
		if (bullets.length < 4) {
			var d = lastDir == "l" ? 0 : 1;
			var x = pos[0]+w*d;
			var y = pos[1]+(h/2);

			bullets.push([x, y, d]);
		}
	}

	function ready() {
		return spritesheet.loaded ? true : false;
	}

	return {
		update : update,
		draw : draw,
		ready : ready
	};
});

IWBTG.sprites = (function(globals) {

	var globals = globals;
	var ctx = globals().canvas.getContext("2d");

	var sprites = {
		apple: {
			w: 24,
			h: 24,
			pos: vec2.create(100, 500),
			spritesheet: new Spritesheet("img/sprites/apple.png", 24, 24, function() {
				this.addState("wiggle", 0, 0).animate("x", 1, 10);
			})
		}
	};

	function draw() {
		for (var i in sprites) {
			ctx.drawImage(sprites[i].spritesheet.getState(), sprites[i].pos[0], sprites[i].pos[1]);
			globals().clear(sprites[i].pos[0], sprites[i].pos[1], sprites[i].w, sprites[i].h);
		}
	}

	function ready() {
		var loaded = 0;
		var count = 0;

		for (var i in sprites) {
			if (sprites[i].spritesheet.loaded) { loaded++; }
			count++;
		}

		return loaded == count && count ? true : false;
	}

	return {
		draw : draw,
		ready : ready
	};
});

IWBTG.map = (function(globals) {
	
	var globals = globals();
	var canvas = globals.canvas;
	var ctx = canvas.getContext("2d");

	var spritesheet = new Spritesheet("img/tilesets/default.png", 32, 32, function() {
		this.addState("grass", 0, 0);
	});

	function draw() {

		for (var i = 0, l = canvas.width/32; i < l; i++) {
			ctx.drawImage(spritesheet.getState(), 32*i, canvas.height-32);
		}
	}

	function ready() {
		return spritesheet.loaded ? true : false;
	}

	return {
		draw : draw,
		ready : ready
	};
});

function init() {
	var game = new IWBTG.game();
	game.init();
}