# Portafolio · Valeria F. Sarmiento

Sitio estático (HTML + CSS + JS, sin build) que combina portafolio y "Linktree". Paleta de marca morada (`#2D235B`, `#3C2E7A`, `#8073C3`, `#A594F1`, `#F4E8C1`) definida como variables al inicio de `styles.css`.

- `index.html`: portafolio completo; los enlaces están en el banner (**Todos mis enlaces**).
- `links.html`: página mínima tipo Linktree para poner en la bio de redes.
- Para agregar un enlace, duplica un bloque `<a class="hub-link">` en ambos archivos.
- Imágenes en `assets/`: `avatar.webp` (tarjeta colgante y `links.html`), `valeria.webp` (Sobre mí), `singularity.webp` (ventana de Singularity), `favicon.png` e `icons/` (carpetas). Si falta el avatar, se muestra el monograma "VS".
- Escritorio: cada carpeta (`data-open="win-…"`) abre un `<dialog id="win-…">` al final de `index.html`; también se abren con `#biosteel`, `#singularity`, `#uninorte` y `#proyectos`.
- Proyectos: las tarjetas están dentro de la ventana *Proyectos* de `index.html`; cada una tiene su ilustración animada en SVG, que puedes reemplazar por una captura propia.
- Idioma: el botón ES/EN del menú traduce todo el sitio. El HTML está en español y `i18n.js` guarda el diccionario al inglés; si agregas texto nuevo, añade su traducción ahí (lo que no aparece se queda igual). La elección se recuerda en el navegador.
- Skills técnicas: tarjetas "raspa y gana" (canvas en `script.js`); habilidades blandas: cintas que se deslizan.
- Hobbies con video o foto: en `assets/hobbies/` van `natacion.webm`/`.mp4` (28 s, sin audio) y `natacion.jpg` (póster). Para otro hobby, agrégale la clase `has-media` y un `<video class="hobby-media" muted loop playsinline preload="none" poster="…">` (o un `<img class="hobby-media">`) como primer hijo de su `<div class="hobby">`. El video solo se reproduce cuando está en pantalla.
- Las animaciones respetan `prefers-reduced-motion`.

## Publicar en GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. El sitio queda en `https://valeriaflorezs.github.io/portfolio/`.

## Local
`python3 -m http.server 8000` y abre http://localhost:8000

## Caché
Los enlaces a `styles.css`, `i18n.js` y `script.js` llevan `?v=N`. Al cambiar esos archivos, sube el número en `index.html` y `links.html` para que los navegadores descarguen la versión nueva.

## Íconos
Los logos de herramientas vienen de [Simple Icons](https://simpleicons.org) (CC0) y los íconos de línea (SQL, DAX, Power Query y hobbies) de [Lucide](https://lucide.dev) (ISC); el de Java, de [Devicon](https://devicon.dev) (MIT). Están incrustados como SVG en `index.html` y toman su color de la paleta (`.tile svg`, `.hobby .ico`). Las marcas pertenecen a sus dueños.
