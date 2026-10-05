import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useRadioConfig } from './RadioConfigContext';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const { config } = useRadioConfig();
  const currentFallbackUrl = config?.fallbackStreamUrl || RADIO_CONFIG.fallbackStreamUrl;

  // Calidad de audio: 'HD' (128 kbps) | 'ECO' (64 kbps ahorro de datos)
  const [audioQuality, setAudioQualityState] = useState(() => {
    try {
      return localStorage.getItem('radio_audio_quality') || 'HD';
    } catch {
      return 'HD';
    }
  });
  const [qualityToast, setQualityToast] = useState(null);

  // Servidor de streaming activo: 'primary' (Zeno FM) | 'backup' (SonicPanel)
  const [activeServer, setActiveServer] = useState('primary');
  const activeServerRef = useRef('primary');

  useEffect(() => {
    activeServerRef.current = activeServer;
  }, [activeServer]);

  const getActiveStreamUrl = useCallback((quality = audioQuality, server = activeServer) => {
    if (server === 'backup') {
      return currentFallbackUrl || 'https://sonic.portalfoxmix.club/8320/;';
    }
    if (quality === 'ECO') {
      return config?.streamUrlEco || config?.streamUrl || RADIO_CONFIG.streamUrl;
    }
    return config?.streamUrlHd || config?.streamUrl || RADIO_CONFIG.streamUrl;
  }, [config, audioQuality, activeServer, currentFallbackUrl]);

  // 'live' o 'podcast'
  const [playbackMode, setPlaybackMode] = useState('live');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  const [streamError, setStreamError] = useState(false);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('radio_volume');
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [podcastDuration, setPodcastDuration] = useState(0);

  // Temporizador para dormir ("Sleep Timer")
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
  const originalVolumeRef = useRef(volume);

  // Audio HTML5 element ref y temporizadores de resiliencia
  const audioRef = useRef(new Audio());
  const sleepTimerIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const userIntendedPlayRef = useRef(false);
  const stallWatchdogRef = useRef(null);
  const lastCurrentTimeRef = useRef(0);
  const stallCountRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Refs para evitar dependencia circular entre executeConnect y handleStreamFailure
  const executeConnectRef = useRef(null);
  const handleStreamFailureRef = useRef(null);

  // Manejo de fallo con conmutación failover invisible (Principal -> Respaldo en 3s)
  const handleStreamFailure = useCallback(() => {
    // Si el usuario pausó intencionalmente, no forzar reconexión
    if (!userIntendedPlayRef.current || playbackMode !== 'live') {
      setIsLoading(false);
      setIsPlaying(false);
      setIsReconnecting(false);
      return;
    }

    // Si el dispositivo está sin red (p. ej. túnel o zona ciega en Ruta P-72S)
    if (!navigator.onLine) {
      setIsNetworkOffline(true);
      setIsLoading(false);
      setIsPlaying(false);
      setIsReconnecting(true);
      setQualityToast("📡 Sin señal de internet móvil. Esperando cobertura para reanudar...");
      return;
    }

    // FAILOVER AUTOMÁTICO: Si estamos en el servidor principal, conmutar inmediatamente a Respaldo
    if (activeServerRef.current === 'primary') {
      console.warn("[AudioContext] Falla en servidor principal detectada. Activando conmutación Failover a Servidor de Respaldo...");
      setActiveServer('backup');
      activeServerRef.current = 'backup';
      setIsReconnecting(true);
      setIsLoading(true);
      setQualityToast("⚡ Señal principal inestable. Conmutando automáticamente a Servidor de Respaldo (SonicPanel)...");

      const backupUrl = currentFallbackUrl || 'https://sonic.portalfoxmix.club/8320/;';
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        if (executeConnectRef.current) {
          executeConnectRef.current(backupUrl, true);
        }
      }, 600);
      return;
    }

    // Si falló en el servidor de respaldo, intentar reconectar con reintentos exponenciales
    if (reconnectAttemptsRef.current < 3) {
      reconnectAttemptsRef.current += 1;
      const attempt = reconnectAttemptsRef.current;
      setRetryCount(attempt);
      setIsReconnecting(true);
      setIsLoading(true);

      const delay = attempt === 1 ? 2000 : attempt === 2 ? 4000 : 7000;
      setQualityToast(`🔄 Reconectando señal de respaldo (intento ${attempt}/3)...`);

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        // En el 3er intento, intentar volver al servidor principal por si ya retornó
        if (attempt === 3) {
          setActiveServer('primary');
          activeServerRef.current = 'primary';
        }
        const targetUrl = getActiveStreamUrl();
        if (executeConnectRef.current) {
          executeConnectRef.current(targetUrl, true);
        }
      }, delay);
    } else {
      // Agotados los reintentos
      setIsReconnecting(false);
      setIsLoading(false);
      setIsPlaying(false);
      setStreamError(true);
      setQualityToast("⚠️ Conexión de radio interrumpida. Toca reproducir para reintentar.");
      setTimeout(() => setQualityToast(null), 5000);
    }
  }, [playbackMode, currentFallbackUrl, getActiveStreamUrl]);

  // Función principal de conexión a stream con anti-cache dinámico
  const executeConnect = useCallback((url, isRetry = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setIsLoading(true);
    setStreamError(false);

    // Parámetro anti-caché para forzar buffer en vivo fresco
    const sep = url.includes('?') ? '&' : '?';
    const streamWithBuster = `${url}${sep}_t=${Date.now()}`;

    audio.src = streamWithBuster;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setIsReconnecting(false);
          reconnectAttemptsRef.current = 0;
          setRetryCount(0);
          setStreamError(false);
          lastCurrentTimeRef.current = audio.currentTime || 0;
          stallCountRef.current = 0;

          if (isRetry) {
            const serverLabel = activeServerRef.current === 'backup' 
              ? 'Servidor de Respaldo (SonicPanel)' 
              : 'Servidor Principal';
            setQualityToast(`✓ Transmitiendo en vivo vía ${serverLabel}`);
            setTimeout(() => setQualityToast(null), 3500);
          }
        })
        .catch((err) => {
          console.warn("[AudioContext] Falló audio.play(), iniciando recuperación:", err);
          if (handleStreamFailureRef.current) {
            handleStreamFailureRef.current();
          }
        });
    }
  }, []);

  // Mantener referencias actualizadas de forma segura sin mutar en render
  useEffect(() => {
    executeConnectRef.current = executeConnect;
    handleStreamFailureRef.current = handleStreamFailure;
    isPlayingRef.current = isPlaying;
  }, [executeConnect, handleStreamFailure, isPlaying]);

  // Forzar reconexión manual desde la UI
  const reconnectStream = useCallback(() => {
    userIntendedPlayRef.current = true;
    reconnectAttemptsRef.current = 0;
    setRetryCount(0);
    setStreamError(false);
    setIsReconnecting(true);
    setQualityToast("🔄 Conectando con servidor de audio...");
    executeConnect(getActiveStreamUrl(), true);
  }, [getActiveStreamUrl, executeConnect]);

  // Listener de eventos Online / Offline del navegador
  useEffect(() => {
    const handleOnline = () => {
      console.log("[AudioContext] Conexión a internet restablecida (online event)");
      setIsNetworkOffline(false);
      if (userIntendedPlayRef.current && playbackMode === 'live') {
        setQualityToast("⚡ Red móvil recuperada. Reconectando radio...");
        reconnectAttemptsRef.current = 0;
        setRetryCount(0);
        executeConnect(getActiveStreamUrl(), true);
      }
    };

    const handleOffline = () => {
      console.warn("[AudioContext] Dispositivo sin conexión a internet (offline event)");
      setIsNetworkOffline(true);
      if (isPlayingRef.current) {
        setQualityToast("📡 Señal de datos interrumpida. Esperando cobertura costera...");
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [playbackMode, getActiveStreamUrl, executeConnect]);

  // Configurar listeners del elemento de audio HTML5
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'none';

    const handleWaiting = () => {
      if (userIntendedPlayRef.current) setIsLoading(true);
    };

    const handleCanPlay = () => setIsLoading(false);

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setIsReconnecting(false);
      setStreamError(false);
      reconnectAttemptsRef.current = 0;
      setRetryCount(0);
    };

    const handlePause = () => {
      if (!userIntendedPlayRef.current) {
        setIsPlaying(false);
      }
    };

    const handleError = (e) => {
      console.warn("[AudioContext] Evento 'error' disparado por el elemento audio:", e);
      if (handleStreamFailureRef.current) {
        handleStreamFailureRef.current();
      }
    };

    const handleStalled = () => {
      if (userIntendedPlayRef.current && playbackMode === 'live' && !audio.paused) {
        console.warn("[AudioContext] Evento 'stalled' en buffer de streaming");
      }
    };

    const handleTimeUpdate = () => {
      if (playbackMode === 'podcast' && audio.duration) {
        setPodcastProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (playbackMode === 'podcast') {
        setPodcastDuration(audio.duration || 0);
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
    };
  }, [playbackMode]);

  // Watchdog de congelamiento para stream en vivo: detecta en 3 segundos si el audio se quedó mudo
  useEffect(() => {
    if (playbackMode !== 'live' || !isPlaying) {
      if (stallWatchdogRef.current) clearInterval(stallWatchdogRef.current);
      return;
    }

    stallWatchdogRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const current = audio.currentTime;
      // Si el tiempo de reproducción no avanza
      if (current === lastCurrentTimeRef.current && !audio.ended && isPlaying) {
        stallCountRef.current += 1;
        // Si no avanza durante 3 segundos consecutivos
        if (stallCountRef.current >= 3) {
          console.warn("[AudioContext] Watchdog: Señal congelada por 3s consecutivos. Iniciando failover...");
          stallCountRef.current = 0;
          if (navigator.onLine && userIntendedPlayRef.current) {
            if (activeServerRef.current === 'primary') {
              // Conmutar a respaldo
              if (handleStreamFailureRef.current) {
                handleStreamFailureRef.current();
              }
            } else {
              // Ya está en respaldo, refrescar buffer
              executeConnect(getActiveStreamUrl(), true);
            }
          }
        }
      } else {
        stallCountRef.current = 0;
        lastCurrentTimeRef.current = current;
      }
    }, 1000);

    return () => {
      if (stallWatchdogRef.current) {
        clearInterval(stallWatchdogRef.current);
        stallWatchdogRef.current = null;
      }
    };
  }, [isPlaying, playbackMode, getActiveStreamUrl, executeConnect]);

  // Actualizar volumen dinámico
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      localStorage.setItem('radio_volume', volume.toString());
    }
  }, [volume, isMuted]);

  // Manejo del Temporizador de Sueño ("Sleep Timer")
  const isSleepTimerActive = sleepTimerRemaining !== null && sleepTimerRemaining > 0;
  useEffect(() => {
    if (!isSleepTimerActive) return;

    sleepTimerIntervalRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Temporizador terminado: apagar audio
          clearInterval(sleepTimerIntervalRef.current);
          const audio = audioRef.current;
          userIntendedPlayRef.current = false;
          audio.pause();
          audio.src = '';
          setIsPlaying(false);
          // Restaurar volumen original
          audio.volume = originalVolumeRef.current;
          setVolume(originalVolumeRef.current);
          setSleepTimerMinutes(null);
          setQualityToast("🌙 Temporizador completado: La transmisión se ha apagado. ¡Buenas noches!");
          setTimeout(() => setQualityToast(null), 4000);
          return null;
        }

        // Desvanecimiento suave en los últimos 15 segundos
        if (prev <= 15 && audioRef.current) {
          const fadeVolume = (prev / 15) * originalVolumeRef.current;
          audioRef.current.volume = Math.max(0, fadeVolume);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
      }
    };
  }, [isSleepTimerActive]);

  const setSleepTimer = (minutes) => {
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    if (!minutes) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      if (audioRef.current) {
        audioRef.current.volume = originalVolumeRef.current;
      }
      setQualityToast("Temporizador para dormir desactivado.");
      setTimeout(() => setQualityToast(null), 3000);
      return;
    }

    originalVolumeRef.current = volume;
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);

    setQualityToast(`🌙 Temporizador activado: La radio se apagará en ${minutes} minutos.`);
    setTimeout(() => setQualityToast(null), 3500);
  };

  // Reproducir o pausar señal en vivo
  const togglePlayLive = () => {
    const audio = audioRef.current;
    const targetUrl = getActiveStreamUrl();

    if (playbackMode === 'podcast') {
      // Cambiar a en vivo
      setPlaybackMode('live');
      setCurrentPodcast(null);
      userIntendedPlayRef.current = true;
      executeConnect(targetUrl, false);
      return;
    }

    if (isPlaying) {
      userIntendedPlayRef.current = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      audio.pause();
      // En transmisiones en vivo, limpiar src al pausar ahorra ancho de banda del usuario
      audio.src = '';
      setIsPlaying(false);
      setIsLoading(false);
      setIsReconnecting(false);
    } else {
      userIntendedPlayRef.current = true;
      executeConnect(targetUrl, false);
    }
  };

  // Cambiar calidad de audio (HD 128k vs ECO 64k)
  const setAudioQuality = (newQuality) => {
    if (newQuality !== 'HD' && newQuality !== 'ECO') return;
    setAudioQualityState(newQuality);
    try {
      localStorage.setItem('radio_audio_quality', newQuality);
    } catch {}

    const msg = newQuality === 'ECO'
      ? '🌱 Modo Ahorro ECO (64 kbps) activado: Menor consumo de datos móviles.'
      : '✨ Modo Alta Fidelidad HD (128 kbps) activado: Calidad estéreo óptima.';
    setQualityToast(msg);
    setTimeout(() => setQualityToast(null), 3500);

    // Si está en vivo reproduciendo, recargar stream dinámicamente con nueva calidad
    if (isPlaying && playbackMode === 'live') {
      const targetUrl = getActiveStreamUrl(newQuality);
      executeConnect(targetUrl, false);
    }
  };

  const toggleAudioQuality = () => {
    setAudioQuality(audioQuality === 'HD' ? 'ECO' : 'HD');
  };

  // Reproducir un podcast específico
  const playPodcast = (podcast) => {
    const audio = audioRef.current;
    userIntendedPlayRef.current = false;
    setPlaybackMode('podcast');
    setCurrentPodcast(podcast);
    audio.src = podcast.audioUrl;
    setIsLoading(true);
    audio.play().catch(err => {
      console.error("[AudioContext] Error al reproducir podcast:", err);
      setIsLoading(false);
    });
  };

  // Volver a la señal en vivo desde cualquier lugar
  const switchToLive = () => {
    togglePlayLive();
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    originalVolumeRef.current = newVol;
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Conmutar manualmente entre Servidor Principal (Zeno FM) y Servidor de Respaldo (SonicPanel)
  const switchServer = useCallback((targetServer) => {
    if (targetServer !== 'primary' && targetServer !== 'backup') return;
    setActiveServer(targetServer);
    activeServerRef.current = targetServer;
    const serverLabel = targetServer === 'primary' 
      ? 'Servidor Principal (Zeno FM)' 
      : 'Servidor de Respaldo (SonicPanel)';
    setQualityToast(`🔄 Conectando con ${serverLabel}...`);
    const targetUrl = getActiveStreamUrl(audioQuality, targetServer);
    if (isPlaying || userIntendedPlayRef.current) {
      executeConnect(targetUrl, true);
    }
  }, [audioQuality, getActiveStreamUrl, isPlaying, executeConnect]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        playbackMode,
        isPlaying,
        isLoading,
        isReconnecting,
        retryCount,
        isNetworkOffline,
        streamError,
        activeServer,
        switchServer,
        isFailoverActive: activeServer === 'backup',
        volume,
        isMuted,
        currentPodcast,
        podcastProgress,
        podcastDuration,
        audioQuality,
        setAudioQuality,
        toggleAudioQuality,
        qualityToast,
        togglePlayLive,
        reconnectStream,
        playPodcast,
        switchToLive,
        handleVolumeChange,
        toggleMute,
        sleepTimerMinutes,
        sleepTimerRemaining,
        setSleepTimer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio debe ser usado dentro de AudioProvider');
  }
  return context;
};
