(function () {
  "use strict";
  var W = window.WEDDING;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Text ---------------- */
  var COMMON = {
    bn: {
      openCta: "অনুগ্রহ করে আমন্ত্রণ পত্র গ্রহণ করুন",
      openHint: "সিলমোহরে ছুঁয়ে খুলুন",
      ganesh: "ওম শ্রী গণেশায় নমঃ",
      prajapati: "শ্রী শ্রী প্রজাপতয়ে নমঃ",
      groomFirst: "অভিষেক", brideFirst: "বৈশালী", and: "ও",
      quote: "দুটি প্রাণের মিলনে গড়বে নতুন পথ চলা,<br>হাসি আনন্দে ভরে উঠুক প্রতিটি দোলা।",
      salutation: "সবিনয় নিবেদন,",
      familyTitle: "যাদের জন্য বাজবে সানাই&nbsp;।।",
      father: "পিতা", mother: "মাতা", brother: "ভ্রাতা",
      groomName: "কল্যাণীয় অভিষেক দাস", groomFather: "শ্রী রবীন্দ্র নাথ দাস", groomMother: "শ্রীমতি অনিতা দাস",
      brideName: "কল্যাণীয়া বৈশালী কর", brideFather: "শ্রী বাবন কর", brideMother: "শ্রীমতি শিউলি কর", brideBrother: "কৌশিক কর",
      momentTitle: "শুভক্ষণ",
      scratchNote: "সোনালি ঘরটি স্ক্র্যাচ করে শুভ দিনটি দেখুন",
      scratchDone: "আপনার উপস্থিতির অপেক্ষায় রইলাম",
      coinWord: "Scratch",
      days: "দিন", hours: "ঘণ্টা", minutes: "মিনিট", seconds: "সেকেন্ড",
      venueTitle: "অনুষ্ঠানস্থল",
      directions: "পথনির্দেশ দেখুন",
      wishTitle: "আশীর্বাদ পাঠান",
      wishNote: "নবদম্পতির জন্য দু-লাইন লিখে পাঠান। বর-কনে নিজেরা পড়বেন।",
      yourName: "আপনার নাম", yourWish: "আপনার শুভেচ্ছা", send: "আশীর্বাদ পাঠান", sending: "পাঠানো হচ্ছে…",
      sent: "আপনার আশীর্বাদ পৌঁছে গেছে। ধন্যবাদ!",
      needBoth: "নাম ও শুভেচ্ছা দুটোই লিখুন।",
      failed: "পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
      nibedak: "নিবেদক",
      mapTitle: "মানচিত্র"
    },
    en: {
      openCta: "Kindly accept our invitation",
      openHint: "Tap the seal to open",
      ganesh: "Om Shri Ganeshaya Namah",
      prajapati: "Shri Shri Prajapataye Namah",
      groomFirst: "Avishek", brideFirst: "Baishali", and: "&",
      quote: "As two lives unite to walk a new path together,<br>may every moment be filled with joy and laughter.",
      salutation: "Dear friends and family,",
      familyTitle: "For whom the shehnai will play",
      father: "Father", mother: "Mother", brother: "Brother",
      groomName: "Avishek Das", groomFather: "Sri Rabindra Nath Das", groomMother: "Smt. Anita Das",
      brideName: "Baishali Kar", brideFather: "Sri Baban Kar", brideMother: "Smt. Shiuli Kar", brideBrother: "Kaushik Kar",
      momentTitle: "The auspicious day",
      scratchNote: "Scratch the golden box to see the date",
      scratchDone: "We look forward to having you with us",
      coinWord: "Scratch",
      days: "days", hours: "hours", minutes: "minutes", seconds: "seconds",
      venueTitle: "Venue",
      directions: "Get directions",
      wishTitle: "Send your blessings",
      wishNote: "Write a few lines for the couple. Avishek and Baishali will read every one.",
      yourName: "Your name", yourWish: "Your wishes", send: "Send blessings", sending: "Sending…",
      sent: "Your blessings have reached the couple. Thank you!",
      needBoth: "Please write both your name and your wishes.",
      failed: "Couldn't send. Check your internet connection and try again.",
      nibedak: "With warm regards",
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
    document.querySelectorAll("[data-i]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i"));
    });
    document.querySelectorAll("#lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    document.title = t("pageTitle");
    document.getElementById("mapFrame").title = t("mapTitle");
    if (coinRevealed) document.querySelector(".moment .section-note").innerHTML = t("scratchDone");
    tick();
    if (!coinTouched) drawCoin();
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
    var card = document.getElementById("card");
    var steps = reduceMotion ? [0, 0, 0, 0] : [0, 380, 760, 1900];
    document.getElementById("stage").classList.add("is-leaving");
    setTimeout(function () { envelope.classList.add("is-opening"); }, steps[0]);
    setTimeout(function () { envelope.classList.add("flap-behind"); }, steps[1]);
    setTimeout(function () { envelope.classList.add("card-out"); }, steps[2]);
    setTimeout(function () {
      document.body.classList.remove("is-closed");
      document.body.classList.add("is-open");
      card.removeAttribute("aria-hidden");
      window.scrollTo(0, 0);
      document.getElementById("lang").querySelector("button").focus({ preventScroll: true });
      petalShower();
      sizeCoin();
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
      p.style.transform = "scale(" + (0.6 + Math.random() * 0.7) + ")";
      box.appendChild(p);
    }
    setTimeout(function () { box.innerHTML = ""; }, 11000);
  }

  /* ---------------- Coin scratch ---------------- */
  var coin = document.getElementById("coin");
  var canvas = document.getElementById("coinCanvas");
  var ctx = canvas.getContext("2d");
  var coinRevealed = false, coinTouched = false, size = 0, sizeH = 0, dpr = 1;

  function sizeCoin() {
    var rect = coin.getBoundingClientRect(), s = Math.round(rect.width);
    if (!s || s === size) return;
    size = s; sizeH = Math.round(rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = s * dpr; canvas.height = sizeH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!coinRevealed) { coinTouched = false; drawCoin(); }
  }
  function drawCoin() {
    if (!size || coinRevealed) return;
    var w = size, h = sizeH;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#8E6526"); g.addColorStop(0.25, "#D9B45E"); g.addColorStop(0.5, "#F8E6A8");
    g.addColorStop(0.75, "#C99A45"); g.addColorStop(1, "#8E6526");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // small repeated watermark
    ctx.save();
    ctx.fillStyle = "rgba(91,15,34,.16)";
    ctx.font = "italic 600 12px 'Cormorant Garamond', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.translate(w / 2, h / 2); ctx.rotate(-Math.PI / 9);
    var diag = Math.sqrt(w * w + h * h);
    for (var y = -diag / 2, row = 0; y < diag / 2; y += 22, row++) {
      for (var x = -diag / 2 + (row % 2) * 34; x < diag / 2; x += 68) ctx.fillText("Scratch", x, y);
    }
    ctx.restore();
    // frame and centre label
    ctx.strokeStyle = "rgba(255,244,210,.7)"; ctx.lineWidth = 1;
    ctx.strokeRect(8.5, 8.5, w - 17, h - 17);
    var lw = 150, lh = 46;
    ctx.fillStyle = "rgba(251,245,233,.92)";
    roundRect((w - lw) / 2, (h - lh) / 2, lw, lh, 23); ctx.fill();
    ctx.strokeStyle = "#C9A04E"; ctx.stroke();
    ctx.fillStyle = "#5B0F22"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "italic 600 24px 'Cormorant Garamond', serif";
    ctx.fillText(t("coinWord"), w / 2, h / 2 + 1);
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function scratch(x, y) {
    coinTouched = true;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x, y, Math.max(20, size * 0.075), 0, Math.PI * 2); ctx.fill();
  }
  var lastCheck = 0;
  function checkReveal(force) {
    var now = Date.now();
    if (coinRevealed || (!force && now - lastCheck < 120)) return;
    lastCheck = now;
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var step = Math.max(4, Math.round(6 * dpr)), w = canvas.width, h = canvas.height, total = 0, clear = 0;
    for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) {
      total++; if (data[(y * w + x) * 4 + 3] < 40) clear++;
    }
    if (total && clear / total > 0.5) {
      coinRevealed = true;
      coin.classList.add("is-revealed");
      document.querySelector(".moment .section-note").innerHTML = t("scratchDone");
      burst();
    }
  }
  function pos(e) {
    var b = canvas.getBoundingClientRect();
    var p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - b.left, y: p.clientY - b.top };
  }
  var drawing = false;
  function down(e) { drawing = true; var p = pos(e); scratch(p.x, p.y); e.preventDefault(); }
  function move(e) { if (!drawing && e.pointerType === "mouse" && (e.buttons & 1)) drawing = true; if (!drawing) return; var p = pos(e); scratch(p.x, p.y); checkReveal(false); e.preventDefault(); }
  function up() { if (drawing) { drawing = false; checkReveal(true); } }
  canvas.addEventListener("pointerdown", function (e) { canvas.setPointerCapture(e.pointerId); down(e); });
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctx.clearRect(0, 0, size, sizeH); checkReveal(true); }
  });
  canvas.tabIndex = 0;
  window.addEventListener("resize", sizeCoin);

  function burst() {
    if (reduceMotion) return;
    var b = coin.getBoundingClientRect(), box = document.getElementById("petals");
    var colors = ["#F2A93B", "#C9A04E", "#A3182F", "#F6C451"];
    for (var i = 0; i < 26; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.cssText = "top:" + (b.top + b.height / 2) + "px;left:" + (b.left + b.width / 2) + "px;background:" + colors[i % 4] +
        ";animation:none;transition:transform 1.4s cubic-bezier(.15,.7,.3,1),opacity 1.4s";
      box.appendChild(p);
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
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = Math.max(0, target - Date.now());
    document.getElementById("cdD").textContent = num(Math.floor(d / 864e5));
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
  function setStatus(key, cls) { statusEl.textContent = t(key); statusEl.className = "form-status " + (cls || ""); }
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
    }).catch(function () {
      setStatus("failed", "err");
    }).then(function () {
      btn.disabled = false; btn.textContent = t("send");
    });
  });

  /* ---------------- Start ---------------- */
  applyText();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!coinTouched) drawCoin(); });
})();
