/* BPG – Interaktionen – ohne Abhängigkeiten */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var body = document.body;
  var lang = doc.lang || "de";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: transparent -> solid ---------- */
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  var stickyCta = document.querySelector(".sticky-cta");
  function onScroll() {
    var y = window.scrollY;
    var threshold = hero ? Math.max(80, hero.offsetHeight - 120) : 0;
    if (header && !body.classList.contains("page-legal")) {
      if (header.getAttribute("data-solid") === "always") {
        header.classList.add("is-solid");
      } else {
        header.classList.toggle("is-solid", y > 40 && (!hero || y > threshold * 0.12));
      }
    }
    if (stickyCta) {
      var contact = document.getElementById("kontakt") || document.getElementById("contact");
      var nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      stickyCta.classList.toggle("is-visible", y > window.innerHeight * 0.6 && !nearContact);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile-Menü ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Aktiver Navigationspunkt ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          map[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObs.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, .stat");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Zähler ---------- */
  var nf = new Intl.NumberFormat(lang === "en" ? "en-GB" : "de-DE");
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + nf.format(target) + suffix; return; }
    var dur = 1600, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + nf.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Produkt-Akkordeon + Bühne ---------- */
  var products = document.querySelectorAll(".product");
  var stageImgs = document.querySelectorAll(".product-stage img");
  var stageLabel = document.querySelector(".product-stage__label");
  function setStage(idx) {
    stageImgs.forEach(function (img, i) { img.classList.toggle("is-active", i === idx); });
    if (stageLabel && products[idx]) {
      stageLabel.textContent = products[idx].getAttribute("data-label") || "";
    }
  }
  products.forEach(function (p, idx) {
    var btn = p.querySelector(".product__trigger");
    btn.addEventListener("click", function () {
      var isOpen = p.classList.contains("is-open");
      products.forEach(function (o) {
        o.classList.remove("is-open");
        o.querySelector(".product__trigger").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        p.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        setStage(idx);
      }
    });
    btn.addEventListener("mouseenter", function () { if (window.innerWidth >= 1000) setStage(idx); });
  });

  /* ---------- Timeline-Fortschritt ---------- */
  var timeline = document.querySelector(".timeline");
  if (timeline) {
    var prog = timeline.querySelector(".timeline__progress");
    var steps = timeline.querySelectorAll(".step");
    var tlTick = function () {
      var r = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.75 - r.top) / (r.height + vh * 0.25);
      if (window.innerWidth >= 1000) p = (vh * 0.85 - r.top) / (vh * 0.5);
      p = Math.max(0, Math.min(1, p));
      if (window.innerWidth >= 1000) {
        prog.style.setProperty("--p", (p * 100).toFixed(1) + "%");
        prog.style.height = "";
      } else {
        prog.style.height = (p * 100).toFixed(1) + "%";
      }
      var active = Math.ceil(p * steps.length - 0.15);
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i < active); });
    };
    window.addEventListener("scroll", tlTick, { passive: true });
    window.addEventListener("resize", tlTick);
    tlTick();
  }

  /* ---------- Anliegen per Link vorauswählen ---------- */
  document.querySelectorAll("[data-topic]").forEach(function (a) {
    a.addEventListener("click", function () {
      var t = a.getAttribute("data-topic");
      var radio = document.querySelector('.topic-chips input[value="' + t + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    });
  });

  /* ---------- Formular (Entwurf: nur Validierung, kein Versand) ---------- */
  var form = document.querySelector(".form");
  if (form) {
    var phone = form.querySelector("#f-phone");
    var phoneReq = form.querySelector(".phone-req");
    form.addEventListener("change", function (e) {
      if (e.target.name === "anliegen") {
        var cb = e.target.value === "rueckruf" && e.target.checked;
        phone.required = cb;
        if (phoneReq) phoneReq.hidden = !cb;
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("has-error"); });
      form.querySelectorAll("input[required], textarea[required]").forEach(function (inp) {
        var valid = inp.type === "checkbox" ? inp.checked : inp.value.trim() !== "" && inp.checkValidity();
        if (!valid) {
          ok = false;
          var wrap = inp.closest(".field") || inp.closest(".consent");
          if (wrap) wrap.classList.add("has-error");
        }
      });
      if (form.querySelector(".hp input") && form.querySelector(".hp input").value) return; // Honeypot
      if (!ok) {
        var first = form.querySelector(".has-error input, .has-error textarea");
        if (first) first.focus();
        return;
      }
      /* TODO Formspree: action-URL im <form> setzen und hier per fetch() senden.
         Siehe CURSOR.md -> Abschnitt "Formular anbinden". */
      form.classList.add("is-sent");
      form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
