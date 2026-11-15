/* Ghost Ship Files v2b: small progressive enhancements. No tracking, no cookies, no network calls. */
(function () {
  "use strict";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function doy(mmdd) { var p = mmdd.split("-"); return Math.round((Date.UTC(2001, +p[0] - 1, +p[1]) - Date.UTC(2001, 0, 1)) / 864e5); }
  function label(mmdd) { var p = mmdd.split("-"); return MONTHS[+p[0] - 1] + " " + (+p[1]); }

  /* ---- This Day in Wreck History ---- */
  var box = document.querySelector("[data-wreck-day]");
  var data = window.GSF_WRECK_DAYS;
  if (box && data && data.length) {
    var now = new Date();
    var today = ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
    var t = doy(today), best = null, bestDist = 999;
    data.forEach(function (e) {
      var d = Math.abs(doy(e.d) - t); d = Math.min(d, 365 - d);
      if (d < bestDist) { bestDist = d; best = e.d; }
    });
    var hits = data.filter(function (e) { return e.d === best; }).slice(0, 2);
    var html = "";
    if (bestDist > 0) {
      html += '<p class="wd-note">Nothing verified in our log for ' + esc(label(today)) + '. Nearest date: <b>' + esc(label(best)) + "</b>.</p>";
    }
    hits.forEach(function (e) {
      html += '<article class="wd-entry"><p class="wd-date"><span>' + esc(label(e.d)) + "</span> <b>" + e.y + "</b></p>" +
        "<h3>" + esc(e.t) + "</h3><p>" + esc(e.s) + "</p>" +
        '<p class="wd-src">Source: <a href="' + esc(e.url) + '" rel="noopener" target="_blank">' + esc(e.src) + "</a>" +
        (e.file ? ' · <a class="wd-file" href="' + esc(e.file) + '">Open the File</a>' : "") + "</p></article>";
    });
    var near = data.filter(function (e) { return e.d !== best; }).map(function (e) {
      var d = doy(e.d) - t; if (d > 182) d -= 365; if (d < -182) d += 365; return {e: e, d: d};
    }).filter(function (x) { return Math.abs(x.d) <= 10; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 5);
    if (near.length) {
      html += '<div class="wd-week"><h4>Also around this date</h4><ul>' + near.map(function (x) {
        return "<li><b>" + esc(label(x.e.d)) + ", " + x.e.y + "</b> " +
          (x.e.file ? '<a href="' + esc(x.e.file) + '">' + esc(x.e.t) + "</a>" : '<a href="' + esc(x.e.url) + '" rel="noopener" target="_blank">' + esc(x.e.t) + "</a>") + "</li>";
      }).join("") + "</ul></div>";
    }
    var body = box.querySelector(".wd-body");
    if (body) body.innerHTML = html;
    var dl = box.querySelector(".wd-today");
    if (dl) dl.textContent = label(today);
  }

  /* ---- Email signup placeholder ----
     TODO(provider): no email service is connected. Once Jeremy approves a free provider, set the form's action
     to that provider's endpoint, change data-provider="TODO" to the provider name, and this handler steps aside. */
  Array.prototype.forEach.call(document.querySelectorAll("form.signup-form"), function (f) {
    f.addEventListener("submit", function (ev) {
      if (f.getAttribute("data-provider") !== "TODO") return; // real provider wired up: let it submit
      ev.preventDefault();
      var msg = f.parentNode.querySelector(".signup-msg");
      var input = f.querySelector("input[type=email]");
      if (input) input.value = ""; // nothing is stored or sent anywhere
      if (msg) {
        msg.hidden = false;
        msg.innerHTML = 'Thanks! The email list opens soon. Until then, <a href="https://www.youtube.com/@GhostShipFilesTV?sub_confirmation=1" rel="noopener">subscribe on YouTube</a> so you don\u2019t miss the next File.';
      }
    });
  });
})();
