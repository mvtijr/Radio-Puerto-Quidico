import { RADIO_CONFIG } from '../config/radioConfig';

/**
 * Obtiene el día de la semana y hora decimal en la zona horaria de Chile (America/Santiago)
 */
export const getChileTimeInfo = () => {
  const now = new Date();
  
  // Opciones para formatear en zona horaria chilena
  const formatter = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  let weekdayStr = '';
  let hour = 0;
  let minute = 0;

  parts.forEach(p => {
    if (p.type === 'weekday') weekdayStr = p.value;
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  });

  // Capitalizar día: "lunes" -> "Lunes"
  const dayName = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
  const decimalHour = hour + minute / 60;

  return {
    dayName,
    hour,
    minute,
    decimalHour,
    timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  };
};

export const getCurrentShow = (scheduleList = null) => {
  const { dayName, decimalHour } = getChileTimeInfo();

  let schedule = scheduleList;
  if (!schedule && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('radio_puerto_quidico_config_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schedule && Array.isArray(parsed.schedule)) {
          schedule = parsed.schedule;
        }
      }
    } catch (e) {}
  }
  if (!schedule) {
    schedule = RADIO_CONFIG.schedule;
  }

  // Buscar programa que coincida con el día y la hora
  const activeShow = schedule.find(prog => {
    const isDayMatch = prog.days && prog.days.includes(dayName);
    if (!isDayMatch) return false;

    if (prog.endHour > 24) {
      // Programa nocturno que pasa de medianoche (ej: 23:00 a 07:00)
      return decimalHour >= prog.startHour || decimalHour < (prog.endHour - 24);
    }

    return decimalHour >= prog.startHour && decimalHour < prog.endHour;
  });

  if (activeShow) {
    return {
      ...activeShow,
      isLiveNow: true
    };
  }

  // Fallback por defecto si no hay coincidencia exacta
  return {
    id: "prog-official-stream",
    title: "Radio Puerto Quidico 91.3 FM",
    host: "Transmisión Oficial en Vivo",
    time: "24 Horas al Aire",
    category: "Transmisión Oficial",
    description: "Tu Radio, Tu Gente, Tu Puerto. Transmitiendo en vivo desde Caleta Quidico y Tirúa en el dial 91.3 FM.",
    tag: "En Vivo",
    image: "/images/noticias-puerto-quidico.png",
    dial: "91.3 FM",
    isLiveNow: true
  };
};
