import { useState, useEffect, useRef, useCallback } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';
import { fetchLiveMetadata, parseStreamTitle } from '../services/streamMetadataService';

export function useOnAirMetadata() {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const onAir = currentConfig.onAir || RADIO_CONFIG.onAir;

  const defaultSong = onAir?.currentSong || "Cómo Dejar de Amarte";
  const defaultArtist = onAir?.currentArtist || "Los Charros de Lumaco";
  const defaultShow = onAir?.currentShow || "DJ Dino se toma el dial en Quidico";
  const defaultHost = onAir?.currentHost || "DJ Dino & Departamento de Prensa";
  const defaultGenre = onAir?.genre || "Cumbia Ranchera de Chile";
  const defaultHistory = onAir?.songHistory || RADIO_CONFIG.onAir.songHistory;

  const [liveSong, setLiveSong] = useState(null);
  const [liveArtist, setLiveArtist] = useState(null);
  const [liveArtwork, setLiveArtwork] = useState(null);
  const [liveListeners, setLiveListeners] = useState(0);
  const [liveDj, setLiveDj] = useState(null);
  const [dynamicHistory, setDynamicHistory] = useState(defaultHistory);

  const lastTrackRef = useRef({ artist: defaultArtist, song: defaultSong });
  const isPollingRef = useRef(false);

  // Consultar metadatos en vivo desde el servidor
  const checkLiveMetadata = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const data = await fetchLiveMetadata();
      if (data.success && data.rawTitle && data.rawTitle.trim().length > 0) {
        const { artist: parsedArtist, song: parsedSong } = parseStreamTitle(
          data.rawTitle,
          defaultArtist,
          defaultSong
        );

        // Si cambió la canción respecto a la anterior
        if (
          parsedSong !== lastTrackRef.current.song ||
          parsedArtist !== lastTrackRef.current.artist
        ) {
          lastTrackRef.current = { artist: parsedArtist, song: parsedSong };
          setLiveSong(parsedSong);
          setLiveArtist(parsedArtist);

          // Actualizar historial agregando la nueva canción arriba
          setDynamicHistory(prev => {
            const newItem = {
              id: `sh-live-${Date.now()}`,
              song: parsedSong,
              artist: parsedArtist,
              time: 'Ahora al aire',
              genre: defaultGenre
            };

            const updatedOld = (prev || []).map((item) => ({
              ...item,
              time: item.time === 'Ahora al aire' ? 'Hace 4 min' : item.time
            }));

            // Filtrar duplicados inmediatos y limitar a 12 items
            const filtered = updatedOld.filter(
              item => !(item.song.toLowerCase() === parsedSong.toLowerCase() && item.artist.toLowerCase() === parsedArtist.toLowerCase())
            );

            return [newItem, ...filtered].slice(0, 12);
          });
        }

        if (data.art) setLiveArtwork(data.art);
        if (data.listeners !== undefined) setLiveListeners(data.listeners);
        if (data.dj) setLiveDj(data.dj);
      } else {
        // Si no hay título ID3 en el stream (AutoDJ en silencio o sin tag), usar valores por defecto
        if (data.listeners !== undefined) setLiveListeners(data.listeners);
      }
    } catch (e) {
      console.warn("[useOnAirMetadata] Fallback silencioso a playlist predeterminada:", e);
    } finally {
      isPollingRef.current = false;
    }
  }, [defaultArtist, defaultSong, defaultGenre]);

  // Polling regular cada 20s y al cambiar visibilidad de pestaña
  useEffect(() => {
    // Consulta inicial inmediata
    checkLiveMetadata();

    const interval = setInterval(() => {
      // Solo consultar si la pestaña está activa
      if (typeof document !== 'undefined' && !document.hidden) {
        checkLiveMetadata();
      }
    }, 20000);

    const handleVisibility = () => {
      if (!document.hidden) {
        checkLiveMetadata();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [checkLiveMetadata]);

  // Suscripción en tiempo real vía Server-Sent Events (SSE) cuando la señal es de Zeno.FM
  useEffect(() => {
    const streamUrl = currentConfig?.streamUrl || RADIO_CONFIG.streamUrl;
    if (!streamUrl || (!streamUrl.includes('stream.zeno.fm') && !streamUrl.includes('zeno.fm'))) {
      return;
    }

    const mountMatch = streamUrl.match(/stream\.zeno\.fm\/([a-zA-Z0-9]+)/);
    const mount = mountMatch ? mountMatch[1] : 'tf9zwn5vmd0uv';

    let eventSource = null;
    try {
      eventSource = new EventSource(`https://api.zeno.fm/mounts/metadata/subscribe/${mount}`);

      eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          if (data && data.streamTitle) {
            const { artist: parsedArtist, song: parsedSong } = parseStreamTitle(
              data.streamTitle,
              defaultArtist,
              defaultSong
            );

            if (
              parsedSong !== lastTrackRef.current.song ||
              parsedArtist !== lastTrackRef.current.artist
            ) {
              lastTrackRef.current = { artist: parsedArtist, song: parsedSong };
              setLiveSong(parsedSong);
              setLiveArtist(parsedArtist);

              setDynamicHistory(prev => {
                const newItem = {
                  id: `sh-zeno-${Date.now()}`,
                  song: parsedSong,
                  artist: parsedArtist,
                  time: 'Ahora al aire',
                  genre: defaultGenre
                };

                const updatedOld = (prev || []).map(item => ({
                  ...item,
                  time: item.time === 'Ahora al aire' ? 'Hace 4 min' : item.time
                }));

                const filtered = updatedOld.filter(
                  item => !(item.song.toLowerCase() === parsedSong.toLowerCase() && item.artist.toLowerCase() === parsedArtist.toLowerCase())
                );

                return [newItem, ...filtered].slice(0, 12);
              });
            }
          }
        } catch (err) {
          console.warn("[Zeno SSE] Error al procesar metadata:", err);
        }
      };
    } catch (err) {
      console.warn("[Zeno SSE] No se pudo inicializar EventSource:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentConfig?.streamUrl, defaultArtist, defaultSong, defaultGenre]);

  // Valores finales computados
  const song = liveSong || defaultSong;
  const artist = liveArtist || defaultArtist;
  const show = liveDj ? `En Vivo con ${liveDj}` : defaultShow;
  const host = liveDj || defaultHost;
  const isLive = onAir?.isLive ?? true;
  const broadcastMode = onAir?.broadcastMode || "EN VIVO";
  const genre = defaultGenre;
  const songHistory = dynamicHistory.length > 0 ? dynamicHistory : defaultHistory;
  const artwork = liveArtwork || currentConfig.branding?.logo;

  const searchYouTube = (customArtist = artist, customSong = song) => {
    const query = `${customArtist} ${customSong} video oficial`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const dedicateOnWhatsApp = (customArtist = artist, customSong = song) => {
    const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
    const message = `¡Hola Radio Puerto Quidico 105.1 FM! 👋\n` +
      `📻 Escuché en la radio: *"${customSong}"* de *${customArtist}*.\n` +
      `❤️ Quiero dedicar esta canción a toda la gente linda de la costa y a: `;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    song,
    artist,
    show,
    host,
    isLive,
    broadcastMode,
    genre,
    artwork,
    liveListeners,
    songHistory,
    searchYouTube,
    dedicateOnWhatsApp,
    refreshMetadata: checkLiveMetadata
  };
}
