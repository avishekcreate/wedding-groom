(function () {
  "use strict";
  var W = window.WEDDING;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) document.documentElement.classList.add("anim");

  /* ---------------- Text shared by both cards ---------------- */
  var COMMON = {
    bn: {
      openCta: "অনুগ্রহ করে আমন্ত্রণ পত্র গ্রহণ করুন",
      openHint: "সিলমোহরে ছুঁয়ে খুলুন",
      ganesh: "ওম শ্রী গণেশায় নমঃ",
      prajapati: "শ্রী শ্রী প্রজাপতয়ে নমঃ",
      occasion: "শুভঃ বিবাহ",
      familyTitle: "যাদের জন্য বাজবে সানাই&nbsp;।।",
      kalyaniyo: "কল্যাণীয়", kalyaniya: "কল্যাণীয়া",
      father: "পিতা", mother: "মাতা", brother: "ভ্রাতা",
      groomName: "অভিষেক দাস", groomFather: "শ্রী রবীন্দ্র নাথ দাস", groomMother: "শ্রীমতী অনিতা দাস",
      brideName: "বৈশালী কর", brideFather: "শ্রী বাবন কর", brideMother: "শ্রীমতী শিউলি কর", brideBrother: "কৌশিক কর",
      quote: "দুটি প্রাণের মিলনে গড়বে নতুন পথ চলা,<br>হাসি আনন্দে ভরে উঠুক প্রতিটি দোলা।",
      salutation: "সবিনয় নিবেদন,",
      nibedak: "নিবেদক",
      together: "অভিষেক ও বৈশালী",
      days: "দিন", hours: "ঘণ্টা", minutes: "মিনিট", seconds: "সেকেন্ড",
      venueTitle: "অনুষ্ঠানস্থল",
      directions: "পথনির্দেশ দেখুন",
      wishTitle: "আশীর্বাদ পাঠান",
      wishNote: "নবদম্পতির জন্য দু-লাইন লিখে পাঠান।",
      yourName: "আপনার নাম", yourWish: "আপনার শুভেচ্ছা", send: "আশীর্বাদ পাঠান", sending: "পাঠানো হচ্ছে…",
      sent: "আপনার আশীর্বাদ পৌঁছে গেছে। ধন্যবাদ!",
      needBoth: "নাম ও শুভেচ্ছা দুটোই লিখুন।",
      failed: "পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
      mapTitle: "মানচিত্র"
    },
    en: {
      openCta: "Kindly accept our invitation",
      openHint: "Tap the seal to open",
      ganesh: "Om Shri Ganeshaya Namah",
      prajapati: "Shri Shri Prajapataye Namah",
      occasion: "Shubho Bibaho",
      familyTitle: "For whom the shehnai will play",
      kalyaniyo: "Our beloved", kalyaniya: "Our beloved",
      father: "Father", mother: "Mother", brother: "Brother",
      groomName: "Avishek Das", groomFather: "Sri Rabindra Nath Das", groomMother: "Smt. Anita Das",
      brideName: "Baishali Kar", brideFather: "Sri Baban Kar", brideMother: "Smt. Shiuli Kar", brideBrother: "Kaushik Kar",
      quote: "As two lives unite to walk a new path together,<br>may every moment be filled with joy and laughter.",
      salutation: "Dear friends and family,",
      nibedak: "With warm regards",
      together: "Avishek &amp; Baishali",
      days: "days", hours: "hours", minutes: "minutes", seconds: "seconds",
      venueTitle: "Venue",
      directions: "Get directions",
      wishTitle: "Send your blessings",
      wishNote: "Write a few lines for the couple.",
      yourName: "Your name", yourWish: "Your wishes", send: "Send blessings", sending: "Sending…",
      sent: "Your blessings have reached the couple. Thank you!",
      needBoth: "Please write both your name and your wishes.",
      failed: "Couldn't send. Check your internet connection and try again.",
      mapTitle: "Map"
    }
  };

  var lang = "bn";
  try { if (localStorage.getItem("wedding-lang") === "en") lang = "en"; } catch (e) {}

  function t(key) {
    var side = W.text[lang] || {};
    if (side[key] !== undefined) return side[key];
    return COMMON[lang][key] !== undefined ? COMMON[lang][key] : "";
  }
  var BN_DIGITS = "০১২৩৪৫৬৭৮৯";
  function num(n) {
    var s = String(n);
    return lang === "bn" ? s.replace(/\d/g, function (d) { return BN_DIGITS[d]; }) : s;
  }

  function applyText() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i")); });
    document.querySelectorAll("#lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    document.title = t("pageTitle");
    document.getElementById("mapFrame").title = t("mapTitle");
    tick();
  }
  document.getElementById("lang").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]");
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("wedding-lang", lang); } catch (err) {}
    applyText();
  });

  /* ---------------- Envelope ---------------- */
  var envelope = document.getElementById("envelope");
  var opened = false;
  function openInvitation() {
    if (opened) return;
    opened = true;
    var steps = reduceMotion ? [0, 0, 0, 0] : [0, 380, 760, 1900];
    document.getElementById("stage").classList.add("is-leaving");
    setTimeout(function () { envelope.classList.add("is-opening"); }, steps[0]);
    setTimeout(function () { envelope.classList.add("flap-behind"); }, steps[1]);
    setTimeout(function () { envelope.classList.add("card-out"); }, steps[2]);
    setTimeout(function () {
      document.body.classList.remove("is-closed");
      document.body.classList.add("is-open");
      document.getElementById("card").removeAttribute("aria-hidden");
      window.scrollTo(0, 0);
      petalShower();
      sizeCoin();
      startReveals();
    }, steps[3]);
  }
  envelope.addEventListener("click", openInvitation);
  document.getElementById("openBtn").addEventListener("click", openInvitation);

  /* ---------------- Petals (once, on open) ---------------- */
  function petalShower() {
    if (reduceMotion) return;
    var box = document.getElementById("petals");
    var colors = ["#F2A93B", "#E8862A", "#C9A04E", "#A3182F", "#F6C451"];
    for (var i = 0; i < 34; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--d", 5 + Math.random() * 4 + "s");
      p.style.setProperty("--x", (Math.random() - 0.5) * 140 + "px");
      p.style.setProperty("--r", 300 + Math.random() * 500 + "deg");
      p.style.animationDelay = Math.random() * 1.6 + "s";
      box.appendChild(p);
    }
    setTimeout(function () { box.innerHTML = ""; }, 11000);
  }

  /* ---------------- Scroll reveals (each section once) ---------------- */
  var countedUp = false;
  function startReveals() {
    var els = document.querySelectorAll(".rv");
    if (!document.documentElement.classList.contains("anim")) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
        if (en.target.id === "countdown") countUp();
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }
  function countUp() {
    if (countedUp || reduceMotion) return;
    countedUp = true;
    var el = document.getElementById("cdD"), end = Math.floor(Math.max(0, target - Date.now()) / 864e5), t0 = null;
    holdDays = true;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      el.textContent = num(Math.round(end * e));
      if (k < 1) requestAnimationFrame(step); else holdDays = false;
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Date box: scratch the watermark ---------------- */
  var box = document.getElementById("coin");
  var canvas = document.getElementById("coinCanvas");
  var ctx = canvas.getContext("2d");
  var revealed = false, w = 0, h = 0, dpr = 1;

  function sizeCoin() {
    var r = box.getBoundingClientRect();
    var nw = Math.round(r.width), nh = Math.round(r.height);
    if (!nw || (nw === w && nh === h) || revealed) return;
    w = nw; h = nh; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover();
  }
  function drawCover() {
    if (!w || revealed) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#8E6526"); g.addColorStop(0.25, "#D9B45E"); g.addColorStop(0.5, "#F8E6A8");
    g.addColorStop(0.75, "#C99A45"); g.addColorStop(1, "#8E6526");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.fillStyle = "rgba(91,15,34,.22)";
    ctx.font = "italic 600 13px 'Cormorant Garamond', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.translate(w / 2, h / 2); ctx.rotate(-Math.PI / 9);
    var diag = Math.sqrt(w * w + h * h);
    for (var y = -diag / 2, row = 0; y < diag / 2; y += 22, row++) {
      for (var x = -diag / 2 + (row % 2) * 36; x < diag / 2; x += 72) ctx.fillText("Scratch", x, y);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,244,210,.75)"; ctx.lineWidth = 1;
    ctx.strokeRect(8.5, 8.5, w - 17, h - 17);
  }
  function scratch(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x, y, Math.max(20, w * 0.075), 0, Math.PI * 2); ctx.fill();
  }
  var lastCheck = 0;
  function checkReveal(force) {
    var now = Date.now();
    if (revealed || (!force && now - lastCheck < 120)) return;
    lastCheck = now;
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var step = Math.max(4, Math.round(6 * dpr)), cw = canvas.width, ch = canvas.height, total = 0, clear = 0;
    for (var y = 0; y < ch; y += step) for (var x = 0; x < cw; x += step) { total++; if (data[(y * cw + x) * 4 + 3] < 40) clear++; }
    if (total && clear / total > 0.5) { revealed = true; box.classList.add("is-revealed"); burst(); }
  }
  function pos(e) { var b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
  var drawing = false;
  canvas.addEventListener("pointerdown", function (e) { canvas.setPointerCapture(e.pointerId); drawing = true; var p = pos(e); scratch(p.x, p.y); e.preventDefault(); });
  canvas.addEventListener("pointermove", function (e) {
    if (!drawing && e.pointerType === "mouse" && (e.buttons & 1)) drawing = true;
    if (!drawing) return; var p = pos(e); scratch(p.x, p.y); checkReveal(false); e.preventDefault();
  });
  function up() { if (drawing) { drawing = false; checkReveal(true); } }
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.tabIndex = 0;
  canvas.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctx.clearRect(0, 0, w, h); checkReveal(true); }
  });
  window.addEventListener("resize", sizeCoin);

  function burst() {
    if (reduceMotion) return;
    var b = box.getBoundingClientRect(), layer = document.getElementById("petals");
    var colors = ["#F2A93B", "#C9A04E", "#A3182F", "#F6C451"];
    for (var i = 0; i < 26; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.cssText = "top:" + (b.top + b.height / 2) + "px;left:" + (b.left + b.width / 2) + "px;background:" + colors[i % 4] +
        ";animation:none;transition:transform 1.4s cubic-bezier(.15,.7,.3,1),opacity 1.4s";
      layer.appendChild(p);
      (function (el, a, d) {
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          el.style.transform = "translate(" + Math.cos(a) * d + "px," + (Math.sin(a) * d + 60) + "px) rotate(" + (a * 300) + "deg)";
          el.style.opacity = "0";
        }); });
        setTimeout(function () { el.remove(); }, 1600);
      })(p, Math.random() * Math.PI * 2, 90 + Math.random() * 110);
    }
  }

  /* ---------------- Countdown ---------------- */
  var target = new Date(W.event.countdownTo).getTime();
  var holdDays = false;
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = Math.max(0, target - Date.now());
    if (!holdDays) document.getElementById("cdD").textContent = num(Math.floor(d / 864e5));
    document.getElementById("cdH").textContent = num(pad(Math.floor(d % 864e5 / 36e5)));
    document.getElementById("cdM").textContent = num(pad(Math.floor(d % 36e5 / 6e4)));
    document.getElementById("cdS").textContent = num(pad(Math.floor(d % 6e4 / 1e3)));
  }
  setInterval(tick, 1000);

  /* ---------------- Map ---------------- */
  document.getElementById("mapFrame").src = "https://maps.google.com/maps?q=" + encodeURIComponent(W.event.mapQuery) + "&z=15&output=embed";
  document.getElementById("mapLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(W.event.mapQuery);

  /* ---------------- Wishes ---------------- */
  var form = document.getElementById("wishForm");
  var statusEl = document.getElementById("wishStatus");
  var btn = document.getElementById("wishBtn");
  function setStatus(key, cls) { statusEl.textContent = key ? t(key) : ""; statusEl.className = "form-status " + (cls || ""); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), message = form.message.value.trim();
    if (form.website.value) { setStatus("sent", "ok"); form.reset(); return; }
    if (!name || !message) { setStatus("needBoth", "err"); (name ? form.message : form.name).focus(); return; }
    btn.disabled = true; btn.textContent = t("sending"); setStatus("", "");
    fetch(W.supabase.url + "/rest/v1/wedding_messages", {
      method: "POST",
      headers: { "apikey": W.supabase.key, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ side: W.side, name: name.slice(0, 80), message: message.slice(0, 1000) })
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      form.reset(); setStatus("sent", "ok");
    }).catch(function () { setStatus("failed", "err"); })
      .then(function () { btn.disabled = false; btn.textContent = t("send"); });
  });

  /* ---------------- Start ---------------- */
  applyText();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!revealed && w) { w = 0; sizeCoin(); } });
})();
