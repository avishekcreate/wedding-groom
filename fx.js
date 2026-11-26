/* Petals and sparkles on one full-screen canvas.
   FX.shower(count)  – petals drifting down from the top
   FX.burst(x, y, k) – sparkles + petals flying out from a point (viewport px) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.createElement("canvas");
  cv.className = "fx";
  cv.setAttribute("aria-hidden", "true");
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(cv); });
  var ctx = cv.getContext("2d"), dpr = 1, W = 0, H = 0, parts = [], running = false, last = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  // marigold (orange, yellow), red rose, white rajanigandha
  var KINDS = [
    { w: 1, a: "#F7A21B", b: "#E06A0E", shape: "marigold" },
    { w: 1, a: "#FFD34E", b: "#F0A20E", shape: "marigold" },
    { w: .8, a: "#D6243A", b: "#8E1022", shape: "rose" },
    { w: .45, a: "#FFFDF6", b: "#E9E1CC", shape: "rose" }
  ];
  function pick() {
    var t = 0, r = Math.random() * 3.25;
    for (var i = 0; i < KINDS.length; i++) { t += KINDS[i].w; if (r <= t) return KINDS[i]; }
    return KINDS[0];
  }
  function petal(x, y, vx, vy, delay) {
    var k = pick();
    parts.push({ t: "p", k: k, x: x, y: y, vx: vx, vy: vy, s: 6 + Math.random() * 7,
      rot: Math.random() * 6.28, vr: (Math.random() - .5) * 3, flip: Math.random() * 6.28, vf: 2 + Math.random() * 4,
      sway: Math.random() * 6.28, life: 0, max: 7 + Math.random() * 4, delay: delay || 0 });
  }
  function sparkle(x, y, vx, vy) {
    parts.push({ t: "s", x: x, y: y, vx: vx, vy: vy, s: 3 + Math.random() * 6, life: 0, max: .7 + Math.random() * .7,
      tw: Math.random() * 6.28, c: Math.random() < .75 ? "#FFE7A3" : "#FFFFFF", delay: 0 });
  }

  function drawPetal(p) {
    var sc = Math.cos(p.flip);                       // 3D tumble: squash on one axis
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.max(.15, Math.abs(sc)));
    var g = ctx.createLinearGradient(0, -p.s, 0, p.s);
    g.addColorStop(0, sc > 0 ? p.k.a : p.k.b); g.addColorStop(1, sc > 0 ? p.k.b : p.k.a);
    ctx.fillStyle = g;
    ctx.beginPath();
    if (p.k.shape === "marigold") {                  // frilled petal
      ctx.moveTo(0, p.s);
      ctx.quadraticCurveTo(-p.s * .9, p.s * .2, -p.s * .55, -p.s * .7);
      ctx.lineTo(-p.s * .25, -p.s * .45); ctx.lineTo(0, -p.s * .85); ctx.lineTo(p.s * .25, -p.s * .45);
      ctx.lineTo(p.s * .55, -p.s * .7);
      ctx.quadraticCurveTo(p.s * .9, p.s * .2, 0, p.s);
    } else {                                          // rose / rajanigandha petal
      ctx.moveTo(0, p.s);
      ctx.bezierCurveTo(-p.s, p.s * .3, -p.s * .7, -p.s, 0, -p.s * .8);
      ctx.bezierCurveTo(p.s * .7, -p.s, p.s, p.s * .3, 0, p.s);
    }
    ctx.fill();
    ctx.restore();
  }
  function drawSparkle(p, alpha) {
    var r = p.s * (.6 + .4 * Math.abs(Math.sin(p.tw)));
    ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = alpha;
    ctx.fillStyle = p.c; ctx.shadowColor = "rgba(255,210,120,.9)"; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.fill(); ctx.restore();
  }

  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    ctx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.life += dt;
      if (p.t === "p") {
        p.vx *= .985; p.vy += (60 - p.vy) * .6 * dt;  // settle into a gentle fall
        p.sway += dt * 1.6;
        p.x += (p.vx + Math.sin(p.sway) * 22) * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt; p.flip += p.vf * dt;
        var fade = p.life > p.max - 1 ? Math.max(0, p.max - p.life) : 1;
        ctx.globalAlpha = .95 * fade; drawPetal(p); ctx.globalAlpha = 1;
        if (p.life > p.max || p.y > H + 30) parts.splice(i, 1);
      } else {
        p.vx *= .92; p.vy = p.vy * .92 + 30 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.tw += dt * 14;
        var a = 1 - p.life / p.max;
        if (a <= 0) { parts.splice(i, 1); continue; }
        drawSparkle(p, a);
      }
    }
    if (parts.length) requestAnimationFrame(frame); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  function run() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  window.FX = {
    shower: function (n) {
      if (reduce) return;
      for (var i = 0; i < n; i++) petal(Math.random() * W, -20 - Math.random() * 60, (Math.random() - .5) * 30, 40 + Math.random() * 50, Math.random() * 2.6);
      run();
    },
    burst: function (x, y, k) {
      if (reduce) return;
      k = k || 1;
      for (var i = 0; i < 40 * k; i++) {
        var a = Math.random() * 6.28, v = 160 + Math.random() * 260;
        sparkle(x, y, Math.cos(a) * v, Math.sin(a) * v - 40);
      }
      for (var j = 0; j < 30 * k; j++) {
        var b = Math.random() * 6.28, u = 120 + Math.random() * 220;
        petal(x, y, Math.cos(b) * u, Math.sin(b) * u - 120, 0);
      }
      run();
    }
  };
})();
