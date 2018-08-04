// canvas settings
var viewWidth = 255,
	viewHeight = 680,
	canvas = document.getElementById("canvas"),
	canvas2 = document.getElementById("canvas2"),	
	ctx;

// todo: make mouse tracker
var mouse,
	mouse0,
	mouse1,
	mouseInRect = false,
	mouseInBlock1 = false;

var elasticRect,
	block1,
	pattern,
	expanded = false,
	expanded1 = false;


window.onload = function() {
	var img = new Image();
	var img2 = new Image();

	img.onload = function() {
		initCanvas();

		pattern = ctx.createPattern(img, "no-repeat");

		canvas.addEventListener("mousemove", function(e) {
			var r = canvas.getBoundingClientRect();
			mouse.x = e.clientX - r.left;
			mouse.y = e.clientY - r.top;
			mouseInRect = contains(elasticRect, mouse);
		});

		requestAnimationFrame(loop);
	};

	img2.onload = function() {
		initCanvas();

		pattern = ctx.createPattern(img2, "no-repeat");

		canvas2.addEventListener("mousemove", function(e) {
			var r = canvas2.getBoundingClientRect();
			mouse.x = e.clientX - r.left;
			mouse.y = e.clientY - r.top;
			mouseInRect = contains(block1, mouse);
		});

		requestAnimationFrame(loop);
	};

	img.src = "../incredable.png";
	img2.src = "../skyscraper.png";

	mouse = new Point();
	mouse0 = new Point();
	mouse1 = new Point();

	elasticRect = new ElasticRect(20, 0, 200, 500);

	block1 = new ElasticRect(50, 0, 200, 145);
};



function initCanvas() {
	canvas.width = viewWidth;
	canvas.height = viewHeight;
	ctx = canvas.getContext("2d");
}

function update() {
	mouse0.x = mouse1.x;
	mouse0.y = mouse1.y;
	mouse1.x = mouse.x;
	mouse1.y = mouse.y;

	elasticRect.update();

}

function draw() {
	ctx.clearRect(0, 0, viewWidth, viewHeight);
	elasticRect.draw();
}

function loop() {
	update();
	draw();

	requestAnimationFrame(loop);
}

function Point(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}
Point.prototype = {
	draw: function() {
		ctx.fillStyle = "#f0f";
		ctx.beginPath();
		ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
		ctx.fill();
	}
};

function ElasticRect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.p0 = new Point(x, y);
	this.p1 = new Point(x + w, y);
	this.p2 = new Point(x + w, y + h);
	this.p3 = new Point(x, y + h);

	this.c0 = new Point(x + w * 0.5, y);
	this.c1 = new Point(x + w, y + h * 0.5);
	this.c2 = new Point(x + w * 0.5, y + h);
	this.c3 = new Point(x, y + h * 0.5);

	this.elasticParams = [1.5, 0.5];
}
ElasticRect.prototype = {
	update: function() {
		var i;

		i = intersect(mouse0, mouse1, this.p0, this.p1);

		if (i.intersects) {
			this.elastic(i, this.c0);
			return;
		}

		i = intersect(mouse0, mouse1, this.p1, this.p2);

		if (i.intersects) {
			this.elastic(i, this.c1);
			return;
		}

		i = intersect(mouse0, mouse1, this.p2, this.p3);

		if (i.intersects) {
			this.elastic(i, this.c2);
			return;
		}

		i = intersect(mouse0, mouse1, this.p3, this.p0);

		if (i.intersects) {
			this.elastic(i, this.c3);
			return;
		}
	},

	elastic: function(i, c) {
		var dx = mouse.x - i.x,
			dy = mouse.y - i.y;

		var tl = new TimelineMax();

		tl.to(c, 0.25, {
			x: dx * 1.5 + mouse1.x,
			y: dy * 1.5 + mouse1.y,
			ease: Cubic.easeOut
		});

		tl.to(c, 2, {
			x: i.x,
			y: i.y,
			ease: Elastic.easeOut,
			easeParams: this.elasticParams
		});

		//c.x = i.x;
		//c.y = i.y;
	},

	draw: function() {
		ctx.fillStyle = pattern;
		ctx.beginPath();

		ctx.moveTo(this.p0.x, this.p0.y);
		ctx.bezierCurveTo(
			this.c0.x,
			this.c0.y,
			this.c0.x,
			this.c0.y,
			this.p1.x,
			this.p1.y
		);
		ctx.bezierCurveTo(
			this.c1.x,
			this.c1.y,
			this.c1.x,
			this.c1.y,
			this.p2.x,
			this.p2.y
		);
		ctx.bezierCurveTo(
			this.c2.x,
			this.c2.y,
			this.c2.x,
			this.c2.y,
			this.p3.x,
			this.p3.y
		);
		ctx.bezierCurveTo(
			this.c3.x,
			this.c3.y,
			this.c3.x,
			this.c3.y,
			this.p0.x,
			this.p0.y
		);
		ctx.fill();
	}
};

function intersect(a1, a2, b1, b2) {
	var result = {
		intersects: false,
		x: null,
		y: null
	};

	var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
	var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
	var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

	if (u_b != 0) {
		var ua = ua_t / u_b;
		var ub = ub_t / u_b;

		if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
			result.intersects = true;
			result.x = a1.x + ua * (a2.x - a1.x);
			result.y = a1.y + ua * (a2.y - a1.y);
		}
	}

	return result;
}

function contains(rect, point) {
	return !(
		point.x < rect.x ||
		point.x > rect.x + rect.w ||
		point.y < rect.y ||
		point.y > rect.y + rect.h
	);
}

