# UGC Creator con Paula — funnel de captación

Sitio estático: HTML, CSS y JavaScript sin dependencias ni build.
Se despliega en Vercel tal cual está.

## Estructura

```
index.html            Landing
aplicar/index.html    Formulario de solicitud
gracias/index.html    Confirmación (único sitio donde se dispara el evento Lead)
privacidad/index.html Política de privacidad
styles.css            Todos los estilos. No hay ni un estilo en línea.
main.js               Formulario, consentimiento de cookies, Pixel, FAQ
assets/               Fotos en WebP, tipografías y favicon
vercel.json           Cabeceras de caché y seguridad
apps-script.gs        Código para pegar en Google Apps Script (no se despliega)
```

## Puesta en marcha

1. **Apps Script.** Abre el Sheet de leads → Extensiones → Apps Script, pega
   `apps-script.gs` y despliega como aplicación web (ejecutar como tú, acceso
   para cualquier usuario). Copia la URL que acaba en `/exec`.
2. **Conecta el formulario.** Pega esa URL en `APPS_SCRIPT_URL`, al principio
   de `main.js`. Hasta que no se haga, el formulario valida pero no envía y
   avisa en pantalla en lugar de fingir que ha funcionado.
3. **Meta Pixel.** Sustituye `META_PIXEL_ID` por el ID real en el `<head>` de
   las cuatro páginas.
4. **Privacidad.** Rellena `[RESPONSABLE]`, `[NIF]`, `[DIRECCIÓN]`, `[EMAIL]`
   y `[FECHA]` en `privacidad/index.html`.

Lo que queda pendiente está en [PENDIENTES.md](PENDIENTES.md).

## Cómo funcionan las piezas

**Formulario.** Envía por `fetch` un `POST` en modo `no-cors` con el cuerpo en
`URLSearchParams`. Los nombres de campo son `nombre`, `email`, `whatsapp`,
`instagram`, `punto_partida`, `objetivo`, `freno`, `dispuesta` y
`consentimiento`, y coinciden uno a uno con las columnas A–I del Sheet.
**No se pueden renombrar sin tocar también `apps-script.gs`.**

**Cookies y Pixel.** El `<head>` sólo declara el stub de `fbq`; el script de
Meta no se descarga hasta que la visitante pulsa «Aceptar». La decisión se
guarda en `localStorage` con la clave `ugc_paula_consent`. Si rechaza, no se
hace ninguna petición a Meta.

**Sistema de diseño.** Todo vive en `:root`, al principio de `styles.css`:
colores, degradados, tipografías, escalas de tamaño, espaciados, radios y
sombras. Fuera de ahí no hay ningún color ni tamaño fijo.

**Tipografías.** Outfit y Playfair Display en cursiva, ambas variables y
alojadas en `assets/fonts/`. Están servidas desde el propio dominio a
propósito: cargarlas desde Google bloqueaba el render y hacía saltar la
maquetación (CLS 0,157 y rendimiento 84). Sirviéndolas desde aquí, el
rendimiento sube a 99–100.

**Rutas.** Todas las rutas del navegador son relativas a propósito, no
absolutas. Así el sitio funciona igual servido en la raíz de un dominio que
dentro de una subcarpeta, que es lo que pasa con Live Server cuando el
workspace abierto en VS Code es la carpeta padre.

## Desarrollo en local

Con Live Server basta con darle a «Go Live» sobre `index.html`. O sin
extensiones:

```bash
python3 -m http.server 8788
```

Y abre <http://127.0.0.1:8788>. No hace falta nada más.
