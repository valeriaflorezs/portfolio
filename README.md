# Portafolio · Valeria Sarmiento

Sitio estático (HTML + CSS + JS, sin build) que combina portafolio y "Linktree".

- `index.html`: portafolio completo; los enlaces están en la sección **Todos mis enlaces**.
- `links.html`: página mínima tipo Linktree para poner en la bio de redes (`/links.html`).
- Para agregar un enlace (p. ej. Instagram), duplica un bloque `<a class="hub-link">` en ambos archivos.
- Opcional: guarda tu foto como `avatar.png` para que aparezca en `links.html`.

## Publicar en GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. El sitio queda en `https://valeriaflorezs.github.io/portfolio/`.

## Local
`python3 -m http.server 8000` y abre http://localhost:8000
