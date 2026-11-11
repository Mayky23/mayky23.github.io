# Portfolio · Miguel Ángel Roldán de Haro

Portfolio personal de ciberseguridad: SOC, DFIR, Wazuh SIEM, hardening y automatización.

🌐 **https://mayky23.github.io**

## Contenido

Una sola página con cuatro secciones: **Perfil** (`/#about`), **Proyectos** (`/#portfolio`, 3 destacados y 16 filtrables por área), **Trayectoria** (`/#resume`, línea de tiempo) y **Contacto** (`/#contact`, formulario con EmailJS).

La identidad visual toma el lenguaje de una investigación forense: la portada es una etiqueta de evidencia con precinto y la trayectoria es una línea de tiempo con fechas ISO.

- Modo claro y oscuro: sigue el sistema por defecto y el botón de la cabecera permite cambiarlo (se recuerda en `localStorage`). `assets/js/theme-init.js` aplica el tema antes de pintar para evitar parpadeos.
- Accesibilidad: skip link, foco visible, navegación por teclado, `prefers-reduced-motion`, mensajes de error asociados a cada campo.
- SEO: Open Graph/Twitter Card, JSON-LD, `sitemap.xml` y `robots.txt`.
- Sin recursos de terceros en la carga: fuentes, iconos y EmailJS se sirven desde el propio repo, con una Content-Security-Policy estricta.

## Stack

HTML, CSS y JavaScript sin frameworks · [EmailJS](https://www.emailjs.com/) 4.4.1 (en `assets/vendor/`) · Fuentes [Archivo](https://fonts.google.com/specimen/Archivo) y [Martian Mono](https://fonts.google.com/specimen/Martian+Mono) (licencia OFL, en `assets/fonts/`).

## Estructura

```
index.html                 página única
assets/css/style.css       estilos (tokens de color y tipografía al principio)
assets/js/script.js        filtros, menú activo y formulario
assets/fonts/              fuentes variables woff2
assets/vendor/             EmailJS
assets/images/             avatar, favicon, portadas (optimized/) y cover social
tools/                     scripts para generar imágenes
```

## Desarrollo

Es un sitio estático: sirve la carpeta en local.

```bash
python -m http.server 8000
```

Regenerar portadas, avatar y favicon (requiere Pillow):

```bash
python tools/optimize_images.py
```

Regenerar la imagen para redes sociales desde `tools/og-cover.html` (requiere Chrome y Pillow):

```bash
python tools/make_og_cover.py
```

## Añadir un proyecto

1. Guarda la portada en `assets/images/optimized/<nombre>.jpg` (1200×675) y ejecuta `python tools/optimize_images.py`.
2. Copia un `<li class="entry">` de la lista `archive` en `index.html` y usa una de estas categorías en `data-category`: `forense`, `blue`, `ofensiva`, `auto` o `web`.
3. Actualiza el número del botón de filtro correspondiente y el de **Todo**.

Para destacarlo, copia también un `<li class="feature">` en la lista `featured`.

## EmailJS

La clave pública, el Service ID y el Template ID están en `assets/js/script.js`. Son públicos por diseño; restringe los dominios permitidos a `mayky23.github.io` desde el panel de EmailJS. La plantilla usa las variables `from_name`, `reply_to`, `message` y `to_name`.
