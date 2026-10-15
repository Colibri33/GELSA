// Persistencia local en el navegador. Si el almacenamiento falla, la app sigue funcionando en memoria.
const PREFIJO = 'mpti:';

export function leer(clave, porDefecto) {
  try {
    const v = window.localStorage.getItem(PREFIJO + clave);
    return v ? JSON.parse(v) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function borrarTodo() {
  try {
    Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIJO)).forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* sin almacenamiento disponible */
  }
}
