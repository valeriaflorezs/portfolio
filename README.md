# Portafolio · Valeria Sarmiento

Sitio estático (HTML + CSS + JS, sin build) que combina portafolio y "Linktree". Paleta de marca morada (`#2D235B`, `#3C2E7A`, `#8073C3`, `#A594F1`, `#F4E8C1`) definida como variables al inicio de `styles.css`.

- `index.html`: portafolio completo; los enlaces están en el banner (**Todos mis enlaces**).
- `links.html`: página mínima tipo Linktree para poner en la bio de redes.
- Para agregar un enlace, duplica un bloque `<a class="hub-link">` en ambos archivos.
- Imágenes en `assets/`: `avatar.webp` (tarjeta colgante y `links.html`), `valeria.webp` (Sobre mí), `singularity.webp` (ventana de Singularity), `favicon.png` e `icons/` (carpetas). Si falta el avatar, se muestra el monograma "VS".
- Escritorio: cada carpeta (`data-open="win-…"`) abre un `<dialog id="win-…">` al final de `index.html`; también se abren con `#biosteel`, `#singularity`, `#uninorte`, `#proyectos` y `#datavisuallab`.
- Proyectos: las tarjetas están dentro de la ventana *Proyectos* de `index.html`; cada una tiene su ilustración animada en SVG, que puedes reemplazar por una captura propia.
- Las animaciones respetan `prefers-reduced-motion`.

## Publicar en GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. El sitio queda en `https://valeriaflorezs.github.io/portfolio/`.

## Local
`python3 -m http.server 8000` y abre http://localhost:8000

## Caché
Los enlaces a `styles.css` y `script.js` llevan `?v=N`. Al cambiar esos archivos, sube el número en `index.html` y `links.html` para que los navegadores descarguen la versión nueva.

## Íconos
Los logos de herramientas vienen de [Simple Icons](https://simpleicons.org) (CC0) y los íconos de línea (SQL, DAX, Power Query y hobbies) de [Lucide](https://lucide.dev) (ISC); el de Java, de [Devicon](https://devicon.dev) (MIT). Están incrustados como SVG en `index.html` y toman su color de la paleta (`.tile svg`, `.hobby .ico`). Las marcas pertenecen a sus dueños.
