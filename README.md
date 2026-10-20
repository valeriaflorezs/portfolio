# Portafolio · Valeria Sarmiento

Sitio estático (HTML + CSS + JS, sin build) que combina portafolio y "Linktree". Paleta de marca morada (`#2D235B`, `#3C2E7A`, `#8073C3`, `#A594F1`, `#F4E8C1`) definida como variables al inicio de `styles.css`.

- `index.html`: portafolio completo; los enlaces están en el banner (**Todos mis enlaces**).
- `links.html`: página mínima tipo Linktree para poner en la bio de redes.
- Para agregar un enlace, duplica un bloque `<a class="hub-link">` en ambos archivos.
- Foto: guarda una imagen cuadrada como `assets/valeria.jpg`. Si no existe, se muestra el monograma "VS".
- Proyectos: las tarjetas de la sección *Proyectos destacados* están en `index.html`; cada una tiene su ilustración animada en SVG, que puedes reemplazar por una captura propia.
- Las animaciones respetan `prefers-reduced-motion`.

## Publicar en GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. El sitio queda en `https://valeriaflorezs.github.io/portfolio/`.

## Local
`python3 -m http.server 8000` y abre http://localhost:8000
