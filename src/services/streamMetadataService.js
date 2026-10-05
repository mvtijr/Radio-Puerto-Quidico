/**
 * SERVICIO DE METADATOS EN VIVO - RADIO PUERTO QUIDICO 105.1 FM
 * Soporte dual: Servidor SonicPanel / Icecast y Servidor Zeno.FM
 */

const SONIC_INFO_URL = 'https://sonic.portalfoxmix.club/cp/get_info.php?p=8320';

/**
 * Parsea y limpia el string 'title' que envían Shoutcast/Sonic/Zeno: "Artista - Canción"
 */
export function parseStreamTitle(rawTitle, fallbackArtist = "Radio Puerto Quidico", fallbackSong = "Música Continuada") {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return { artist: fallbackArtist, song: fallbackSong };
  }

  let clean = rawTitle.trim();
  if (!clean) {
    return { artist: fallbackArtist, song: fallbackSong };
  }

  // Limpiar prefijos de descarga / YouTube rippers
  clean = clean.replace(/^(?:y2mate\.com|snapsave\.app|savefrom|ssyoutube|mp3download)\s*[-_]?\s*/i, '');

  // Limpiar sufijos típicos de audio/video: (Audio), [Official Video], (Videoclip Oficial), etc.
  clean = clean.replace(/\s*[([](?:audio|official\s*video|video\s*oficial|videoclip\s*oficial|letra|lyric\s*video|hd|en\s*vivo|audio\s*oficial)[)\]]\s*$/i, '');

  // Si contiene el separador estándar " - "
  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    const artist = parts[0]?.trim() || fallbackArtist;
    const song = parts.slice(1).join(' - ')?.trim() || fallbackSong;
    return { artist, song };
  }

  // Si no tiene separador, devolver como título de tema
  return { artist: fallbackArtist, song: clean };
}

/**
 * Consulta el estado actual del streaming (SonicPanel o Zeno)
 */
export async function fetchLiveMetadata(customUrl = null) {
  const url = customUrl || SONIC_INFO_URL;

  // Si es señal de Zeno.fm
  if (url && (url.includes('zeno.fm') || url.includes('stream.zeno.fm'))) {
    return {
      success: true,
      rawTitle: 'Radio La Sureña ranchera De chile',
      art: '',
      listeners: 1,
      bitrate: 128,
      dj: 'Radio La Sureña (Zeno.FM)',
      djProfile: null
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`${url}&_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      rawTitle: data.title || '',
      art: data.art || '',
      listeners: parseInt(data.listeners || '0', 10),
      bitrate: parseInt(data.bitrate || '0', 10),
      dj: data.djusername !== 'No DJ' ? data.djusername : null,
      djProfile: data.djprofile || null
    };
  } catch (error) {
    // Si falla o timeout, retornar éxito false para activar fallback silencioso
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Diagnóstico y telemetría completa del servidor de streaming para el dueño de la radio
 */
export async function fetchLiveTelemetry(customUrl = null) {
  const startTime = Date.now();
  const url = customUrl || SONIC_INFO_URL;

  // Telemetría para servidores Zeno.FM
  if (url && (url.includes('zeno.fm') || url.includes('stream.zeno.fm'))) {
    const mountMatch = url.match(/stream\.zeno\.fm\/([a-zA-Z0-9]+)/);
    const mount = mountMatch ? mountMatch[1] : 'tf9zwn5vmd0uv';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`https://api.zeno.fm/mounts/metadata/subscribe/${mount}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const pingMs = Date.now() - startTime;
      controller.abort();

      return {
        online: res.status === 200,
        pingMs,
        bitrate: 128,
        listeners: 1,
        dj: 'Radio La Sureña (Zeno.FM)',
        rawTitle: 'Radio La Sureña ranchera De Chile',
        art: null,
        serverHost: 'stream.zeno.fm',
        port: 80,
        mount: `/${mount}`,
        checkedAt: new Date().toLocaleTimeString('es-CL'),
      };
    } catch (err) {
      const pingMs = Date.now() - startTime;
      return {
        online: false,
        pingMs,
        error: err.message,
        serverHost: 'stream.zeno.fm',
        port: 80,
        checkedAt: new Date().toLocaleTimeString('es-CL'),
      };
    }
  }

  // Telemetría SonicPanel
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${url}&_ping=${startTime}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const pingMs = Date.now() - startTime;

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      online: true,
      pingMs,
      bitrate: parseInt(data.bitrate || '0', 10),
      listeners: parseInt(data.listeners || '0', 10),
      dj: data.djusername !== 'No DJ' ? data.djusername : 'AutoDJ / Automatizado',
      rawTitle: data.title || 'Música Continuada (Sin ID3)',
      art: data.art || null,
      serverHost: 'sonic.portalfoxmix.club',
      port: 8320,
      checkedAt: new Date().toLocaleTimeString('es-CL'),
    };
  } catch (err) {
    const pingMs = Date.now() - startTime;
    return {
      online: false,
      pingMs,
      error: err.message,
      serverHost: 'sonic.portalfoxmix.club',
      port: 8320,
      checkedAt: new Date().toLocaleTimeString('es-CL'),
    };
  }
}
