(function () {
  "use strict";
  var W = window.WEDDING;
  var sb = window.supabase.createClient(W.supabase.url, W.supabase.key, {
    auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" }
  });
  var $ = function (id) { return document.getElementById(id); };
  var SIDE_LABEL = { bride: "কন্যাপক্ষ", groom: "বরপক্ষ" };

  function note(el, text, cls) { el.textContent = text; el.className = "note " + (cls || ""); }

  function showLogin() { $("loginPanel").hidden = false; $("listPanel").hidden = true; }
  function showList() { $("loginPanel").hidden = true; $("listPanel").hidden = false; load(); }

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

  function render(rows) {
    var list = $("list");
    list.innerHTML = "";
    $("count").textContent = rows.length ? rows.length + "টি বার্তা" : "";
    if (!rows.length) { note($("listNote"), "এখনও কোনো বার্তা আসেনি। কার্ডের লিঙ্ক অতিথিদের পাঠালে এখানে দেখা যাবে।"); return; }
    note($("listNote"), "");
    rows.forEach(function (m) {
      var item = document.createElement("article"); item.className = "msg";
      var head = document.createElement("div"); head.className = "msg-head";
      var who = document.createElement("span"); who.className = "msg-name"; who.textContent = m.name;
      if ($("bothSides").checked) { var s = document.createElement("span"); s.className = "msg-side"; s.textContent = SIDE_LABEL[m.side]; who.appendChild(s); }
      var when = document.createElement("span"); when.className = "msg-time"; when.textContent = fmt(m.created_at);
      head.appendChild(who); head.appendChild(when);
      var text = document.createElement("p"); text.className = "msg-text"; text.textContent = m.message;
      var del = document.createElement("button"); del.className = "del"; del.type = "button"; del.textContent = "মুছে ফেলুন";
      del.addEventListener("click", function () {
        if (del.dataset.confirm !== "1") { del.dataset.confirm = "1"; del.textContent = "নিশ্চিত? আবার চাপুন"; return; }
        sb.from("wedding_messages").delete().eq("id", m.id).then(function (r) {
          if (r.error) { note($("listNote"), "মোছা যায়নি: " + r.error.message, "err"); return; }
          item.remove();
        });
      });
      item.appendChild(head); item.appendChild(text); item.appendChild(del);
      list.appendChild(item);
    });
  }

  function load() {
    note($("listNote"), "লোড হচ্ছে…");
    sb.rpc("is_wedding_admin", { p_side: W.side }).then(function (r) {
      if (r.error || !r.data) {
        note($("listNote"), "এই ইমেলের বার্তা দেখার অনুমতি নেই। অন্য ইমেলে লগইন করুন।", "err");
        $("list").innerHTML = ""; $("count").textContent = "";
        return;
      }
      var q = sb.from("wedding_messages").select("id, side, name, message, created_at").order("created_at", { ascending: false }).limit(1000);
      if (!$("bothSides").checked) q = q.eq("side", W.side);
      q.then(function (res) {
        if (res.error) { note($("listNote"), "লোড করা যায়নি: " + res.error.message, "err"); return; }
        render(res.data || []);
      });
    });
  }

  $("refresh").addEventListener("click", load);
  $("bothSides").addEventListener("change", load);
  $("logout").addEventListener("click", function () { sb.auth.signOut().then(showLogin); });

  sb.auth.onAuthStateChange(function (event, session) {
    if (event === "SIGNED_IN" && session) showList();
  });
  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) showList(); else showLogin();
  });
})();
