/**
 * Convierte un número total de segundos a formato HH:MM:SS.
 * @param {number} totalSeconds - El tiempo total en segundos.
 * @returns {string} El tiempo formateado como "HH:MM:SS".
 */
const Conversion = (totalSeconds) => {
    // Asegurarse de que el input sea un número entero no negativo
    const seconds = Math.max(0, Math.floor(totalSeconds || 0));

    // Calcular horas, minutos y segundos
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Función auxiliar para añadir un cero inicial si es menor a 10
    const pad = (num) => String(num).padStart(2, '0');

    // Retornar la cadena formateada
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

export default Conversion;