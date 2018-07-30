// canvas settings
var viewWidth = 768,
  viewHeight = 768,
  canvas = document.getElementById("canvas"),
  ctx;

// todo: make mouse tracker
var mouse,
  mouse0,
  mouse1,
  mouseInRect = false;

var elasticRect,
  pattern,
  expanded = false;

var buttonText = "HOVER";

window.onload = function() {
  var img = new Image();
  img.onload = function() {
    initCanvas();

    pattern = ctx.createPattern(img, "repeat");

    canvas.addEventListener("mousemove", function(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouseInRect = contains(elasticRect, mouse);
    });
    canvas.addEventListener("click", function(e) {
      if (mouseInRect) {
        if (expanded) {
          elasticRect.resize(256, 256, 256, 256);
        } else {
          elasticRect.resize(128, 128, 512, 512);
        }

        expanded = !expanded;
      }
    });

    requestAnimationFrame(loop);
  };

  img.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/woods.jpg";

  mouse = new Point();
  mouse0 = new Point();
  mouse1 = new Point();

  elasticRect = new ElasticRect(256, 256, 256, 256);
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

  if (mouseInRect) {
    canvas.style.cursor = "pointer";
    buttonText = "CLICK";
  } else {
    canvas.style.cursor = "default";
    buttonText = "HOVER";
  }

  elasticRect.update();
}

function draw() {
  ctx.clearRect(0, 0, viewWidth, viewHeight);
  elasticRect.draw();

  ctx.fillStyle = "#fff";
  ctx.font = "800 48px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(buttonText, 384, 384);
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
  resize: function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    var tl = new TimelineMax();

    tl.to(
      this.p0,
      0.3,
      { x: x, y: y, ease: Cubic.easeIn },
      Math.random() * 0.25
    );
    tl.to(
      this.p1,
      0.3,
      { x: x + w, y: y, ease: Cubic.easeIn },
      Math.random() * 0.25
    );
    tl.to(
      this.p2,
      0.3,
      { x: x + w, y: y + h, ease: Cubic.easeIn },
      Math.random() * 0.25
    );
    tl.to(
      this.p3,
      0.3,
      { x: x, y: y + h, ease: Cubic.easeIn },
      Math.random() * 0.25
    );

    tl.to(
      this.c0,
      2,
      {
        x: x + w * 0.5,
        y: y,
        ease: Elastic.easeOut,
        easeParams: this.elasticParams
      },
      Math.random() * 0.5
    );
    tl.to(
      this.c1,
      2,
      {
        x: x + w,
        y: y + h * 0.5,
        ease: Elastic.easeOut,
        easeParams: this.elasticParams
      },
      Math.random() * 0.5
    );
    tl.to(
      this.c2,
      2,
      {
        x: x + w * 0.5,
        y: y + h,
        ease: Elastic.easeOut,
        easeParams: this.elasticParams
      },
      Math.random() * 0.5
    );
    tl.to(
      this.c3,
      2,
      {
        x: x,
        y: y + h * 0.5,
        ease: Elastic.easeOut,
        easeParams: this.elasticParams
      },
      Math.random() * 0.5
    );
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


