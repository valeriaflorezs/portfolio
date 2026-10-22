(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  if (window.i18n) i18n.init();

  // Tema claro/oscuro: respeta la preferencia del sistema y recuerda la elección.
  var btn = document.getElementById("theme");
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}
  if (btn) btn.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });


  // Carpetas del escritorio: cada una abre una ventana (<dialog>).
  function openWin(id) {
    var d = document.getElementById(id);
    if (!d || d.open) return;
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    root.classList.add("modal-open");
    var body = d.querySelector(".win-body"); if (body) body.scrollTop = 0;
    setTimeout(function () { $(".proj", d).forEach(function (p) { p.classList.add("in"); }); }, 120);
    try { history.replaceState(null, "", "#" + id.replace("win-", "")); } catch (e) {}
  }
  $("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openWin(b.getAttribute("data-open")); }); });
  $("dialog.win").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    var x = d.querySelector(".win-close"); if (x) x.addEventListener("click", function () { d.close(); });
    d.addEventListener("close", function () {
      root.classList.remove("modal-open");
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    });
  });
  function fromHash() {
    var h = location.hash.slice(1);
    if (h && document.getElementById("win-" + h)) openWin("win-" + h);
  }
  addEventListener("hashchange", fromHash);
  setTimeout(fromHash, 300);

  // Texto que se escribe solo (con reduced-motion muestra la primera frase sin animar).
  var typer = document.getElementById("typer");
  if (typer) {
    var words = window.i18n ? i18n.typer() : ["dashboards en Power BI"];
    document.addEventListener("langchange", function () { words = i18n.typer(); if (reduce) typer.textContent = words[0]; });
    if (reduce) { typer.textContent = words[0]; }
    else {
      var w = 0, c = 0, del = false;
      (function tick() {
        var word = words[w % words.length];
        c += del ? -1 : 1;
        typer.textContent = word.slice(0, c);
        var wait = del ? 28 : 65;
        if (!del && c === word.length) { del = true; wait = 1600; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
        setTimeout(tick, wait);
      })();
    }
  }

  // Skills técnicas: tarjetas para raspar (el texto ya está en el HTML; el lienzo lo cubre).
  var scratchAll = document.querySelector(".scratch-all");
  var scratches = $(".scratch").map(function (el) {
    var cv = document.createElement("canvas"), ctx = cv.getContext("2d");
    if (!ctx) return null;
    cv.setAttribute("aria-hidden", "true");
    el.appendChild(cv);
    var w = 0, h = 0, down = false, lx = 0, ly = 0, n = 0;
    function paint() {
      var r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      if (!r.width) return;
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#3C2E7A"); g.addColorStop(.5, "#8073C3"); g.addColorStop(1, "#2D235B");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(244,232,193,.8)"; ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(window.i18n && i18n.lang === "en" ? "✦ scratch here ✦" : "✦ raspa aquí ✦", w / 2, h / 2);
    }
    function done() { el.classList.add("done"); }
    function cleared() {
      var d = ctx.getImageData(0, 0, cv.width, cv.height).data, t = 0, c = 0;
      for (var i = 3; i < d.length; i += 64) { t++; if (d[i] < 128) c++; }
      return c / t;
    }
    function scratch(e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 26; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
      lx = x; ly = y;
      if (++n % 4 === 0 && cleared() > .5) done();
    }
    cv.addEventListener("pointerdown", function (e) {
      down = true; var r = el.getBoundingClientRect(); lx = e.clientX - r.left; ly = e.clientY - r.top;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      scratch(e);
    });
    cv.addEventListener("pointermove", function (e) { if (down) scratch(e); });
    ["pointerup", "pointercancel"].forEach(function (t) { cv.addEventListener(t, function () { down = false; }); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); done(); } });
    el.addEventListener("click", function (e) { if (e.detail === 0) done(); });
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!el.classList.contains("done") && !n) paint(); });
    document.addEventListener("langchange", function () { if (!el.classList.contains("done") && !n) paint(); });
    return { el: el, done: done };
  }).filter(Boolean);
  if (scratchAll) scratchAll.addEventListener("click", function () { scratches.forEach(function (s, i) { setTimeout(s.done, i * 90); }); });


  // Tarjeta colgante: en pantallas táctiles se voltea al tocarla; con teclado, Enter o espacio.
  var idcard = document.querySelector(".idcard");
  if (idcard) {
    idcard.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); idcard.classList.toggle("flipped"); } });
    if (matchMedia("(hover: none)").matches) idcard.addEventListener("click", function () { idcard.classList.toggle("flipped"); });
  }

  // Acordeones de paneles: uno abierto a la vez.
  $(".acc").forEach(function (acc) {
    var items = $(".acc-item", acc);
    function open(it) {
      items.forEach(function (o) {
        var on = o === it, h = o.querySelector(".acc-head");
        o.classList.toggle("open", on);
        if (h) h.setAttribute("aria-expanded", on ? "true" : "false");
      });
    }
    acc.style.setProperty("--n", items.length);
    acc.classList.add("acc-on");
    items.forEach(function (it) {
      var h = it.querySelector(".acc-head");
      if (h) h.addEventListener("click", function () { if (!it.classList.contains("open")) open(it); });
      // Con mouse basta pasar por encima (sin hacer clic); un pequeño retardo evita parpadeos al cruzar paneles.
      var t = 0;
      it.addEventListener("mouseenter", function () {
        if (!matchMedia("(hover: hover) and (min-width: 900px)").matches || it.classList.contains("open")) return;
        clearTimeout(t); t = setTimeout(function () { open(it); }, 90);
      });
      it.addEventListener("mouseleave", function () { clearTimeout(t); });
      it.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(":focus-visible") && !it.classList.contains("open")) open(it); });
    });
    open(items[0]);
  });

  // Logros en números: tarjeta central grande, contador y arrastre con el mouse.
  var nums = document.querySelector(".nums");
  if (nums) {
    // Tiempo en Singularity (desde julio de 2024): se actualiza solo con la fecha.
    $("[data-since]", nums).forEach(function (el) {
      var p = el.getAttribute("data-since").split("-"), n = new Date();
      var m = (n.getFullYear() - +p[0]) * 12 + (n.getMonth() + 1 - +p[1]);
      el.setAttribute("data-count", m); el.textContent = m;
    });
    var cards = $(".num-card", nums), fill = document.querySelector(".nums-fill");
    var visible = false, counted = {}, current = -1;
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); };
    function count(card, i) {
      var el = card.querySelector("[data-count]");
      if (!el || counted[i]) return;
      counted[i] = true;
      var to = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
      if (reduce) return;
      var t0 = performance.now();
      (function step(t) {
        var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(Math.round(to * e)) + (k === 1 ? suf : "");
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    function upd() {
      var r = nums.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) {
        var cr = c.getBoundingClientRect(), d = Math.abs(cr.left + cr.width / 2 - mid);
        var t = Math.min(1, d / (cr.width * 1.1));
        c.style.setProperty("--s", (1 - .1 * t).toFixed(3));
        c.style.setProperty("--o", (1 - .45 * t).toFixed(3));
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== current) { current = best; cards.forEach(function (c, i) { c.classList.toggle("on", i === best); }); }
      if (visible) count(cards[best], best);
      var max = nums.scrollWidth - nums.clientWidth;
      if (fill) fill.style.transform = "scaleX(" + (max > 0 ? nums.scrollLeft / max : 0) + ")";
    }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) upd(); }, { threshold: .35 }).observe(nums);
    nums.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    function go(dir) { nums.scrollBy({ left: dir * (cards[0].offsetWidth + 16), behavior: reduce ? "auto" : "smooth" }); }
    var pv = document.querySelector(".nums-btn.prev"), nx = document.querySelector(".nums-btn.next");
    if (pv) pv.addEventListener("click", function () { go(-1); });
    if (nx) nx.addEventListener("click", function () { go(1); });
    nums.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } });
    var dragging = false, sx = 0, sl = 0;
    nums.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; dragging = true; sx = e.clientX; sl = nums.scrollLeft; nums.classList.add("drag"); });
    addEventListener("pointermove", function (e) { if (dragging) nums.scrollLeft = sl - (e.clientX - sx); });
    addEventListener("pointerup", function () { if (!dragging) return; dragging = false; nums.classList.remove("drag"); });
    upd();
  }

  // Menú: resalta la sección en pantalla.
  var navLinks = $(".nav ul a"), navSecs = navLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }), navCur = -1;
  function spy() {
    var y = innerHeight * .35, cur = 0;
    navSecs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) cur = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = navSecs.length - 1;
    if (cur === navCur) return;
    navCur = cur;
    navLinks.forEach(function (a, i) { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    var ul = navLinks[cur] && navLinks[cur].closest("ul");
    if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: navLinks[cur].offsetLeft - ul.clientWidth / 2 + navLinks[cur].offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }
  addEventListener("scroll", spy, { passive: true });
  addEventListener("resize", spy);
  spy();

  // Videos de hobbies y de la carpeta Uninorte: se reproducen solo cuando están en pantalla.
  // Con data-clips="a,b" rotan en secuencia; con movimiento reducido solo se ve el póster.
  var hv = $(".hobby-media, .reel video, .head-clip");
  if (hv.length && !reduce) {
    var webm = !!document.createElement("video").canPlayType("video/webm");
    hv.forEach(function (v) {
      var clips = (v.getAttribute("data-clips") || "").split(",").filter(Boolean), k = 0;
      if (clips.length > 1) {
        v.addEventListener("ended", function () {
          k = (k + 1) % clips.length;
          v.src = "assets/hobbies/" + clips[k] + (webm ? ".webm" : ".mp4");
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        });
      }
    });
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: .25 });
    hv.forEach(function (v) { vio.observe(v); });
  }

  // Certificados en pila: se abre en abanico y cada hoja se ve completa en un visor.
  var pile = document.querySelector(".pile"), lb = document.getElementById("cert-view");
  if (pile && lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lb-cap"), touch = matchMedia("(hover: none)").matches;
    $(".sheet", pile).forEach(function (sh) {
      sh.addEventListener("click", function () {
        if (touch && !pile.classList.contains("fan")) { pile.classList.add("fan"); return; }
        var img = sh.querySelector("img");
        lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
        lbCap.textContent = sh.querySelector(".sheet-cap").textContent + " · " + sh.querySelector(".sheet-meta").textContent;
        if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
  }

  if (reduce) return;
  root.classList.add("js");

  // Nombre letra por letra (la palabra con color entra completa).
  $(".hero h1").forEach(function (h) {
    var i = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split("").forEach(function (ch) {
            var s = document.createElement("span");
            s.className = "ch"; s.style.setProperty("--i", i++); s.textContent = ch === " " ? "\u00a0" : ch;
            f.appendChild(s);
          });
          node.replaceChild(f, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          if (n.classList.contains("ghost")) { n.classList.add("ch"); n.style.setProperty("--i", i); i += 9; }
          else split(n);
        }
      });
    })(h);
  });

  // Aparición al hacer scroll, escalonada dentro de cada grupo.
  var groups = [".hub-list > *", ".chips > *", ".tl > li", ".plain > li", ".about > *", ".sec-head",
                ".skills-board > *", ".tiles > *", ".hobbies > *", ".proj-grid > *", ".orbit-wrap > *", ".pillars > *", ".folders > *", ".about-wrap > *"];
  var targets = [];
  groups.forEach(function (sel) {
    var seen = new Map();
    $(sel).forEach(function (el) {
      if (el.closest("dialog")) return;
      var p = el.parentNode, k = seen.get(p) || 0;
      seen.set(p, k + 1);
      el.classList.add("reveal"); el.style.setProperty("--d", Math.min(k, 8));
      targets.push(el);
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  targets.forEach(function (el) { io.observe(el); });

  // Barra de progreso de lectura.
  var bar = document.createElement("div"); bar.className = "progress";
  var nav = document.querySelector(".nav"); if (nav) nav.appendChild(bar);
  var raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var max = root.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // Inclinación 3D y brillo que sigue al cursor (solo con puntero fino).
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $(".hub-link, .tilt").forEach(function (el) {
      var amp = el.classList.contains("hub-link") ? 6 : 4;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = "transform .12s ease-out";
        el.style.transform = "perspective(800px) rotateX(" + (-y * amp) + "deg) rotateY(" + (x * amp) + "deg) translateY(-2px)";
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "";
      });
    });
  }
})();
