// Movimiento al estilo de dataconale.com: scroll suave (Lenis), títulos con máscara,
// indicador deslizante en el menú, tarjeta colgante con péndulo y Logros con scroll fijado.
(function () {
  var root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var wide = matchMedia("(min-width: 1000px)");
  var NAV_H = 58;

  // Scroll suave con inercia; los diálogos y el carrusel conservan su scroll propio.
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, smoothWheel: true, syncTouch: false });
    requestAnimationFrame(function loop(t) { lenis.raf(t); requestAnimationFrame(loop); });
    $("dialog").forEach(function (d) { d.setAttribute("data-lenis-prevent", ""); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var h = a.getAttribute("href"), el = h.length > 1 && document.getElementById(h.slice(1));
      if (!el || el.tagName === "DIALOG") return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.4 }); // Lenis ya respeta scroll-margin-top
      try { history.replaceState(null, "", h === "#top" ? location.pathname + location.search : h); } catch (x) {}
    });
  }

  // Títulos de sección: la línea sube desde detrás de una máscara.
  $(".sec-head h2").forEach(function (h) {
    var m = document.createElement("span"), i = document.createElement("span");
    m.className = "rv-mask";
    while (h.firstChild) i.appendChild(h.firstChild);
    m.appendChild(i); h.appendChild(m);
  });

  // Teselas de plataformas: entrada en diagonal.
  $(".tiles").forEach(function (g) {
    var t = $(".tile", g); if (!t.length) return;
    var w = t[0].offsetWidth || 1, cols = Math.max(1, Math.round(g.clientWidth / w));
    t.forEach(function (el, i) { el.style.setProperty("--d", ((i % cols) + Math.floor(i / cols)) * .57); });
  });

  // Menú: píldora que se desliza hasta la sección activa.
  var ul = document.querySelector(".nav ul");
  if (ul) {
    var ind = document.createElement("span"); ind.className = "nav-ind"; ind.setAttribute("aria-hidden", "true");
    ul.insertBefore(ind, ul.firstChild); ul.classList.add("has-ind");
    var place = function () {
      var a = ul.querySelector("a[aria-current]");
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1;
      ind.style.width = a.offsetWidth + "px"; ind.style.height = a.offsetHeight + "px";
      ind.style.transform = "translate(" + a.offsetLeft + "px," + a.offsetTop + "px)";
    };
    new MutationObserver(place).observe(ul, { subtree: true, attributes: true, attributeFilter: ["aria-current"] });
    if (window.ResizeObserver) { var ro = new ResizeObserver(place); $("a", ul).forEach(function (a) { ro.observe(a); }); }
    addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
  }

  // Tarjeta colgante: péndulo amortiguado. La velocidad del puntero la empuja y en reposo se mece.
  var lan = document.querySelector(".lanyard");
  if (lan) {
    lan.classList.add("phys");
    var theta = 0, omega = -6, idle = 1, last = performance.now(), lastX = null, lastT = 0, kick = 0, vis = true, raf = 0;
    var K = 34, C = 2.6;
    new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }, { rootMargin: "100px" }).observe(lan);
    addEventListener("pointermove", function (e) {
      var t = performance.now();
      if (lastX !== null && t - lastT < 80) omega += clamp((e.clientX - lastX) / Math.max(8, t - lastT) * .9, -2.5, 2.5) * 3.2;
      lastX = e.clientX; lastT = t;
    }, { passive: true });
    var card = lan.querySelector(".idcard");
    if (card) {
      card.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") kick += 22; });
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") kick += 16; });
    }
    var loop = function (t) {
      if (!vis) { raf = 0; return; }
      var dt = Math.min(.033, (t - last) / 1000); last = t;
      if (kick) { omega += kick; kick = 0; }
      omega += (-K * theta - C * omega) * dt;
      theta = clamp(theta + omega * dt, -14, 14);
      var calm = Math.abs(omega) < 4 && Math.abs(theta) < 2;
      idle += ((calm ? 1 : 0) - idle) * Math.min(1, dt * 1.5);
      lan.style.transform = "rotate(" + (theta + Math.sin(t / 1300) * 1.6 * idle).toFixed(3) + "deg)";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  // Logros: en pantallas anchas la sección se queda fija y el scroll vertical recorre las tarjetas.
  var sec = document.getElementById("logros"), nums = sec && sec.querySelector(".nums");
  if (sec && nums) {
    var pin = document.createElement("div"); pin.className = "pin";
    while (sec.firstChild) pin.appendChild(sec.firstChild);
    sec.appendChild(pin);
    var sync = function () {
      var on = wide.matches;
      sec.classList.toggle("pinned", on);
      sec.style.height = on ? "calc(100svh - " + NAV_H + "px + " + Math.max(0, nums.scrollWidth - nums.clientWidth) + "px)" : "";
      if (on) drive();
    };
    var drive = function () {
      if (!sec.classList.contains("pinned")) return;
      var r = sec.getBoundingClientRect(), p = clamp((NAV_H - r.top) / Math.max(1, r.height - pin.offsetHeight), 0, 1);
      nums.scrollLeft = p * (nums.scrollWidth - nums.clientWidth);
    };
    addEventListener("scroll", drive, { passive: true });
    addEventListener("resize", sync);
    if (window.ResizeObserver) new ResizeObserver(sync).observe(nums);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    sync();
  }

  // Línea de tiempo vertical (Biosteel): la línea se dibuja con el scroll y cada hito se enciende al alcanzarlo.
  $(".vtl").forEach(function (list) {
    var body = list.closest(".win-body"), dlg = list.closest("dialog");
    if (!body) return;
    var fill = document.createElement("span"); fill.className = "vtl-fill"; fill.setAttribute("aria-hidden", "true");
    list.insertBefore(fill, list.firstChild); list.classList.add("vtl-js");
    var items = $(":scope > li", list);
    var upd = function () {
      var b = body.getBoundingClientRect(), r = list.getBoundingClientRect();
      var reach = clamp(b.top + b.height * .62 - r.top, 0, r.height);
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) reach = r.height; // al final del scroll, todo encendido
      fill.style.transform = "scaleY(" + (reach / Math.max(1, r.height)).toFixed(4) + ")";
      items.forEach(function (li) { li.classList.toggle("lit", li.offsetTop + 10 <= reach + 1); });
    };
    body.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    if (dlg) new MutationObserver(function () { setTimeout(upd, 60); }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
    upd();
  });

  // Singularity: la línea de tiempo avanza rol por rol cada vez que se abre la carpeta.
  $(".tline").forEach(function (tl) {
    var dlg = tl.closest("dialog"), body = tl.closest(".win-body");
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && dlg && dlg.open) tl.classList.add("go"); }, { root: body, threshold: .35 });
    io.observe(tl);
    if (dlg) {
      dlg.addEventListener("close", function () { tl.classList.remove("go"); });
      new MutationObserver(function () { if (dlg.open) { io.unobserve(tl); io.observe(tl); } }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
    }
  });
})();
