/**
 * Recibe el formulario de /aplicar y añade una fila en la pestaña "Leads".
 *
 * Cómo instalarlo:
 *   1. Pega este código en Apps Script y GUARDA (⌘S). Si arriba pone
 *      "Cambios sin guardar", el despliegue no llevará este código.
 *   2. Ejecuta la función `probar` una vez: comprueba que llega a la hoja
 *      y te pedirá los permisos. Si falla, te dice exactamente por qué.
 *   3. Implementar → Nueva implementación → Aplicación web
 *      · Ejecutar como: Yo
 *      · Quién tiene acceso: Cualquier usuario
 *   4. Copia la URL que acaba en /exec y pégala en APPS_SCRIPT_URL, en main.js.
 */

/* ---------------------------------------------------------------------------
 * ID de la hoja de cálculo: el trozo de la URL entre /d/ y /edit.
 *
 * Déjalo vacío si este script está vinculado a la hoja (lo abriste desde
 * Extensiones → Apps Script). Si es un proyecto suelto, pégalo aquí: sin él,
 * getActiveSpreadsheet() devuelve null y las solicitudes se pierden.
 * Rellenarlo funciona en los dos casos, así que ante la duda, rellénalo.
 * ------------------------------------------------------------------------- */
const SHEET_ID = '';

const SHEET_NAME = 'Leads';
const ZONA_HORARIA = 'Europe/Madrid';

/** Devuelve la pestaña de leads o lanza un error que explica qué falta. */
function obtenerHoja_() {
  const libro = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!libro) {
    throw new Error(
      'No se encuentra la hoja de cálculo. Este script no está vinculado a ' +
      'ninguna, así que tienes que pegar el ID en la constante SHEET_ID.'
    );
  }

  const hoja = libro.getSheetByName(SHEET_NAME);

  if (!hoja) {
    throw new Error(
      'No existe la pestaña "' + SHEET_NAME + '" en "' + libro.getName() +
      '". Pestañas disponibles: ' +
      libro.getSheets().map(function (h) { return h.getName(); }).join(', ')
    );
  }

  return hoja;
}

/** Recibe el POST del formulario. */
function doPost(e) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(10000);

  try {
    // Ejecutar doPost a mano desde el editor no trae datos y antes escribía
    // una fila vacía. Si no llega formulario, no se toca la hoja.
    if (!e || !e.parameter || !e.parameter.nombre) {
      throw new Error(
        'Llamada sin datos de formulario. Si querías comprobar la conexión, ' +
        'ejecuta la función `probar` en vez de `doPost`.'
      );
    }

    const p = e.parameter;

    obtenerHoja_().appendRow([
      Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyy-MM-dd HH:mm'),
      p.nombre         || '',
      p.email          || '',
      p.whatsapp       || '',
      p.instagram      || '',
      p.punto_partida  || '',
      p.objetivo       || '',
      p.freno          || '',
      p.dispuesta      || '',
      'Nuevo',
      '',
      ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // La web envía en modo no-cors y no puede leer esta respuesta, así que
    // el error queda registrado aquí: Apps Script → Ejecuciones.
    console.error('Fallo al guardar la solicitud: ' + error.message);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    bloqueo.releaseLock();
  }
}

/** Abrir la URL /exec en el navegador sirve para ver si está desplegado. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, mensaje: 'Endpoint activo.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esta función desde el editor para comprobar la conexión. */
function probar() {
  const hoja = obtenerHoja_();
  Logger.log(
    'Conectado a "%s", pestaña "%s". Última fila con datos: %s. ' +
    'La próxima solicitud entrará en la fila %s.',
    hoja.getParent().getName(), hoja.getName(),
    hoja.getLastRow(), hoja.getLastRow() + 1
  );
}
