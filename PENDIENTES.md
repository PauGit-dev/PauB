# Pendientes — Funnel UGC Creator con Paula

Estado: primera versión completa y funcionando en local.
Todo lo que sigue está marcado en el código como `[PENDIENTE: …]` o con un
comentario `<!-- PENDIENTE: … -->`.

---

## 1. Bloqueantes para poder lanzar

| # | Qué falta | Dónde |
|---|---|---|
| ~~1~~ | ~~**URL del Apps Script.**~~ **HECHO.** Pegada y probada de punta a punta: el formulario real envía, el script responde `{"ok":true}` y la fila entra en la pestaña Leads con los acentos correctos. | `main.js:10` |
| 2 | **ID del Meta Pixel.** Sustituir el literal `META_PIXEL_ID` por el ID real en las cuatro páginas. | `<head>` de `index.html`, `aplicar/`, `gracias/`, `privacidad/` |
| 3 | **Datos del responsable RGPD:** `[RESPONSABLE]`, `[NIF]`, `[DIRECCIÓN]`, `[EMAIL]`, `[FECHA]`. | `privacidad/index.html` |
| 4 | **Dominio real.** Ahora hay un marcador (`ugccreatorconpaula.com`) en el `canonical` y en `robots.txt`. | `index.html`, `robots.txt` |

## 2. Contenido que falta

| # | Qué falta | Dónde |
|---|---|---|
| 5 | **[PENDIENTE: testimonios]** — no hay ninguno y no me los invento. El bloque está maquetado y **oculto** con el atributo `hidden`; para activarlo basta con quitarlo. | `index.html`, sección `#testimonios` |
| 6 | **[PENDIENTE: vídeo de bienvenida de Paula]** — hay un hueco con las proporciones de un vertical. | `gracias/index.html` |
| 7 | **Logos de marca.** Sin archivos de logo, las marcas aparecen sólo como texto: Garnier, Nivea, Shein, Sheglam, Nacomi, Platanomelón, Milano. **Hay que validar el listado con Paula** y conseguir los logos con permiso de uso. | `index.html`, sección de marcas |
| 8 | **Validar el temario** de los 11 bloques con Paula antes de publicar. Es un punto explícito del checklist del brief. | `index.html`, sección de módulos |
| 9 | **Confirmar cifras de seguidores** (24k Instagram / 59k TikTok). Vienen del brief y pueden estar desactualizadas. | `index.html`, bloque de autoridad |
| 10 | **Fotos en mejor resolución.** Las tres actuales están recortadas de las capturas de su portfolio, así que son pequeñas (486 px la mayor). Con originales quedarían más nítidas. | `assets/` |
| 11 | **Confirmar los enlaces de redes:** Instagram `@paulabugc`, TikTok `@paulabago`, correo `hellougcbypaula@gmail.com`. Sacados de su portfolio. En el portfolio también aparece YouTube `paulabugc`, que de momento no he enlazado. | pie de página y `gracias/` |
| 12 | **No hay logotipo.** El identificador es tipográfico («UGC CREATOR» + «con Paula» en cursiva). El favicon es una «P» sobre el degradado de marca. | `assets/favicon.svg`, clase `.wordmark` |

## 3. Decisiones que quiero confirmar contigo

| # | Decisión | Qué he hecho y por qué |
|---|---|---|
| 13 | **Campos obligatorios.** El brief sólo dejaba claro que Instagram es opcional. | He marcado como obligatorias las cuatro preguntas de cualificación: sin ellas el formulario deja de servir para filtrar. Si prefieres bajar la fricción, se relaja en `RULES`, en `main.js`. |
| 14 | **Consentimiento en el Sheet.** El formulario envía un campo `consentimiento` con valor `Sí`. | `apps-script.gs` no lo guarda, porque sus columnas son las A–I del Excel. Para RGPD conviene dejar constancia: haría falta una columna nueva y una línea en `appendRow`. **No he tocado el Apps Script.** |
| 15 | **Endpoint público.** La URL del Apps Script va escrita en `main.js`, así que es visible para cualquiera que mire el código de la página. | Es inevitable con un formulario estático: el navegador tiene que conocer el destino. El riesgo real es que alguien mande solicitudes falsas a mano. Si algún día molesta, lo barato es un campo trampa oculto que los bots rellenan y las personas no. De momento no lo he puesto para no complicar la v1. |
| 16 | **Plazo de la primera colaboración.** El brief daba una expectativa concreta (gifted en 1–2 semanas, pagada en el primer mes). | En la FAQ **no doy ninguna fecha**, porque chocaba con la regla de no prometer resultados rápidos. Digo que depende de su constancia y que primero llegan las gifted. Si Paula quiere ser más concreta, es su decisión. |

## 4. Comprobado antes de entregar

- Sin precios, cifras económicas ni «inversión» en ninguna página.
- Sin ninguna mención al equipo comercial interno ni a los acuerdos con la agencia, en todo el repo (verificado con búsqueda término a término).
- CTA único «Quiero aplicar» en todo el funnel; el botón del formulario es «Enviar mi solicitud». No aparece «comprar» ni «inscribirme».
- Las cuatro preguntas de cualificación están, con los `name` exactos.
- El `.gitignore` excluye el brief (`.md` y `.docx`) y el Excel de leads: no se sube nada confidencial.
- Lighthouse móvil: **99–100 en rendimiento, 100 en accesibilidad y 100 en buenas prácticas** en las cuatro páginas.
- El Pixel no hace ni una sola petición a Meta hasta que se acepta el banner. El evento `Lead` se dispara sólo en `/gracias/`.
