(function () {
  "use strict";
  var W = window.WEDDING;
  var sb = window.supabase.createClient(W.supabase.url, W.supabase.key, {
    auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" }
  });
  var $ = function (id) { return document.getElementById(id); };
  var SIDE = { bride: "কন্যাপক্ষ", groom: "বরপক্ষ" };
  var BN = "০১২৩৪৫৬৭৮৯";
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[d]; }); }
  var rows = [], filter = "all", query = "";

  function note(el, text, cls) { el.textContent = text; el.className = "note " + (cls || ""); }
  function showLogin() { $("loginPanel").hidden = false; $("appPanel").hidden = true; }
  function showApp() { $("loginPanel").hidden = true; $("appPanel").hidden = false; load(); }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("email").value.trim().toLowerCase();
    if (!email) return;
    $("loginBtn").disabled = true;
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } })
      .then(function (r) {
        if (r.error) throw r.error;
        note($("loginNote"), "ইমেলে একটি লগইন লিঙ্ক পাঠানো হয়েছে। এই ফোন বা কম্পিউটারেই লিঙ্কটি খুলুন।", "ok");
      })
      .catch(function (err) { note($("loginNote"), "লিঙ্ক পাঠানো যায়নি: " + (err.message || err), "err"); })
      .then(function () { $("loginBtn").disabled = false; });
  });

  function fmt(iso) {
    try {
      return new Date(iso).toLocaleString("bn-IN", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
    } catch (e) { return iso; }
  }

  function visible() {
    var q = query.toLowerCase();
    return rows.filter(function (m) {
      if (filter !== "all" && m.side !== filter) return false;
      return !q || m.name.toLowerCase().indexOf(q) >= 0 || m.message.toLowerCase().indexOf(q) >= 0;
    });
  }

  function render() {
    $("nAll").textContent = bn(rows.length);
    $("nGroom").textContent = bn(rows.filter(function (m) { return m.side === "groom"; }).length);
    $("nBride").textContent = bn(rows.filter(function (m) { return m.side === "bride"; }).length);
    var list = $("list"), shown = visible();
    list.innerHTML = "";
    if (!rows.length) { note($("listNote"), "এখনও কোনো বার্তা আসেনি। অতিথিরা কার্ড থেকে আশীর্বাদ পাঠালে এখানে দেখা যাবে।"); return; }
    if (!shown.length) { note($("listNote"), "এই খোঁজে কোনো বার্তা মেলেনি।"); return; }
    note($("listNote"), "");
    shown.forEach(function (m) {
      var item = document.createElement("article"); item.className = "msg";
      var head = document.createElement("div"); head.className = "msg-head";
      var who = document.createElement("span"); who.className = "msg-name"; who.textContent = m.name;
      var tag = document.createElement("span"); tag.className = "tag"; tag.textContent = SIDE[m.side]; who.appendChild(tag);
      var when = document.createElement("span"); when.className = "msg-time"; when.textContent = fmt(m.created_at);
      head.appendChild(who); head.appendChild(when);
      var text = document.createElement("p"); text.className = "msg-text"; text.textContent = m.message;
      var del = document.createElement("button"); del.className = "del"; del.type = "button"; del.textContent = "মুছে ফেলুন";
      del.addEventListener("click", function () {
        if (del.dataset.confirm !== "1") { del.dataset.confirm = "1"; del.textContent = "নিশ্চিত? আবার চাপুন"; return; }
        sb.from("wedding_messages").delete().eq("id", m.id).then(function (r) {
          if (r.error) { note($("listNote"), "মোছা যায়নি: " + r.error.message, "err"); return; }
          rows = rows.filter(function (x) { return x.id !== m.id; });
          render();
        });
      });
      item.appendChild(head); item.appendChild(text); item.appendChild(del);
      list.appendChild(item);
    });
  }

  function load() {
    note($("listNote"), "লোড হচ্ছে…");
    sb.from("wedding_messages").select("id, side, name, message, created_at")
      .order("created_at", { ascending: false }).limit(5000)
      .then(function (res) {
        if (res.error) { note($("listNote"), "লোড করা যায়নি: " + res.error.message, "err"); return; }
        rows = res.data || [];
        if (!rows.length) {
          return sb.rpc("is_wedding_admin", { p_side: W.side }).then(function (r) {
            if (r.error || !r.data) {
              note($("listNote"), "এই ইমেলের বার্তা দেখার অনুমতি নেই। অন্য ইমেলে লগইন করুন।", "err");
              return;
            }
            render();
          });
        }
        $("updated").textContent = "শেষ আপডেট: " + fmt(new Date().toISOString());
        render();
      });
  }

  function csv() {
    var shown = visible();
    var esc = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    var lines = [["Name", "Message", "Card", "Sent at (IST)"].map(esc).join(",")];
    shown.forEach(function (m) {
      var when = new Date(m.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      lines.push([m.name, m.message, m.side === "groom" ? "Groom side" : "Bride side", when].map(esc).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wedding-blessings-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  document.querySelector(".tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]"); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll(".tabs button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });
  $("q").addEventListener("input", function () { query = this.value.trim(); render(); });
  $("csv").addEventListener("click", csv);
  $("refresh").addEventListener("click", load);
  $("logout").addEventListener("click", function () { sb.auth.signOut().then(showLogin); });
  setInterval(function () { if (!$("appPanel").hidden && !document.hidden) load(); }, 60000);

  sb.auth.onAuthStateChange(function (event, session) { if (event === "SIGNED_IN" && session) showApp(); });
  sb.auth.getSession().then(function (r) { if (r.data && r.data.session) showApp(); else showLogin(); });
})();
