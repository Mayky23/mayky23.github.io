# Portfolio · Miguel Ángel Roldán de Haro

Portfolio personal de ciberseguridad: SOC, DFIR, Wazuh SIEM, hardening y automatización.

🌐 **https://mayky23.github.io**

## Contenido

- **Sobre mí**, **Trayectoria** (experiencia, formación y competencias), **Portfolio** (16 proyectos filtrables por categoría) y **Contacto** (formulario con EmailJS).
- Responsive, con enlaces directos a cada sección (`/#resume`, `/#portfolio`, `/#contact`).
- SEO: Open Graph/Twitter Card, JSON-LD, `sitemap.xml` y `robots.txt`.
- Accesibilidad: skip link, navegación por teclado y `prefers-reduced-motion`.

## Stack

HTML, CSS y JavaScript sin frameworks · [EmailJS](https://www.emailjs.com/) · [Ionicons](https://ionic.io/ionicons) · Google Fonts (Poppins).

## Estructura

```
index.html             página única
assets/css, assets/js  estilos y lógica
assets/images/         avatar, iconos, portadas (optimized/) y cover social
tools/                 scripts para generar imágenes
```

## Desarrollo

Es un sitio estático: sirve la carpeta en local.

```bash
python -m http.server 8000
```

Para regenerar las imágenes (requiere Pillow):

```bash
python tools/optimize_images.py
```

Genera las portadas en WebP (640 y 1200 px para `srcset`), el avatar, el favicon y `og-cover.jpg`.

## Añadir un proyecto

1. Copia una `<li class="project-item">` en `index.html` y usa una categoría existente en `data-category`.
2. Guarda la portada en `assets/images/optimized/<nombre>.jpg` (1200×675) y ejecuta el script de imágenes.
3. Apunta `src` y `srcset` a `<nombre>-640.webp` y `<nombre>-1200.webp`.
