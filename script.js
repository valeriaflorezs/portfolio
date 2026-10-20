(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

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
    var words = ["dashboards en Power BI", "modelos en DAX", "análisis en Python y R", "contenido que explica datos"];
    if (reduce) { typer.textContent = words[0]; }
    else {
      var w = 0, c = 0, del = false;
      (function tick() {
        var word = words[w];
        c += del ? -1 : 1;
        typer.textContent = word.slice(0, c);
        var wait = del ? 28 : 65;
        if (!del && c === word.length) { del = true; wait = 1600; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
        setTimeout(tick, wait);
      })();
    }
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
            s.className = "ch"; s.style.setProperty("--i", i++); s.textContent = ch;
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
                ".skills-board > *", ".tiles > *", ".proj-grid > *", ".orbit-wrap > *", ".pillars > *", ".folders > *", ".about-wrap > *"];
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
