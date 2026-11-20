/* Ghost Ship Files v3: nav, click-to-play youtube-nocookie, case filters, per-File view, gentle motion. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var nav = d.getElementById("site-nav"), toggle = d.getElementById("menu-toggle");
  if (toggle && nav) {
    var setOpen = function (o) {
      nav.classList.toggle("is-open", o);
      toggle.setAttribute("aria-expanded", o ? "true" : "false");
      toggle.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  }

  function play(el) {
    if (el.classList.contains("is-playing")) return;
    var id = el.getAttribute("data-id");
    if (!id) return;
    var f = d.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    f.title = el.getAttribute("data-title") || "Ghost Ship Files";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    el.classList.add("is-playing");
    el.appendChild(f);
  }
  function stop(scope) {
    scope.querySelectorAll(".yt-lite.is-playing").forEach(function (el) {
      var f = el.querySelector("iframe"); if (f) f.remove();
      el.classList.remove("is-playing");
    });
  }
  d.addEventListener("click", function (e) { var el = e.target.closest(".yt-lite"); if (el) play(el); });
  d.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest && e.target.closest(".yt-lite");
    if (el) { e.preventDefault(); play(el); }
  });

  // Per-File view: #file-NN opens that case (CSS :target does the same without JS).
  var baseTitle = d.title;
  function route() {
    var cases = d.querySelectorAll(".case");
    if (!cases.length) return;
    var h = location.hash.slice(1), open = null;
    cases.forEach(function (c) {
      var on = c.id === h;
      c.classList.toggle("is-open", on);
      if (on) open = c; else stop(c);
    });
    if (open) {
      var t = open.querySelector("h2");
      d.title = open.querySelector(".dossier-tab").textContent + " · " + (t ? t.textContent : "") + " — Ghost Ship Files";
    } else d.title = baseTitle;
  }
  window.addEventListener("hashchange", route);
  route();

  // Case filters.
  var chips = d.querySelectorAll(".chip"), status = d.getElementById("filter-status");
  if (chips.length) {
    chips[0].parentNode.hidden = false;
    var folders = d.querySelectorAll(".folders-all .folder");
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var k = c.getAttribute("data-filter"), n = 0;
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        folders.forEach(function (f) {
          var show = k === "all" || (" " + f.getAttribute("data-tags") + " ").indexOf(" " + k + " ") > -1;
          f.hidden = !show; if (show) n++;
        });
        if (status) status.textContent = "Showing " + n + (n === 1 ? " File" : " Files") + ".";
      });
    });
  }



  // Accessible photo lightbox (About gallery). No-op on pages without one.
  var box = d.getElementById("lightbox");
  if (box) {
    var imgEl = d.getElementById("lightbox-img");
    var capEl = d.getElementById("lightbox-caption");
    var btnClose = box.querySelector(".lightbox-close");
    var btnPrev = box.querySelector(".lightbox-prev");
    var btnNext = box.querySelector(".lightbox-next");
    var links = Array.prototype.slice.call(d.querySelectorAll(".frame-link"));
    var lastFocus = null;
    var index = 0;

    function show(i) {
      if (!links.length) return;
      index = (i + links.length) % links.length;
      var a = links[index];
      var full = a.getAttribute("data-full") || a.getAttribute("href");
      var cap = a.getAttribute("data-caption") || "";
      var alt = a.getAttribute("data-alt") || cap;
      imgEl.src = full;
      imgEl.alt = alt;
      capEl.textContent = cap;
      btnPrev.disabled = links.length < 2;
      btnNext.disabled = links.length < 2;
    }
    function open(i) {
      lastFocus = d.activeElement;
      show(i);
      box.hidden = false;
      d.body.classList.add("lightbox-open");
      btnClose.focus();
    }
    function close() {
      box.hidden = true;
      d.body.classList.remove("lightbox-open");
      imgEl.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        open(i);
      });
    });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    d.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
      else if (e.key === "Tab") {
        var focusable = [btnClose, btnPrev, btnNext].filter(function (b) { return !b.disabled; });
        if (!focusable.length) return;
        var i = focusable.indexOf(d.activeElement);
        if (e.shiftKey) {
          if (i <= 0) { e.preventDefault(); focusable[focusable.length - 1].focus(); }
        } else if (i === focusable.length - 1 || i === -1) {
          e.preventDefault(); focusable[0].focus();
        }
      }
    });
  }

  if (still) return;
  // Reveal on scroll.
  if ("IntersectionObserver" in window) {
    root.classList.add("motion");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    d.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }
  // Slow hero parallax.
  var hero = d.querySelector(".hero-media img");
  if (hero) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        hero.style.setProperty("--py", (y * 0.25).toFixed(1) + "px");
        ticking = false;
      });
    }, { passive: true });
  }
})();
