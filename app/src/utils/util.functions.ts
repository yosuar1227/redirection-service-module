/**
 * Retorna la fecha actual en formato DD-MM-YYYY.
 * Ejemplo: "28-11-2025".
 * Útil para guardar fechas legibles en la base de datos.
 */
export function getFormattedDate() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}