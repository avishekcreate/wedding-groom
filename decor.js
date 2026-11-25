/* Bengali decorations drawn in code: marigold toran, alpona bands. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- Marigold toran (garland swags across the top) ---------- */
  function garland(host) {
    var W = 460, H = 118, svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", class: "toran-svg" });
    var defs = el("defs", {}, svg);
    [["mgO", "#FFC24A", "#EE7A12"], ["mgY", "#FFE27A", "#F2A61E"], ["mgR", "#FF8A3D", "#C8441A"]].forEach(function (c) {
      var g = el("radialGradient", { id: c[0], cx: "40%", cy: "35%", r: "65%" }, defs);
      el("stop", { offset: "0", "stop-color": c[1] }, g);
      el("stop", { offset: "1", "stop-color": c[2] }, g);
    });
    var cord = el("g", {}, svg), beads = el("g", {}, svg);
    var joints = [0, W / 3, 2 * W / 3, W], topY = 6, sag = 46;
    var colors = ["url(#mgO)", "url(#mgY)", "url(#mgO)", "url(#mgR)"];

    function flower(x, y, r, i) {
      var g = el("g", { transform: "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")" }, beads);
      el("circle", { r: r, fill: colors[i % colors.length] }, g);
      el("circle", { r: r * 0.72, fill: "none", stroke: "rgba(150,50,0,.35)", "stroke-width": "0.8", "stroke-dasharray": "1.4 1.6" }, g);
      el("circle", { r: r * 0.38, fill: "none", stroke: "rgba(150,50,0,.3)", "stroke-width": "0.7", "stroke-dasharray": "1 1.3" }, g);
    }
    function leaf(x, y, angle) {
      el("path", { d: "M0 0 C 4 -4, 12 -4, 16 0 C 12 4, 4 4, 0 0 Z", fill: "#3F7D2A",
        transform: "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + angle.toFixed(0) + ")" }, beads);
    }
    for (var s = 0; s < 3; s++) {
      var x0 = joints[s], x1 = joints[s + 1], n = 15;
      el("path", { d: "M" + x0 + " " + topY + " Q " + (x0 + x1) / 2 + " " + (topY + sag * 2) + " " + x1 + " " + topY,
        fill: "none", stroke: "#7A4A12", "stroke-width": "1" }, cord);
      for (var i = 0; i <= n; i++) {
        var t = i / n, x = x0 + (x1 - x0) * t, y = topY + (1 - Math.pow(2 * t - 1, 2)) * sag;
        if (i % 5 === 2) leaf(x - 2, y + 4, 70 + (t - 0.5) * 60);
        flower(x, y, 7.2, i + s);
      }
    }
    // hanging strings with a mango-leaf bunch at each inner joint
    [W / 3, 2 * W / 3].forEach(function (x, k) {
      for (var j = 0; j < 5; j++) flower(x, topY + 12 + j * 13, 6.4 - j * 0.3, j + k);
      leaf(x - 1, topY + 80, 80); leaf(x + 1, topY + 80, 100); leaf(x, topY + 82, 90);
    });
    host.appendChild(svg);
  }

  /* ---------- Alpona band (white rice-paste style) ---------- */
  function alpona(host) {
    var tileW = 64, H = 34, svg = el("svg", { viewBox: "0 0 " + tileW * 8 + " " + H, preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", class: "alpona-svg" });
    var stroke = { fill: "none", stroke: "currentColor", "stroke-width": "1.3", "stroke-linecap": "round" };
    for (var i = 0; i < 8; i++) {
      var cx = i * tileW + tileW / 2, cy = H / 2, g = el("g", {}, svg);
      // lotus: five petals
      for (var p = -2; p <= 2; p++) {
        el("path", Object.assign({ d: "M0 0 C -5 -6, -4 -13, 0 -15 C 4 -13, 5 -6, 0 0",
          transform: "translate(" + cx + " " + (cy + 6) + ") rotate(" + p * 32 + ")" }, stroke), g);
      }
      el("circle", { cx: cx, cy: cy + 6, r: 2, fill: "currentColor" }, g);
      // scroll linking to the next lotus
      el("path", Object.assign({ d: "M" + (cx + 12) + " " + (cy + 8) + " c 6 -10, 14 -10, 20 0 c 3 5, 9 5, 12 0" }, stroke), g);
      [-14, 14].forEach(function (dx) { el("circle", { cx: cx + dx, cy: cy - 8, r: 1.4, fill: "currentColor" }, g); });
      el("circle", { cx: cx + tileW / 2, cy: cy - 10, r: 1.8, fill: "currentColor" }, g);
    }
    el("line", Object.assign({ x1: 0, y1: H - 2, x2: tileW * 8, y2: H - 2, "stroke-dasharray": "2 4" }, stroke), svg);
    host.appendChild(svg);
  }

  document.querySelectorAll("[data-decor='toran']").forEach(garland);
  document.querySelectorAll("[data-decor='alpona']").forEach(alpona);
})();
