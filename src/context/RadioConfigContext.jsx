import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { RADIO_CONFIG as DEFAULT_RADIO_CONFIG } from '../config/radioConfig';
import { fetchLiveMaritimeWeather } from '../services/maritimeWeatherService';

const RadioConfigContext = createContext();

const STORAGE_KEY = 'radio_puerto_quidico_config_v6';
const OLD_STORAGE_KEYS = ['radio_puerto_quidico_config_v5', 'radio_puerto_quidico_config_v2', 'radio_puerto_quidico_config_v1', 'radio_puerto_quidico_config'];
const PIN_KEY = 'radio_admin_pin_v1';
const DEFAULT_PIN = '1051';
const DEFAULT_REMOTE_CONFIG_URL = '/radio-remote-config.json';

const OFFICIAL_SHOW_IDS = ['prog-noticias-matinal', 'prog-noticias-mediodia', 'prog-surcando-el-lafken', 'prog-dj-dino'];

export async function hashPin(pin) {
  if (typeof window === 'undefined' || !pin) return pin;
  try {
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`rpq_radio_salt_2026_${pin.toString().trim()}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn("Crypto subtle no disponible:", e);
  }
  return pin.toString().trim();
}

export const RadioConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      // Limpiar versiones obsoletas de almacenamiento con programas de prueba
      OLD_STORAGE_KEYS.forEach(key => {
        try { localStorage.removeItem(key); } catch (e) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migración automática si el navegador tenía la señal previa por defecto guardada
        const isOldDefaultStream = parsed.streamUrl === "https://sonic.portalfoxmix.club/8320/;";
        const streamUrl = isOldDefaultStream ? DEFAULT_RADIO_CONFIG.streamUrl : (parsed.streamUrl || DEFAULT_RADIO_CONFIG.streamUrl);
        const streamUrlHd = isOldDefaultStream ? DEFAULT_RADIO_CONFIG.streamUrlHd : (parsed.streamUrlHd || DEFAULT_RADIO_CONFIG.streamUrlHd);
        const streamUrlEco = isOldDefaultStream ? DEFAULT_RADIO_CONFIG.streamUrlEco : (parsed.streamUrlEco || DEFAULT_RADIO_CONFIG.streamUrlEco);

        const currentSources = parsed.audioSources || {};
        const audioSources = {
          ...DEFAULT_RADIO_CONFIG.audioSources,
          ...currentSources,
          cabinaUrl: (isOldDefaultStream || currentSources.cabinaUrl === "https://sonic.portalfoxmix.club/8320/;")
            ? DEFAULT_RADIO_CONFIG.audioSources.cabinaUrl
            : (currentSources.cabinaUrl || DEFAULT_RADIO_CONFIG.audioSources.cabinaUrl)
        };

        // Filtrar estrictamente solo programas oficiales de las imágenes, eliminando cualquier residuo de prueba
        let schedule = DEFAULT_RADIO_CONFIG.schedule;
        if (Array.isArray(parsed.schedule)) {
          const onlyOfficial = parsed.schedule.filter(p => OFFICIAL_SHOW_IDS.includes(p?.id) && p?.image);
          if (onlyOfficial.length === 4) {
            schedule = onlyOfficial;
          }
        }

        // Filtrar estrictamente solo Comercializadora Don Nica como único auspiciador verdadero
        let sponsors = DEFAULT_RADIO_CONFIG.sponsors;
        if (Array.isArray(parsed.sponsors)) {
          const onlyDonNica = parsed.sponsors.filter(s => 
            s?.id === 'sponsor-don-nica' || 
            (s?.name && s.name.toLowerCase().includes('don nica'))
          );
          if (onlyDonNica.length > 0) {
            sponsors = onlyDonNica;
          }
        }

        return {
          ...DEFAULT_RADIO_CONFIG,
          ...parsed,
          streamUrl,
          streamUrlHd,
          streamUrlEco,
          audioSources,
          schedule,
          sponsors,
          contact: { ...DEFAULT_RADIO_CONFIG.contact, ...(parsed.contact || {}) },
          branding: { ...DEFAULT_RADIO_CONFIG.branding, ...(parsed.branding || {}) },
          maritimeWeather: { ...DEFAULT_RADIO_CONFIG.maritimeWeather, ...(parsed.maritimeWeather || {}) },
          onAir: { ...DEFAULT_RADIO_CONFIG.onAir, ...(parsed.onAir || {}) },
          emergencyAlert: { ...DEFAULT_RADIO_CONFIG.emergencyAlert, ...(parsed.emergencyAlert || {}) },
          remoteBroadcast: { ...DEFAULT_RADIO_CONFIG.remoteBroadcast, ...(parsed.remoteBroadcast || {}) },
        };
      }
    } catch {
      console.warn("No se pudo cargar la configuración guardada");
    }
    return DEFAULT_RADIO_CONFIG;
  });

  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
    } catch (e) {
      return DEFAULT_PIN;
    }
  });

  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const isSyncingRef = useRef(false);

  // Empujar configuración a la nube / API local en tiempo real
  const pushConfigToCloud = useCallback(async (configToPush = null) => {
    const data = configToPush || config;
    const targetUrl = data?.remoteSyncUrl || '/api/remote-config';

    const payload = {
      version: "2.0",
      updatedAt: new Date().toISOString(),
      stationName: data.stationName,
      streamUrl: data.streamUrl,
      streamUrlHd: data.streamUrlHd,
      streamUrlEco: data.streamUrlEco,
      emergencyAlert: {
        ...(data.emergencyAlert || {}),
        timestamp: Date.now()
      },
      onAir: data.onAir,
      maritimeWeather: data.maritimeWeather,
      schedule: data.schedule,
      sponsors: data.sponsors
    };

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('es-CL'));
        return { success: true };
      }
    } catch (err) {
      console.warn("[RadioConfigContext] Error al empujar a la nube/endpoint:", err.message);
    }
    return { success: false };
  }, [config]);

  // Guardar en localStorage cada vez que cambie config y empujar a la nube
  const saveConfig = useCallback((newConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      // Auto-empuje a la nube en segundo plano
      pushConfigToCloud(newConfig).catch(() => {});
      return true;
    } catch (e) {
      console.error("Error al guardar configuración:", e);
      return false;
    }
  }, [pushConfigToCloud]);

  const updateConfig = useCallback((partial) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        ...partial,
        contact: partial.contact ? { ...prev.contact, ...partial.contact } : prev.contact,
        branding: partial.branding ? { ...prev.branding, ...partial.branding } : prev.branding,
        emergencyAlert: partial.emergencyAlert ? { ...prev.emergencyAlert, ...partial.emergencyAlert } : prev.emergencyAlert,
        audioSources: partial.audioSources ? { ...prev.audioSources, ...partial.audioSources } : prev.audioSources,
        remoteBroadcast: partial.remoteBroadcast ? { ...prev.remoteBroadcast, ...partial.remoteBroadcast } : prev.remoteBroadcast,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Actualización de clima marítimo satelital en vivo para Quidico
  const refreshLiveMaritimeWeather = useCallback(async () => {
    try {
      const res = await fetchLiveMaritimeWeather();
      if (res && res.success && res.data) {
        setConfig(prev => {
          const updated = {
            ...prev,
            maritimeWeather: {
              ...(prev.maritimeWeather || {}),
              ...res.data
            }
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        return { success: true, data: res.data };
      }
    } catch (e) {
      console.warn("No se pudo actualizar el clima marítimo en vivo:", e);
    }
    return { success: false };
  }, []);

  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(DEFAULT_RADIO_CONFIG);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const verifyPin = useCallback(async (candidate) => {
    if (!candidate) return false;
    const trimmed = candidate.toString().trim();
    // 1. Coincidencia directa con adminPin (sea texto plano legacy o hash)
    if (trimmed === adminPin) return true;
    // 2. Coincidencia con PIN por defecto oficial (1051)
    if (trimmed === DEFAULT_PIN) return true;
    // 3. Hash del candidato comparado con adminPin
    const candidateHash = await hashPin(trimmed);
    if (candidateHash === adminPin) return true;
    // 4. Hash del candidato comparado con hash del PIN por defecto
    const defaultHash = await hashPin(DEFAULT_PIN);
    if (candidateHash === defaultHash) return true;
    return false;
  }, [adminPin]);

  const updatePin = useCallback(async (newPin) => {
    try {
      const hashed = await hashPin(newPin);
      localStorage.setItem(PIN_KEY, hashed);
      setAdminPin(hashed);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const exportConfigJson = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importConfigJson = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.stationName && !parsed.streamUrl && !parsed.emergencyAlert) {
        throw new Error("Formato inválido");
      }
      saveConfig({
        ...DEFAULT_RADIO_CONFIG,
        ...parsed,
        contact: { ...DEFAULT_RADIO_CONFIG.contact, ...(parsed.contact || {}) },
        branding: { ...DEFAULT_RADIO_CONFIG.branding, ...(parsed.branding || {}) },
        maritimeWeather: { ...DEFAULT_RADIO_CONFIG.maritimeWeather, ...(parsed.maritimeWeather || {}) },
        onAir: { ...DEFAULT_RADIO_CONFIG.onAir, ...(parsed.onAir || {}) },
        emergencyAlert: { ...DEFAULT_RADIO_CONFIG.emergencyAlert, ...(parsed.emergencyAlert || {}) },
        audioSources: { ...DEFAULT_RADIO_CONFIG.audioSources, ...(parsed.audioSources || {}) },
        remoteBroadcast: { ...DEFAULT_RADIO_CONFIG.remoteBroadcast, ...(parsed.remoteBroadcast || {}) },
      });
      return true;
    } catch {
      console.error("Error al importar JSON");
      return false;
    }
  }, [saveConfig]);

  // Sincronización remota de alertas de emergencia y cambios globales
  const syncRemoteConfig = useCallback(async (customUrl = null) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    const targetUrl = customUrl || config?.remoteSyncUrl || DEFAULT_REMOTE_CONFIG_URL;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const remoteData = await res.json();

      // Fusionar suavemente alertas de emergencia y cambios del servidor sin borrar ediciones locales
      setConfig(prev => {
        let emergencyAlert = prev.emergencyAlert;
        if (remoteData.emergencyAlert) {
          const localTime = prev.emergencyAlert?.timestamp || 0;
          const remoteTime = remoteData.emergencyAlert?.timestamp || (remoteData.updatedAt ? new Date(remoteData.updatedAt).getTime() : 0);
          
          // Si el servidor es más reciente o si el local no tiene alerta activa, aplicar
          if (remoteTime >= localTime || !prev.emergencyAlert?.active) {
            emergencyAlert = {
              ...prev.emergencyAlert,
              ...remoteData.emergencyAlert
            };
          }
        }

        const merged = {
          ...prev,
          emergencyAlert,
          streamUrl: remoteData.streamUrl || prev.streamUrl,
          streamUrlHd: remoteData.streamUrlHd || prev.streamUrlHd,
          streamUrlEco: remoteData.streamUrlEco || prev.streamUrlEco,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });

      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('es-CL'));
      return { success: true, data: remoteData };
    } catch (err) {
      console.warn("[RadioConfigContext] Sincronización remota no disponible o en espera:", err.message);
      setSyncStatus('error');
      return { success: false, error: err.message };
    } finally {
      isSyncingRef.current = false;
    }
  }, [config?.remoteSyncUrl]);

  // Polling periódico silencioso de configuración remota cada 60s y carga meteorológica inicial
  useEffect(() => {
    // Sincronización inicial
    syncRemoteConfig();

    // Actualización de clima marítimo en vivo satelital en background
    refreshLiveMaritimeWeather().catch(() => {});

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncRemoteConfig();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [syncRemoteConfig, refreshLiveMaritimeWeather]);

  return (
    <RadioConfigContext.Provider value={{
      config,
      saveConfig,
      updateConfig,
      resetConfig,
      adminPin,
      updatePin,
      verifyPin,
      exportConfigJson,
      importConfigJson,
      syncRemoteConfig,
      pushConfigToCloud,
      refreshLiveMaritimeWeather,
      syncStatus,
      lastSyncTime,
      defaultConfig: DEFAULT_RADIO_CONFIG
    }}>
      {children}
    </RadioConfigContext.Provider>
  );
};

export const useRadioConfig = () => {
  const context = useContext(RadioConfigContext);
  if (!context) {
    throw new Error('useRadioConfig debe usarse dentro de un RadioConfigProvider');
  }
  return context;
};
