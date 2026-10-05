import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';
import { fetchLiveTelemetry } from '../services/streamMetadataService';

export const AdminModal = ({ isOpen, onClose }) => {
  const {
    config,
    saveConfig,
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
  } = useRadioConfig();

  // Autenticación por PIN con protección contra fuerza bruta persistente (inmune a F5)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(sessionStorage.getItem('radio_admin_failed_attempts_count') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lockoutTimer, setLockoutTimer] = useState(() => {
    try {
      const until = parseInt(sessionStorage.getItem('radio_admin_lockout_until_ts') || '0', 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  });
  const [activeTab, setActiveTab] = useState('general'); // general | remotebroadcast | onair | emergency | schedule | maritime | notices | sponsors | backup | manual
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  // Estados de Telemetría en Vivo del Servidor
  const [telemetry, setTelemetry] = useState(null);
  const [isCheckingTelemetry, setIsCheckingTelemetry] = useState(false);

  // Estados del Probador de Micrófono WebRTC
  const [micTesting, setMicTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  // Refs para navegación de pestañas y scroll del cuerpo del modal
  const tabsContainerRef = useRef(null);
  const contentScrollRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabsWheel = (e) => {
    if (tabsContainerRef.current) {
      if (e.deltaY !== 0) {
        tabsContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const handleSelectTab = (tabId, element) => {
    setActiveTab(tabId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const adminTabs = [
    { id: 'general', label: 'Emisora & Streaming', icon: 'fa-tower-broadcast' },
    { id: 'remotebroadcast', label: 'Móvil & Despachos', icon: 'fa-microphone-lines' },
    { id: 'onair', label: 'Al Aire & Música', icon: 'fa-compact-disc' },
    { id: 'emergency', label: 'Cadena de Emergencia', icon: 'fa-triangle-exclamation' },
    { id: 'schedule', label: 'Programación', icon: 'fa-calendar-days' },
    { id: 'maritime', label: 'Mareas & Mar', icon: 'fa-anchor' },
    { id: 'notices', label: 'Avisos Comunidad', icon: 'fa-bullhorn' },
    { id: 'sponsors', label: 'Auspiciadores & Pautas', icon: 'fa-handshake' },
    { id: 'backup', label: 'Respaldos & PIN', icon: 'fa-floppy-disk' },
    { id: 'manual', label: 'Manual de Entrega', icon: 'fa-book-open' },
  ];

  // Temporizador de bloqueo ante intentos fallidos
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Estado local para edición
  const [formData, setFormData] = useState(config);
  const [newPinValue, setNewPinValue] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isUpdatingMaritime, setIsUpdatingMaritime] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);

  // Actualizar formData cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...config,
        emergencyAlert: config.emergencyAlert || RADIO_CONFIG.emergencyAlert,
        audioSources: config.audioSources || RADIO_CONFIG.audioSources,
        remoteBroadcast: config.remoteBroadcast || RADIO_CONFIG.remoteBroadcast,
      });
      setPinError('');
      setToastMessage('');

      // Sincronizar bloqueo activo persistente ante recargas F5
      try {
        const until = parseInt(sessionStorage.getItem('radio_admin_lockout_until_ts') || '0', 10);
        const remaining = Math.ceil((until - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutTimer(remaining);
          setPinError(`Acceso bloqueado por seguridad (${remaining}s restantes).`);
        }
      } catch {}
    }
  }, [isOpen, config]);

  const checkServerTelemetry = useCallback(async () => {
    setIsCheckingTelemetry(true);
    const data = await fetchLiveTelemetry(formData?.streamUrl);
    setTelemetry(data);
    setIsCheckingTelemetry(false);
    if (data.online) {
      showToast(`🟢 Servidor SonicPanel En Línea (${data.pingMs}ms, ${data.listeners} oyentes)`);
    } else {
      showToast(`🔴 Atención: Servidor de audio no responde o está fuera del aire`);
    }
  }, [formData?.streamUrl, showToast]);

  // Chequeo de telemetría automática al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      checkServerTelemetry();
    }
  }, [isAuthenticated, checkServerTelemetry]);

  // Limpieza de micrófono al cerrar modal
  useEffect(() => {
    if (!isOpen && micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setMicTesting(false);
    }
  }, [isOpen]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();

    // Comprobar bloqueo activo en sessionStorage
    try {
      const until = parseInt(sessionStorage.getItem('radio_admin_lockout_until_ts') || '0', 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutTimer(remaining);
        setPinError(`Acceso bloqueado temporalmente. Espera ${remaining} segundos.`);
        return;
      }
    } catch {}

    const isValid = await verifyPin(enteredPin);
    if (isValid) {
      setIsAuthenticated(true);
      setPinError('');
      setFailedAttempts(0);
      setEnteredPin('');
      try {
        sessionStorage.removeItem('radio_admin_lockout_until_ts');
        sessionStorage.removeItem('radio_admin_failed_attempts_count');
      } catch {}
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      try {
        sessionStorage.setItem('radio_admin_failed_attempts_count', String(nextAttempts));
      } catch {}

      if (nextAttempts >= 4) {
        // Penalización progresiva:
        // 4 intentos: 45s; 5 intentos: 90s; 6+ intentos: 300s (5 minutos)
        const penalty = nextAttempts === 4 ? 45 : nextAttempts === 5 ? 90 : 300;
        const lockoutUntil = Date.now() + penalty * 1000;
        try {
          sessionStorage.setItem('radio_admin_lockout_until_ts', String(lockoutUntil));
        } catch {}
        setLockoutTimer(penalty);
        setPinError(`Demasiados intentos fallidos. Panel bloqueado por ${penalty} segundos.`);
      } else {
        setPinError(`PIN incorrecto. Intento ${nextAttempts} de 4.`);
      }
    }
  };

  const handleSaveAll = () => {
    const success = saveConfig(formData);
    if (success) {
      showToast('✅ ¡Todos los cambios han sido guardados con éxito!');
    } else {
      showToast('❌ Ocurrió un error al guardar.');
    }
  };

  // Emitir de inmediato alerta de emergencia a todos los oyentes
  const handleEmitEmergencyNow = (customAlert = null) => {
    const targetAlert = customAlert || {
      ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
      active: true,
      timestamp: Date.now(),
      updatedAt: 'Hace instantes'
    };

    const newConfig = {
      ...formData,
      emergencyAlert: targetAlert
    };

    setFormData(newConfig);
    const ok = saveConfig(newConfig);
    if (ok) {
      showToast('🚨 ¡CADENA DE EMERGENCIA EMITIDA AL AIRE EN TIEMPO REAL!');
    } else {
      showToast('❌ Error al emitir la alerta');
    }
  };

  // Desactivar de inmediato la alerta de emergencia
  const handleDeactivateEmergencyNow = () => {
    const targetAlert = {
      ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
      active: false,
      timestamp: Date.now(),
      updatedAt: 'Desactivada hace instantes'
    };

    const newConfig = {
      ...formData,
      emergencyAlert: targetAlert
    };

    setFormData(newConfig);
    const ok = saveConfig(newConfig);
    if (ok) {
      showToast('⏹️ Cadena de emergencia desactivada. Transmisión normal restablecida.');
    }
  };

  // Sincronizar satélite oceanográfico Quidico
  const handleRefreshMaritime = async () => {
    setIsUpdatingMaritime(true);
    showToast('📡 Consultando boyas y satélites para Caleta Quidico...');
    const res = await refreshLiveMaritimeWeather();
    setIsUpdatingMaritime(false);
    if (res && res.success) {
      setFormData(prev => ({
        ...prev,
        maritimeWeather: {
          ...(prev.maritimeWeather || {}),
          ...res.data
        }
      }));
      showToast('✅ ¡Datos oceanográficos y mareas satelitales actualizados!');
    } else {
      showToast('⚠️ No se pudo obtener la telemetría satelital, usando datos locales');
    }
  };

  // Publicar a la nube
  const handlePushCloudNow = async () => {
    setIsPushingCloud(true);
    showToast('🚀 Distribuyendo cambios a la red y teléfonos de oyentes...');
    const res = await pushConfigToCloud(formData);
    setIsPushingCloud(false);
    if (res && res.success) {
      showToast('✅ ¡Configuración publicada en la nube exitosamente!');
    } else {
      showToast('⚠️ No se pudo conectar con el endpoint en la nube');
    }
  };

  const handleResetToFactory = () => {
    if (window.confirm('¿Estás seguro de restablecer todos los datos a la configuración inicial de fábrica? Se perderán los cambios locales no exportados.')) {
      resetConfig();
      setFormData(config);
      showToast('🔄 Configuración restaurada a valores de fábrica');
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportConfigJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `radio-quidico-config-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('📥 Archivo de respaldo descargado');
  };

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(exportConfigJson());
    showToast('📋 Configuración copiada al portapapeles');
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) return;
    const ok = importConfigJson(jsonInput);
    if (ok) {
      showToast('✅ Configuración importada correctamente');
      setJsonInput('');
    } else {
      showToast('❌ Error: El JSON no tiene el formato correcto');
    }
  };

  const handleDownloadRemoteJson = () => {
    const remoteData = {
      updatedAt: new Date().toISOString(),
      version: "2.0",
      emergencyAlert: formData.emergencyAlert,
      onAir: formData.onAir,
      streamUrl: formData.streamUrl,
      streamUrlHd: formData.streamUrlHd,
      streamUrlEco: formData.streamUrlEco,
    };
    const blob = new Blob([JSON.stringify(remoteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'radio-remote-config.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Archivo radio-remote-config.json descargado para subir al hosting');
  };

  const handleTestSync = async () => {
    showToast('🔄 Probando sincronización con servidor...');
    const result = await syncRemoteConfig(formData.remoteSyncUrl || null);
    if (result && result.success) {
      showToast('✅ Sincronización exitosa con servidor remoto');
    } else {
      showToast('⚠️ No se pudo conectar al endpoint remoto, usando copia local');
    }
  };

  const handleSelectAudioSource = (sourceKey) => {
    const sources = formData.audioSources || {};
    let newUrl = formData.streamUrl;
    let newHd = formData.streamUrlHd;
    let label = 'Cabina Central';

    if (sourceKey === 'cabina') {
      newUrl = sources.cabinaUrl || 'https://stream.zeno.fm/tf9zwn5vmd0uv';
      newHd = sources.cabinaUrl || 'https://stream.zeno.fm/tf9zwn5vmd0uv';
      label = 'Cabina Central / Radio La Sureña';
    } else if (sourceKey === 'autodj') {
      newUrl = sources.autodjUrl || 'https://sonic.portalfoxmix.club/8320/;';
      newHd = sources.autodjUrl || 'https://sonic.portalfoxmix.club/8320/;';
      label = 'AutoDJ / Música Continuada';
    } else if (sourceKey === 'cadena') {
      newUrl = sources.cadenaUrl || formData.fallbackStreamUrl || 'https://icecast.walmradio.com:8443/jazz';
      newHd = sources.cadenaUrl || formData.fallbackStreamUrl || 'https://icecast.walmradio.com:8443/jazz';
      label = sources.cadenaName || 'Cadena Nacional';
    }

    setFormData({
      ...formData,
      streamUrl: newUrl,
      streamUrlHd: newHd,
      audioSources: {
        ...sources,
        activeSource: sourceKey
      }
    });

    showToast(`📻 Señal conmutada a: ${label} (Recuerda pulsar "Guardar Cambios")`);
  };

  const handleCopyMobileBroadcastParams = () => {
    const rb = formData.remoteBroadcast || {};
    const text = `📻 PARÁMETROS DE ENLACE MÓVIL Y DESPACHOS - RADIO PUERTO QUIDICO 105.1 FM\n\n` +
      `Para transmitir en vivo desde el celular o terreno (con app Larix Broadcaster o BUTT):\n` +
      `• Servidor / Host: ${rb.serverHost || 'sonic.portalfoxmix.club'}\n` +
      `• Puerto: ${rb.port || '8320'}\n` +
      `• Punto de Montaje (Mountpoint): ${rb.mountPoint || '/live'}\n` +
      `• Usuario DJ: ${rb.djUsername || 'quidico_movil'}\n` +
      `• Códec recomendado: ${rb.recommendedCodec || 'AAC+ (HE-AAC v2)'}\n` +
      `• Bitrate recomendado para la Costa: ${rb.recommendedBitrate || '64 kbps'}\n\n` +
      `¡Listo para salir al aire desde cualquier rincón de Quidico y Tirúa!`;
    navigator.clipboard.writeText(text);
    showToast("📋 Parámetros de enlace móvil copiados al portapapeles");
  };

  const handleShareMobileParamsWhatsApp = () => {
    const rb = formData.remoteBroadcast || {};
    const text = `📻 *PARÁMETROS DE ENLACE MÓVIL Y DESPACHOS*\n*Radio Puerto Quidico 105.1 FM / 91.3 FM*\n\n` +
      `Estimado colega, para transmitir en directo desde el celular (app Larix Broadcaster o BUTT):\n\n` +
      `📡 *Host:* \`${rb.serverHost || 'sonic.portalfoxmix.club'}\`\n` +
      `🔌 *Puerto:* \`${rb.port || '8320'}\`\n` +
      `📍 *Mountpoint:* \`${rb.mountPoint || '/live'}\`\n` +
      `👤 *Usuario DJ:* \`${rb.djUsername || 'quidico_movil'}\`\n` +
      `🎚️ *Calidad óptima:* AAC+ 64 kbps (estable para 3G/4G)\n\n` +
      `¡Transmite sin cortes para toda la costa!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast("📱 Compartiendo parámetros vía WhatsApp");
  };

  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setMicTesting(true);

      const checkLevel = () => {
        if (!micStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(checkLevel);
      };
      checkLevel();
      showToast("🎙️ Micrófono activado. Habla para comprobar modulación.");
    } catch {
      showToast("⚠️ No se pudo acceder al micrófono del dispositivo");
    }
  };

  const stopMicTest = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicTesting(false);
    setMicLevel(0);
    showToast("⏹️ Prueba de micrófono finalizada");
  };

  const handleSendSponsorWhatsAppReport = (sp) => {
    const rawNumber = (sp.phone || formData.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
    const clicksCount = sp.clicks || 0;
    const msg = `¡Estimado(a) equipo de *${sp.name || 'Auspiciador'}*! 👋\n\n` +
      `📻 Desde la Dirección de *Radio Puerto Quidico 105.1 FM / 91.3 FM*, le hacemos entrega del balance de rendimiento de su publicidad en nuestra plataforma digital:\n\n` +
      `📊 *REPORTE DE PAUTA COMERCIAL:*\n` +
      `• *Comercio:* ${sp.name}\n` +
      `• *Categoría:* ${sp.category || 'Comercio Local'}\n` +
      `• *Espacio:* Banner Web Oficial y Mención Radial\n` +
      `• *Impactos / Clics Directos a su Contacto:* *${clicksCount} auditores*\n\n` +
      `Agradecemos sinceramente su confianza en la radio de nuestra tierra y en la difusión del comercio costero.\n\n` +
      `Atentamente,\n` +
      `*Dirección Comercial & Producción*\n` +
      `Radio Puerto Quidico 105.1 FM`;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`📱 Comprobante generado para ${sp.name}`);
  };

  const handleCopySponsorReport = (sp) => {
    const clicksCount = sp.clicks || 0;
    const text = `REPORTE OFICIAL DE PAUTA - RADIO PUERTO QUIDICO 105.1 FM\n` +
      `Comercio: ${sp.name}\n` +
      `Categoría: ${sp.category || 'Comercio Local'}\n` +
      `Espacio Publicitario: Banner Oficial Web y Mención en Cabina\n` +
      `Clics / Contactos Registrados: ${clicksCount}\n` +
      `Fecha de emisión del informe: ${new Date().toLocaleDateString('es-CL')}\n` +
      `Emisora: Radio Puerto Quidico 105.1 FM • Caleta Quidico & Tirúa Costa`;
    navigator.clipboard.writeText(text);
    showToast(`📋 Reporte copiado para ${sp.name}`);
  };

  const handleDownloadAllSponsorsReport = () => {
    const sponsorsList = formData.sponsors || [];
    const totalClicks = sponsorsList.reduce((acc, s) => acc + (s.clicks || 0), 0);
    let report = `=====================================================\n`;
    report += `INFORME GENERAL DE PAUTAS COMERCIALES Y RENDIMIENTO\n`;
    report += `RADIO PUERTO QUIDICO 105.1 FM • 91.3 FM TIRÚA COSTA\n`;
    report += `Fecha de Generación: ${new Date().toLocaleString('es-CL')}\n`;
    report += `=====================================================\n\n`;
    report += `TOTAL DE AUSPICIADORES ACTIVOS: ${sponsorsList.length}\n`;
    report += `TOTAL DE CLICS Y CONTACTOS GENERADOS: ${totalClicks}\n\n`;
    report += `DETALLE INDIVIDUAL POR EMPRESA:\n`;
    report += `-----------------------------------------------------\n`;
    sponsorsList.forEach((s, idx) => {
      report += `${idx + 1}. ${s.name.toUpperCase()}\n`;
      report += `   • Categoría: ${s.category || 'General'}\n`;
      report += `   • Teléfono / WhatsApp: ${s.phone || 'No registrado'}\n`;
      report += `   • Clics Registrados: ${s.clicks || 0}\n`;
      report += `   • Eslogan: ${s.tagline || 'Sin eslogan'}\n\n`;
    });
    report += `=====================================================\n`;
    report += `Documento oficial para control contable de Radio Puerto Quidico.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pautas-radio-quidico-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("💾 Informe general de auspiciadores descargado");
  };

  const handleDownloadOwnerManual = () => {
    const text = `=====================================================
MANUAL DE OPERACIÓN Y ENTREGA - RADIO PUERTO QUIDICO
105.1 FM Caleta Quidico • 91.3 FM Tirúa Costa
Tu Radio de Siempre • La Costa de Arauco al Mundo
=====================================================

1. ACCESO AL PANEL DE ADMINISTRACIÓN:
   - Código PIN predeterminado: 1051 (Modificable en la pestaña Respaldos & PIN).
   - Atajo de teclado directo en cabina: Presiona 'Alt + A' o 'Ctrl + Shift + A' en cualquier parte de la web.
   - Acceso desde el pie de página: Clic en el botón con candado "Panel Emisora".

2. SEÑAL DE STREAMING DE AUDIO EN VIVO:
   - URL Servidor HD (128 kbps): ${formData.streamUrlHd || formData.streamUrl || 'https://sonic.portalfoxmix.club/8320/;'}
   - URL Servidor ECO (64 kbps): ${formData.streamUrlEco || formData.streamUrl || 'https://sonic.portalfoxmix.club/8320/;'}
   - URL Respaldo (Fallback): ${formData.fallbackStreamUrl || 'https://icecast.walmradio.com:8443/jazz'}
   - Nota Técnica: Si tu servidor es Shoutcast o SonicPanel, incluye siempre el ";" al final de la URL para forzar la reproducción directa en navegadores modernos sin reproductores intermedios.
   - Selector HD / ECO: Los auditores pueden elegir calidad óptima de estudio (128 kbps) o modo ahorro de datos (64 kbps, ideal para botes pescadores, navegación marítima o caminos rurales sin 4G).

3. PROTOCOLO Y CADENA RADIAL DE EMERGENCIA COMUNAL:
   - Pestaña: "Cadena de Emergencia".
   - Botón Switch: Activa o desactiva la cadena al instante.
   - Plantillas Rápidas de 1 Clic precargadas:
     * Marejadas Anormales en Borde Costero (Alerta Roja / Armada de Chile)
     * Corte de Tránsito en Ruta P-72S (Tirúa-Cañete)
     * Corte General Eléctrico (Transmisión con Generador)
     * Alerta Meteorológica Comunal (SENAPRED)
   - Al activarse, se despliega una barra roja prioritaria fija en el tope de toda la página web con sirena animada y llamada a escuchar la señal oficial.

4. CANCIÓN Y TEMA AL AIRE (METADATOS EN VIVO):
   - Pestaña: "Al Aire & Música".
   - Permite que los auditores vean en tiempo real la canción, artista y locutor conduciendo en cabina.
   - Cuenta con botones de 1 clic para cambiar rápidamente a "Música Continuada", "Cumbia Ranchera", "Noticiero", etc.
   - Incluye funciones automáticas para que los auditores dediquen la canción por WhatsApp o vean el videoclip en YouTube.

5. AUSPICIADORES LOCALES Y MÉTRICAS DE CLICS:
   - Pestaña: "Auspiciadores".
   - Cada vez que un auditor hace clic en un auspiciador (como Comercializadora Don Nica), el sistema cuenta y registra la interacción.
   - Esto te permite entregarle reportes reales a tus clientes comerciales para demostrar el impacto publicitario de la emisora.
   - Tarifario Oficial 2026 integrado con 3 planes comerciales (Bronce $35.000, Plata $75.000, Oro $130.000).

6. NOTAS DE VOZ AL AIRE (MICRÓFONO ABIERTO):
   - Los vecinos y pescadores pueden pulsar el botón "Grabar Nota de Voz", hablar hasta 60 segundos con visualizador de audio en tiempo real y enviarlo directamente a tu WhatsApp de cabina (+569 6267 9087) para salir al aire.

7. APLICACIÓN PWA OFICIAL INSTALABLE:
   - En celulares Android, iPhone y computadores aparece el botón "Instalar App". Al instalarla, queda un ícono oficial en el escritorio/pantalla para abrir la radio sin navegador.

8. RESPALDOS Y SEGURIDAD:
   - Antes de realizar modificaciones grandes, pulsa "Descargar archivo JSON" en la pestaña Respaldos & PIN. Guarda este archivo en tu computador o envíalo a tu correo para tener siempre una copia de seguridad intacta.
=====================================================`;
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'Manual_Operacion_Radio_Puerto_Quidico_105.1FM.txt');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('📖 Manual Oficial de Operación descargado en tu equipo');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d1c32] border border-[#00d2ff]/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[0_12px_48px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Barra Superior del Panel */}
        <div className="bg-[#010e24] px-6 py-4 border-b border-[#a8c8ff]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#00d2ff]/60 overflow-hidden shrink-0">
              <img src={config.branding?.logo || '/logo.png'} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-['Anton',sans-serif] uppercase tracking-wide text-white">
                  Panel de Administración y Control
                </h2>
                <span className="bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full font-['Inter',sans-serif]">
                  Emisora
                </span>
              </div>
              <p className="text-xs text-[#a5e7ff] font-['Inter',sans-serif]">
                Radio Puerto Quidico 105.1 FM / 91.3 FM Tirúa Costa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar panel"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Notificación Toast interna */}
        {toastMessage && (
          <div className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] px-4 py-2 text-xs font-['Inter',sans-serif] font-bold text-center animate-fadeIn shadow-md">
            {toastMessage}
          </div>
        )}

        {/* Pantalla de Bloqueo por PIN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#1c2a41] border border-[#00d2ff]/40 flex items-center justify-center text-[#00d2ff] text-2xl shadow-xl">
              <i className="fa-solid fa-lock"></i>
            </div>
            
            <div>
              <h3 className="text-xl font-['Anton',sans-serif] uppercase text-white tracking-wide">
                Acceso Exclusivo de Administración
              </h3>
              <p className="text-xs text-[#c0c6d6] mt-1 max-w-sm font-['Inter',sans-serif]">
                Para la seguridad de la radio, ingresa el código PIN de administración.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#010e24] border border-[#a8c8ff]/30 rounded-2xl px-4 py-3 text-center text-lg tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono transition-colors"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-[#ffb4ab] font-['Inter',sans-serif]">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] font-['Inter',sans-serif] font-bold uppercase tracking-wider text-xs py-3 rounded-2xl transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                Desbloquear Panel
              </button>
            </form>

            <span className="text-[11px] text-[#8a919f] font-['Inter',sans-serif] flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-[#00d2ff] text-[10px]"></i> Acceso restringido al personal autorizado
            </span>
          </div>
        ) : (
          /* Contenido del Panel Desbloqueado */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navegación por Pestañas con Controles de Desplazamiento */}
            <div className="relative bg-[#010e24] border-b border-[#a8c8ff]/15 flex items-center select-none z-20 shadow-sm">
              {/* Flecha Izquierda para Desplazar */}
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                title="Desplazar apartados a la izquierda"
                aria-label="Desplazar a la izquierda"
                className="h-12 px-3 text-[#a5e7ff]/70 hover:text-[#00d2ff] hover:bg-[#071933] border-r border-[#a8c8ff]/15 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>

              {/* Contenedor Desplazable de Pestañas con Soporte Rueda de Ratón y Scrollbar Fina */}
              <div
                ref={tabsContainerRef}
                onWheel={handleTabsWheel}
                className="flex-1 flex gap-2 overflow-x-auto px-3 py-2 custom-tabs-scroll font-['Inter',sans-serif] scroll-smooth"
              >
                {adminTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => handleSelectTab(tab.id, e.currentTarget)}
                    className={`py-2 px-3 sm:px-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all shrink-0 cursor-pointer whitespace-nowrap select-none ${
                      activeTab === tab.id
                        ? 'bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/50 shadow-[0_0_15px_rgba(0,210,255,0.25)]'
                        : 'text-[#c0c6d6] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <i className={`fa-solid ${tab.icon} text-xs ${
                      tab.id === 'emergency' && formData.emergencyAlert?.active ? 'text-rose-400' : ''
                    }`}></i>
                    <span>{tab.label}</span>
                    {tab.id === 'emergency' && formData.emergencyAlert?.active && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Flecha Derecha para Desplazar */}
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                title="Desplazar apartados a la derecha"
                aria-label="Desplazar a la derecha"
                className="h-12 px-3 text-[#a5e7ff]/70 hover:text-[#00d2ff] hover:bg-[#071933] border-l border-[#a8c8ff]/15 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>

            {/* Cuerpo del Formulario con Scroll y Ref para Reseteo de Posición al Cambiar Pestaña */}
            <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-[#d6e3ff] font-['Inter',sans-serif] text-xs">
              
              {/* TAB 1: EMISORA Y STREAMING */}
              {activeTab === 'general' && (
                <div className="space-y-5">
                  {/* Monitor Técnico de Salud del Streaming y Alerta de Señal Caída */}
                  <div className="bg-[#112036]/70 p-4 sm:p-5 rounded-2xl border border-[#00d2ff]/30 shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#a8c8ff]/15">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center text-sm shadow">
                          <i className="fa-solid fa-heart-pulse"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2 flex-wrap">
                            <span>Monitor de Salud del Streaming en Vivo</span>
                            {telemetry ? (
                              telemetry.online ? (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  AL AIRE (24/7)
                                </span>
                              ) : (
                                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                                  <i className="fa-solid fa-triangle-exclamation"></i>
                                  SEÑAL FUERA DEL AIRE
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] text-[#8a919f]">Consultando estado...</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-[#c0c6d6]">
                            Diagnóstico y telemetría en tiempo real del servidor SonicPanel / Icecast de la emisora.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={checkServerTelemetry}
                          disabled={isCheckingTelemetry}
                          className="bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#00d2ff] hover:text-white border border-[#00d2ff]/40 px-3 py-1.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow"
                        >
                          <i className={`fa-solid fa-arrows-rotate ${isCheckingTelemetry ? 'fa-spin' : ''}`}></i>
                          <span>Verificar Señal</span>
                        </button>

                        <a
                          href={formData.remoteBroadcast?.adminPanelUrl || 'https://sonic.portalfoxmix.club:2083/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#1c2a41] hover:bg-[#2c3951] text-[#a5e7ff] hover:text-white border border-[#a8c8ff]/25 px-3 py-1.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow"
                          title="Abrir consola de reinicio de SonicPanel"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          <span>Consola SonicPanel</span>
                        </a>
                      </div>
                    </div>

                    {/* Métricas de Telemetría */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="bg-[#010e24]/80 p-3 rounded-xl border border-[#a8c8ff]/15">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Oyentes en Vivo</span>
                        <span className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                          <i className="fa-solid fa-headphones text-[#00d2ff] text-xs"></i>
                          {telemetry ? `${telemetry.listeners} auditores` : '--'}
                        </span>
                      </div>

                      <div className="bg-[#010e24]/80 p-3 rounded-xl border border-[#a8c8ff]/15">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Bitrate Servidor</span>
                        <span className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                          <i className="fa-solid fa-bolt text-[#f6bf22] text-xs"></i>
                          {telemetry && telemetry.bitrate ? `${telemetry.bitrate} kbps` : '128 kbps'}
                        </span>
                      </div>

                      <div className="bg-[#010e24]/80 p-3 rounded-xl border border-[#a8c8ff]/15">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Latencia / Ping</span>
                        <span className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                          <i className="fa-solid fa-gauge-high text-emerald-400 text-xs"></i>
                          {telemetry ? `${telemetry.pingMs} ms` : '--'}
                        </span>
                      </div>

                      <div className="bg-[#010e24]/80 p-3 rounded-xl border border-[#a8c8ff]/15">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Conexión DJ</span>
                        <span className="text-xs sm:text-sm font-bold text-white truncate block mt-1" title={telemetry?.dj}>
                          {telemetry?.dj || 'AutoDJ Quidico'}
                        </span>
                      </div>
                    </div>

                    {telemetry && !telemetry.online && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-rose-400 text-base shrink-0"></i>
                        <div>
                          <strong>¡Alerta para el dueño de la radio!</strong> El servidor no está enviando audio. Revisa si hay corte de energía en la antena repetidora o ingresa a SonicPanel para reiniciar el AutoDJ.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-radio text-[#00d2ff]"></i> Datos Principales de la Emisora
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Nombre de la Estación
                        </label>
                        <input
                          type="text"
                          value={formData.stationName || ''}
                          onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Frecuencia Principal
                        </label>
                        <input
                          type="text"
                          value={formData.frequencyPrimary || ''}
                          onChange={(e) => setFormData({ ...formData, frequencyPrimary: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Frecuencia Secundaria
                        </label>
                        <input
                          type="text"
                          value={formData.frequencySecondary || ''}
                          onChange={(e) => setFormData({ ...formData, frequencySecondary: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Horario de Transmisión
                        </label>
                        <input
                          type="text"
                          value={formData.broadcastHours || ''}
                          onChange={(e) => setFormData({ ...formData, broadcastHours: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Slogan Oficial
                        </label>
                        <input
                          type="text"
                          value={formData.slogan || ''}
                          onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Lema del Logo
                        </label>
                        <input
                          type="text"
                          value={formData.motto || ''}
                          onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Señal de Audio Streaming */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-signal text-[#00d2ff]"></i> Señal de Streaming de Audio en Vivo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          URL Servidor de Streaming (Icecast / Shoutcast / Sonic Panel)
                        </label>
                        <input
                          type="url"
                          value={formData.streamUrl || ''}
                          onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
                          placeholder="https://sonic.portalfoxmix.club/8320/;"
                        />
                        <p className="text-[10px] text-[#8a919f] mt-1">
                          Nota: Asegúrate de incluir el ";" al final si tu proveedor es Shoutcast/SonicPanel para forzar audio directo.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                            ⚡ Stream Alta Calidad HD (128 kbps)
                          </label>
                          <input
                            type="url"
                            value={formData.streamUrlHd || ''}
                            onChange={(e) => setFormData({ ...formData, streamUrlHd: e.target.value })}
                            className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
                            placeholder="https://sonic.portalfoxmix.club/8320/;"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                            🌱 Stream Ahorro de Datos ECO (64 kbps)
                          </label>
                          <input
                            type="url"
                            value={formData.streamUrlEco || ''}
                            onChange={(e) => setFormData({ ...formData, streamUrlEco: e.target.value })}
                            className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
                            placeholder="https://sonic.portalfoxmix.club/8320/;"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          URL de Streaming de Respaldo (Fallback)
                        </label>
                        <input
                          type="url"
                          value={formData.fallbackStreamUrl || ''}
                          onChange={(e) => setFormData({ ...formData, fallbackStreamUrl: e.target.value })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Conmutador Rápido de Fuentes de Audio (Modo Cadena) */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-[#00d2ff]"></i> Conmutador de Fuentes de Audio & Modo Cadena
                      </h4>
                      <span className="text-[11px] text-[#a5e7ff] bg-[#010e24] px-2.5 py-1 rounded-full border border-[#00d2ff]/30 font-bold">
                        Fuente Activa: <span className="text-white uppercase">{formData.audioSources?.activeSource || 'cabina'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#c0c6d6]">
                      Cambia en 1 clic la señal transmitida en la web entre los estudios principales, el AutoDJ automatizado o una cadena nacional retransmitida (ARCHI / SENAPRED).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Fuente 1: Cabina */}
                      <button
                        type="button"
                        onClick={() => handleSelectAudioSource('cabina')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.audioSources?.activeSource === 'cabina'
                            ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-white shadow-[0_0_15px_rgba(0,210,255,0.25)]'
                            : 'bg-[#010e24] border-[#a8c8ff]/15 text-[#c0c6d6] hover:border-[#a8c8ff]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs uppercase flex items-center gap-1.5 text-white">
                            <i className="fa-solid fa-microphone text-[#00d2ff]"></i> Cabina Central
                          </span>
                          {formData.audioSources?.activeSource === 'cabina' && (
                            <i className="fa-solid fa-circle-check text-[#00d2ff] text-xs"></i>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8a919f] block">105.1 FM / 91.3 FM Estudios</span>
                      </button>

                      {/* Fuente 2: AutoDJ */}
                      <button
                        type="button"
                        onClick={() => handleSelectAudioSource('autodj')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.audioSources?.activeSource === 'autodj'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                            : 'bg-[#010e24] border-[#a8c8ff]/15 text-[#c0c6d6] hover:border-[#a8c8ff]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs uppercase flex items-center gap-1.5 text-white">
                            <i className="fa-solid fa-robot text-emerald-400"></i> AutoDJ Respaldo
                          </span>
                          {formData.audioSources?.activeSource === 'autodj' && (
                            <i className="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8a919f] block">Música Continuada Servidor</span>
                      </button>

                      {/* Fuente 3: Cadena Nacional */}
                      <button
                        type="button"
                        onClick={() => handleSelectAudioSource('cadena')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.audioSources?.activeSource === 'cadena'
                            ? 'bg-[#f6bf22]/20 border-[#f6bf22] text-white shadow-[0_0_15px_rgba(246,191,34,0.25)]'
                            : 'bg-[#010e24] border-[#a8c8ff]/15 text-[#c0c6d6] hover:border-[#a8c8ff]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs uppercase flex items-center gap-1.5 text-white">
                            <i className="fa-solid fa-network-wired text-[#f6bf22]"></i> Modo Cadena
                          </span>
                          {formData.audioSources?.activeSource === 'cadena' && (
                            <i className="fa-solid fa-circle-check text-[#f6bf22] text-xs"></i>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8a919f] block">
                          {formData.audioSources?.cadenaName || 'Retransmisión ARCHI'}
                        </span>
                      </button>
                    </div>

                    {/* Configuración de URL de Cadena */}
                    <div className="bg-[#010e24]/90 p-3 rounded-xl border border-[#a8c8ff]/15 space-y-2 mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                            Nombre del Evento o Cadena
                          </label>
                          <input
                            type="text"
                            value={formData.audioSources?.cadenaName || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              audioSources: { ...formData.audioSources, cadenaName: e.target.value }
                            })}
                            placeholder="Ej: Cadena Nacional de Emergencia / ARCHI"
                            className="w-full bg-[#112036] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                            URL del Stream a Retransmitir
                          </label>
                          <input
                            type="url"
                            value={formData.audioSources?.cadenaUrl || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              audioSources: { ...formData.audioSources, cadenaUrl: e.target.value }
                            })}
                            placeholder="https://servidor-cadena.com/stream"
                            className="w-full bg-[#112036] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contacto y WhatsApp */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
                      <i className="fa-brands fa-whatsapp text-emerald-400"></i> Contacto y WhatsApp de Cabina
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          WhatsApp Visible (Formato con espacios)
                        </label>
                        <input
                          type="text"
                          value={formData.contact?.whatsappDisplay || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, whatsappDisplay: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          WhatsApp Enlace Directo (Solo números con código país +569...)
                        </label>
                        <input
                          type="text"
                          value={formData.contact?.whatsapp || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, whatsapp: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={formData.contact?.email || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, email: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Dirección / Estudios
                        </label>
                        <input
                          type="text"
                          value={formData.contact?.address || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, address: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MÓVIL & DESPACHOS EN TERRENO */}
              {activeTab === 'remotebroadcast' && (
                <div className="space-y-6">
                  {/* Tarjeta 1: Parámetros del Encoder Móvil */}
                  <div className="bg-[#112036]/70 p-5 rounded-2xl border border-[#00d2ff]/30 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#a8c8ff]/15">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center text-sm shadow">
                          <i className="fa-solid fa-tower-broadcast"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                            Transmisión Móvil & Despachos en Terreno
                          </h4>
                          <p className="text-[11px] text-[#c0c6d6]">
                            Parámetros oficiales para locutores y reporteros en estadios, festivales o conferencias comunales.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyMobileBroadcastParams}
                          className="bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] font-bold text-xs uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <i className="fa-solid fa-copy"></i>
                          <span>Copiar Parámetros</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleShareMobileParamsWhatsApp}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                          <span>Enviar a Locutor</span>
                        </button>
                      </div>
                    </div>

                    {/* Formulario de Parámetros del Servidor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Servidor / Host de Emisión
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.serverHost || 'sonic.portalfoxmix.club'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, serverHost: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Puerto DJ / Emisión
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.port || '8320'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, port: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Punto de Montaje (Mountpoint)
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.mountPoint || '/live'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, mountPoint: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Usuario DJ / Locutor
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.djUsername || 'quidico_movil'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, djUsername: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Códec Recomendado
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.recommendedCodec || 'AAC+ (HE-AAC v2)'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, recommendedCodec: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold mb-1">
                          Bitrate Óptimo para Red Costera
                        </label>
                        <input
                          type="text"
                          value={formData.remoteBroadcast?.recommendedBitrate || '64 kbps (Estable en 3G/4G)'}
                          onChange={(e) => setFormData({
                            ...formData,
                            remoteBroadcast: { ...formData.remoteBroadcast, recommendedBitrate: e.target.value }
                          })}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Probador de Micrófono WebRTC en Vivo */}
                  <div className="bg-[#112036]/70 p-5 rounded-2xl border border-[#a8c8ff]/20 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#a8c8ff]/15">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm shadow">
                          <i className="fa-solid fa-microphone-lines"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                            Probador de Micrófono Web (Check de Audio Pre-Emisión)
                          </h4>
                          <p className="text-[11px] text-[#c0c6d6]">
                            Permite al locutor hablar a su celular y chequear el nivel de entrada de su voz antes de salir al aire.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={micTesting ? stopMicTest : startMicTest}
                        className={`px-4 py-2 rounded-xl text-xs uppercase font-bold flex items-center gap-2 cursor-pointer shadow transition-all ${
                          micTesting
                            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] hover:brightness-110'
                        }`}
                      >
                        <i className={`fa-solid ${micTesting ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                        <span>{micTesting ? 'Detener Prueba de Audio' : 'Activar Micrófono'}</span>
                      </button>
                    </div>

                    {/* Vúmetro en Vivo */}
                    <div className="space-y-2 bg-[#010e24]/90 p-4 rounded-xl border border-[#a8c8ff]/15">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#a5e7ff] font-bold">Nivel de Modulación de Voz:</span>
                        <span className={`font-bold ${micLevel > 80 ? 'text-rose-400' : micLevel > 40 ? 'text-emerald-400' : 'text-[#8a919f]'}`}>
                          {micTesting ? `${micLevel}%` : 'Micrófono Inactivo'}
                        </span>
                      </div>

                      <div className="w-full bg-[#071933] h-4 rounded-full overflow-hidden p-0.5 border border-[#a8c8ff]/20">
                        <div
                          className={`h-full rounded-full transition-all duration-75 ${
                            micLevel > 80
                              ? 'bg-gradient-to-r from-emerald-400 via-[#f6bf22] to-rose-500'
                              : micLevel > 40
                              ? 'bg-gradient-to-r from-emerald-500 to-[#00d2ff]'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${micTesting ? Math.max(3, micLevel) : 0}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-[#8a919f] italic">
                        {micTesting
                          ? "✓ Habla con naturalidad. Si la barra sube a verde/amarillo, tu micrófono tiene buena ganancia."
                          : "Pulsa 'Activar Micrófono' para habilitar el vúmetro y verificar tu señal."}
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta 3: Aplicaciones Recomendadas para Locutores */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-mobile-screen-button text-[#f6bf22]"></i> Aplicaciones Móviles Gratuitas Recomendadas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#c0c6d6]">
                      <div className="bg-[#010e24] p-3 rounded-xl border border-[#a8c8ff]/15 space-y-1">
                        <span className="font-bold text-white block">📱 Larix Broadcaster (Android / iPhone)</span>
                        <p className="text-[11px] text-[#8a919f]">
                          La mejor app para transmisiones móviles por Icecast/Shoutcast. Soporta compresión AAC+, bajísimo retraso y excelente estabilidad en rutas rurales.
                        </p>
                      </div>

                      <div className="bg-[#010e24] p-3 rounded-xl border border-[#a8c8ff]/15 space-y-1">
                        <span className="font-bold text-white block">💻 BUTT - Broadcast Using This Tool (PC/Laptop)</span>
                        <p className="text-[11px] text-[#8a919f]">
                          Programa gratuito y liviano para Windows/Mac. Ideal si vas a transmitir un festival o concejo municipal con notebook y consola física de audio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AL AIRE & MÚSICA */}
              {activeTab === 'onair' && (
                <div className="space-y-6">
                  {/* Tarjeta de Vista Previa en Vivo de la Pantalla del Auditor */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#003543]/60 via-[#112036] to-[#010e24] border border-[#00d2ff]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-['Oswald',sans-serif] text-[10px] uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Vista en Pantalla de los Auditores
                      </span>
                      <span className="text-[10px] text-[#a5e7ff] font-mono">
                        Estado: {formData.onAir?.broadcastMode || 'EN VIVO'}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 pt-1">
                      <div className="w-12 h-12 rounded-xl bg-[#010e24] border border-[#00d2ff]/50 flex items-center justify-center text-[#00d2ff] text-xl shrink-0 shadow">
                        <i className="fa-solid fa-compact-disc fa-spin"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-[#00d2ff] font-bold font-['Oswald',sans-serif]">
                          🎵 Tema al Aire:
                        </p>
                        <h3 className="text-base sm:text-lg font-bold text-white truncate font-['Inter',sans-serif]">
                          {formData.onAir?.currentSong || 'Música Continuada'} • <span className="text-[#a5e7ff]">{formData.onAir?.currentArtist || 'Radio Quidico'}</span>
                        </h3>
                        <p className="text-xs text-[#c0c6d6] truncate font-['Inter',sans-serif] mt-0.5">
                          🎙️ {formData.onAir?.currentShow || 'Radio Puerto Quidico 91.3 FM'} — Conduce: <strong className="text-white">{formData.onAir?.currentHost || 'DJ Dino & Departamento de Prensa'}</strong> ({formData.onAir?.genre || 'Cumbia Ranchera & Noticias'})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plantillas Rápidas de 1 Clic */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-bolt text-[#f6bf22]"></i> Plantillas Rápidas Oficiales (1 Clic)
                    </h4>
                    <p className="text-xs text-[#8a919f]">
                      Haz clic en cualquiera de estas opciones para actualizar el tema al aire de inmediato:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[
                        {
                          title: '🎧 DJ Dino en Vivo',
                          song: 'Música Ranchera y Dedicatorias',
                          artist: 'WhatsApp +569 6267 9087',
                          show: 'DJ Dino se toma el dial en Quidico',
                          host: 'DJ Dino',
                          genre: 'Cumbia Ranchera Costera',
                          mode: 'EN VIVO'
                        },
                        {
                          title: '📰 Las Noticias (Matinal)',
                          song: 'Edición Matinal (06:00 a 09:00 hrs)',
                          artist: 'Departamento de Prensa',
                          show: 'Las Noticias en Puerto Quidico (Edición Matinal)',
                          host: 'Departamento de Prensa',
                          genre: 'Informativo Matinal',
                          mode: 'EN VIVO'
                        },
                        {
                          title: '🎙️ Las Noticias (Mediodía)',
                          song: 'Edición Mediodía (12:00 a 13:00 hrs)',
                          artist: 'Departamento de Prensa',
                          show: 'Las Noticias en Puerto Quidico (Edición Mediodía)',
                          host: 'Departamento de Prensa',
                          genre: 'Informativo Central',
                          mode: 'EN VIVO'
                        },
                        {
                          title: '📻 Señal Oficial 91.3 FM',
                          song: 'Tu Radio, Tu Gente, Tu Puerto',
                          artist: 'Caleta Quidico & Tirúa Costa',
                          show: 'Radio Puerto Quidico 91.3 FM',
                          host: 'Transmisión 24 Horas',
                          genre: 'Música & Información',
                          mode: 'AUTOMATIZADO'
                        },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              onAir: {
                                ...(formData.onAir || {}),
                                currentSong: preset.song,
                                currentArtist: preset.artist,
                                currentShow: preset.show,
                                currentHost: preset.host,
                                genre: preset.genre,
                                broadcastMode: preset.mode,
                                isLive: preset.mode === 'EN VIVO'
                              }
                            });
                            showToast(`🎵 Plantilla "${preset.title}" cargada en el panel`);
                          }}
                          className="p-3 rounded-xl bg-[#010e24] hover:bg-[#1c2a41] border border-[#a8c8ff]/20 hover:border-[#00d2ff] text-left transition-all cursor-pointer group"
                        >
                          <span className="block font-bold text-white text-xs group-hover:text-[#00d2ff] truncate">
                            {preset.title}
                          </span>
                          <span className="block text-[11px] text-[#a5e7ff] truncate mt-0.5">
                            {preset.song}
                          </span>
                          <span className="block text-[10px] text-[#8a919f] truncate">
                            {preset.artist}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formulario de Personalización Manual */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-sliders text-[#00d2ff]"></i> Personalizar Transmisión al Aire
                    </h4>

                    {/* Modo de Transmisión */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-2 font-semibold">
                        Modo de Transmisión
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { mode: 'EN VIVO', label: 'En Vivo', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
                          { mode: 'AUTOMATIZADO', label: 'Automatizado', color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300' },
                          { mode: 'CADENA COMUNAL', label: 'Cadena Comunal', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                        ].map((m) => (
                          <button
                            key={m.mode}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                onAir: {
                                  ...(formData.onAir || {}),
                                  broadcastMode: m.mode,
                                  isLive: m.mode === 'EN VIVO'
                                }
                              });
                            }}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              (formData.onAir?.broadcastMode || 'EN VIVO') === m.mode
                                ? `${m.color} shadow-lg ring-2 ring-white/20`
                                : 'border-[#a8c8ff]/20 bg-[#010e24] text-[#8a919f] hover:text-white'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${
                              m.mode === 'EN VIVO' ? 'bg-emerald-400 animate-pulse' : m.mode === 'AUTOMATIZADO' ? 'bg-cyan-400' : 'bg-amber-400 animate-ping'
                            }`} />
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Canción o Tema al Aire
                        </label>
                        <input
                          type="text"
                          value={formData.onAir?.currentSong || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            onAir: { ...(formData.onAir || {}), currentSong: e.target.value }
                          })}
                          placeholder="Ej: Cómo Dejar de Amarte"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Artista o Grupo Musical
                        </label>
                        <input
                          type="text"
                          value={formData.onAir?.currentArtist || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            onAir: { ...(formData.onAir || {}), currentArtist: e.target.value }
                          })}
                          placeholder="Ej: Los Charros de Lumaco"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Programa al Aire
                        </label>
                        <input
                          type="text"
                          value={formData.onAir?.currentShow || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            onAir: { ...(formData.onAir || {}), currentShow: e.target.value }
                          })}
                          placeholder="Ej: DJ Dino se toma el dial en Quidico"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Locutor en Micrófono
                        </label>
                        <input
                          type="text"
                          value={formData.onAir?.currentHost || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            onAir: { ...(formData.onAir || {}), currentHost: e.target.value }
                          })}
                          placeholder="Ej: DJ Dino"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Género Musical / Estilo
                        </label>
                        <input
                          type="text"
                          value={formData.onAir?.genre || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            onAir: { ...(formData.onAir || {}), genre: e.target.value }
                          })}
                          placeholder="Ej: Cumbia Ranchera Costera"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CADENA DE EMERGENCIA COMUNAL */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  {/* Encabezado y Estado de Transmisión */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#112036]/60 p-5 rounded-2xl border border-[#a8c8ff]/15">
                    <div>
                      <span className="text-[10px] font-['Oswald',sans-serif] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Protocolo de Emergencia Tirúa & Borde Costero
                      </span>
                      <h4 className="text-base font-bold text-white uppercase tracking-wide mt-1 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-rose-400"></i> Cadena Radial de Emergencia
                      </h4>
                      <p className="text-xs text-[#a5e7ff] mt-0.5">
                        Al activar la cadena, se despliega una barra prioritaria de alerta al tope de toda la página para informar de inmediato a la comunidad.
                      </p>
                    </div>

                    {/* Interruptor Principal ON / OFF */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider ${
                        formData.emergencyAlert?.active ? 'text-rose-400 font-black' : 'text-slate-400'
                      }`}>
                        {formData.emergencyAlert?.active ? '🔴 ALERTA ACTIVA' : '⚪ DESACTIVADA'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.emergencyAlert?.active) {
                            handleDeactivateEmergencyNow();
                          } else {
                            handleEmitEmergencyNow();
                          }
                        }}
                        className={`w-14 h-8 rounded-full transition-all relative p-1 cursor-pointer ${
                          formData.emergencyAlert?.active
                            ? 'bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                            : 'bg-slate-700'
                        }`}
                        title={formData.emergencyAlert?.active ? "Desactivar cadena" : "Activar cadena"}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                          formData.emergencyAlert?.active ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Botones de Acción Directa e Inmediata */}
                  <div className="bg-[#071933] p-4 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${formData.emergencyAlert?.active ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                        <i className={`fa-solid ${formData.emergencyAlert?.active ? 'fa-tower-broadcast' : 'fa-bell-slash'}`}></i>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs uppercase">
                          Estado en la Web: {formData.emergencyAlert?.active ? '🚨 ALERTA ACTIVA Y VISIBLE EN VIVO' : '⏹️ TRANSMISIÓN NORMAL (SIN ALERTA)'}
                        </h5>
                        <p className="text-[11px] text-[#c0c6d6]">
                          {formData.emergencyAlert?.active 
                            ? 'La barra roja de emergencia está desplegada en el encabezado de toda la página para todos los oyentes.'
                            : 'La emisora transmite su programación regular sin interrupciones ni avisos de alerta.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {!formData.emergencyAlert?.active ? (
                        <button
                          type="button"
                          onClick={() => handleEmitEmergencyNow()}
                          className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-['Oswald',sans-serif] font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          <span>Emitir Alerta Ahora</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeactivateEmergencyNow()}
                          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-['Oswald',sans-serif] font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <i className="fa-solid fa-check"></i>
                          <span>Desactivar Alerta Ahora</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Plantillas Rápidas de Emergencia */}
                  <div className="bg-[#112036]/60 p-5 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-bolt text-[#f6bf22]"></i> Plantillas Rápidas Oficiales (Emisión en 1 Clic)
                    </h5>
                    <p className="text-xs text-[#c0c6d6]">
                      Haz clic en cualquiera de estas plantillas oficiales para emitir de inmediato el aviso a toda la comunidad:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {(RADIO_CONFIG.emergencyPresets || []).map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            const newAlert = {
                              active: true,
                              level: preset.level,
                              title: preset.title,
                              message: preset.message,
                              source: preset.source,
                              updatedAt: 'Hace instantes',
                              actionLabel: 'Escuchar Transmisión Oficial',
                              timestamp: Date.now()
                            };
                            handleEmitEmergencyNow(newAlert);
                          }}
                          className="text-left p-3.5 rounded-xl bg-[#010e24] hover:bg-[#1a2d4b] border border-[#a8c8ff]/20 hover:border-rose-400 transition-all cursor-pointer group shadow"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                              {preset.title}
                            </span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              preset.level === 'urgente' ? 'bg-rose-500/20 text-rose-300' :
                              preset.level === 'precaucion' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-sky-500/20 text-sky-300'
                            }`}>
                              {preset.level}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#c0c6d6] line-clamp-2">
                            {preset.message}
                          </p>
                          <span className="text-[10px] text-rose-400 mt-2 block font-semibold flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-[9px]"></i> Emitir inmediatamente al aire →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Configuración Detallada de la Alerta */}
                  <div className="bg-[#112036]/60 p-5 rounded-2xl border border-[#a8c8ff]/15 space-y-4">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-sliders text-[#00d2ff]"></i> Detalle del Comunicado de Emergencia
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Nivel de Severidad</label>
                        <select
                          value={formData.emergencyAlert?.level || 'urgente'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              emergencyAlert: {
                                ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
                                level: e.target.value
                              }
                            });
                          }}
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="urgente">🔴 URGENTE (Rojo / Peligro Inmediato)</option>
                          <option value="precaucion">🟡 PRECAUCIÓN (Ámbar / Alerta Vial / Clima)</option>
                          <option value="informativo">🔵 INFORMATIVO (Azul / Corte Programado o Servicios)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Organismo / Fuente Oficial</label>
                        <input
                          type="text"
                          value={formData.emergencyAlert?.source || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              emergencyAlert: {
                                ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
                                source: e.target.value
                              }
                            });
                          }}
                          placeholder="Ej: SENAPRED / Carabineros / Capitanía de Puerto"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Título de la Alerta (Encabezado)</label>
                        <input
                          type="text"
                          value={formData.emergencyAlert?.title || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              emergencyAlert: {
                                ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
                                title: e.target.value
                              }
                            });
                          }}
                          placeholder="Ej: CADENA RADIAL DE EMERGENCIA - ALERTA COSTERA"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Mensaje e Instrucciones a la Comunidad</label>
                        <textarea
                          rows={3}
                          value={formData.emergencyAlert?.message || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              emergencyAlert: {
                                ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
                                message: e.target.value
                              }
                            });
                          }}
                          placeholder="Escribe el mensaje claro y las recomendaciones para los habitantes de Tirúa, Quidico e Isla Mocha..."
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl p-3 text-white leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Tiempo / Hora de Actualización</label>
                        <input
                          type="text"
                          value={formData.emergencyAlert?.updatedAt || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              emergencyAlert: {
                                ...(formData.emergencyAlert || RADIO_CONFIG.emergencyAlert),
                                updatedAt: e.target.value
                              }
                            });
                          }}
                          placeholder="Ej: Hace instantes / 15:30 hrs"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#a8c8ff]/15">
                        <span className="text-[11px] text-[#a5e7ff]">
                          💡 Puedes redactar un comunicado propio y emitirlo inmediatamente a todos los oyentes:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEmitEmergencyNow()}
                          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-['Oswald',sans-serif] font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                        >
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          <span>Emitir Este Comunicado al Aire Ahora</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vista Previa de Cómo se Ve en Vivo */}
                  <div className="bg-[#112036]/60 p-5 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-eye text-[#00d2ff]"></i> Vista Previa en Vivo del Banner
                    </h5>
                    <div className={`rounded-xl overflow-hidden border p-4 ${
                      formData.emergencyAlert?.level === 'urgente' 
                        ? 'border-rose-400 bg-gradient-to-r from-red-950 via-rose-900 to-red-950'
                        : formData.emergencyAlert?.level === 'precaucion'
                        ? 'border-amber-400 bg-gradient-to-r from-amber-950 via-orange-950 to-amber-950'
                        : 'border-[#00d2ff] bg-gradient-to-r from-sky-950 via-blue-900 to-sky-950'
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          formData.emergencyAlert?.level === 'urgente' ? 'bg-rose-500 text-white' :
                          formData.emergencyAlert?.level === 'precaucion' ? 'bg-amber-400 text-slate-950' :
                          'bg-[#00d2ff] text-[#002955]'
                        }`}>
                          {formData.emergencyAlert?.level?.toUpperCase() || 'URGENTE'}
                        </span>
                        <span className="text-[11px] text-white/80">
                          {formData.emergencyAlert?.source || 'Fuente Oficial'}
                        </span>
                      </div>
                      <h4 className="font-['Anton',sans-serif] text-white text-base uppercase">
                        {formData.emergencyAlert?.title || 'Título de Alerta'}
                      </h4>
                      <p className="text-xs text-white/90 mt-1">
                        {formData.emergencyAlert?.message || 'Mensaje de alerta a la comunidad'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PARRILLA DE PROGRAMACIÓN */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#c0c6d6]">
                      Configura los programas que aparecen en la parrilla semanal y en la tarjeta "Al Aire Ahora".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newProg = {
                          id: `prog-${Date.now()}`,
                          title: "Nuevo Programa",
                          host: "Nombre del Locutor",
                          time: "10:00 - 12:00",
                          startHour: 10,
                          endHour: 12,
                          days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
                          category: "Variedades",
                          description: "Descripción del programa radial.",
                          tag: "En Vivo"
                        };
                        setFormData({ ...formData, schedule: [...(formData.schedule || []), newProg] });
                      }}
                      className="bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wide flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <i className="fa-solid fa-plus"></i> Agregar Programa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.schedule?.map((prog, index) => (
                      <div key={prog.id || index} className="bg-[#112036]/70 border border-[#a8c8ff]/20 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#a8c8ff]/10 pb-2">
                          <span className="font-['Anton',sans-serif] uppercase tracking-wide text-white text-sm">
                            Programa #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.schedule.filter((_, i) => i !== index);
                              setFormData({ ...formData, schedule: updated });
                            }}
                            className="text-[#ffb4ab] hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can"></i> Eliminar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Título del Programa</label>
                            <input
                              type="text"
                              value={prog.title || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].title = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Conductor / Locutor</label>
                            <input
                              type="text"
                              value={prog.host || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].host = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Horario Visible</label>
                            <input
                              type="text"
                              value={prog.time || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].time = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Hora Inicio (ej: 9)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={prog.startHour ?? 9}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].startHour = parseFloat(e.target.value);
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Hora Fin (ej: 13)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={prog.endHour ?? 13}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].endHour = parseFloat(e.target.value);
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Categoría</label>
                            <input
                              type="text"
                              value={prog.category || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].category = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Dial / Frecuencia</label>
                            <input
                              type="text"
                              placeholder="91.3 FM / 105.1 FM"
                              value={prog.dial || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].dial = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Días (separados por coma)</label>
                            <input
                              type="text"
                              placeholder="Lunes, Martes, Miércoles..."
                              value={Array.isArray(prog.days) ? prog.days.join(', ') : (prog.days || '')}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].days = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div className={prog.image ? "sm:col-span-2" : "sm:col-span-3"}>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">URL de Afiche / Imagen Oficial</label>
                            <input
                              type="text"
                              placeholder="/images/noticias-puerto-quidico.png"
                              value={prog.image || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].image = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          {prog.image && (
                            <div className="flex items-center gap-3 bg-[#010e24] p-2 rounded-xl border border-[#a8c8ff]/20">
                              <img src={prog.image} alt="Vista previa afiche" className="w-10 h-10 rounded-lg object-cover border border-[#00d2ff]/40 shrink-0" />
                              <span className="text-[10px] text-emerald-400 font-semibold truncate">✓ Afiche listo</span>
                            </div>
                          )}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Descripción breve</label>
                            <input
                              type="text"
                              value={prog.description || ''}
                              onChange={(e) => {
                                const updated = [...formData.schedule];
                                updated[index].description = e.target.value;
                                setFormData({ ...formData, schedule: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB MARÍTIMO: ESTADO DE PUERTO Y MAREAS */}
              {activeTab === 'maritime' && (
                <div className="space-y-5">
                  {/* Tarjeta de Conexión Satelital en Vivo para Quidico */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#003543]/80 via-[#071933] to-[#010e24] border border-[#00d2ff]/40 shadow-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-[10px] font-bold uppercase mb-1">
                          <i className="fa-solid fa-satellite-dish text-[9px]"></i> Red Oceanográfica Satelital en Vivo
                        </div>
                        <h4 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                          <i className="fa-solid fa-compass text-[#00d2ff]"></i> Datos Marítimos de Caleta Quidico & Tirúa
                        </h4>
                        <p className="text-xs text-[#c0c6d6] mt-0.5">
                          Coordenadas oficiales: <span className="font-mono text-[#a5e7ff]">Lat: -38.243° S, Lon: -73.492° O</span> • Boyas del Pacífico y Satélites ECMWF / Open-Meteo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRefreshMaritime}
                        disabled={isUpdatingMaritime}
                        className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Oswald',sans-serif] font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-[#00d2ff]/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                      >
                        <i className={`fa-solid fa-rotate ${isUpdatingMaritime ? 'fa-spin' : ''}`}></i>
                        <span>{isUpdatingMaritime ? 'Consultando Satélite...' : 'Sincronizar Satélite en Vivo'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#a8c8ff]/15 text-xs">
                      <div className="bg-[#010e24]/70 p-2.5 rounded-xl border border-[#a8c8ff]/10">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Oleaje Satelital</span>
                        <span className="text-white font-bold text-sm text-[#00d2ff]">{formData.maritimeWeather?.waveHeight || '1.5 m'}</span>
                      </div>
                      <div className="bg-[#010e24]/70 p-2.5 rounded-xl border border-[#a8c8ff]/10">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Viento Costero</span>
                        <span className="text-white font-bold text-sm text-amber-300">{formData.maritimeWeather?.windSpeed || '10 Nudos'}</span>
                      </div>
                      <div className="bg-[#010e24]/70 p-2.5 rounded-xl border border-[#a8c8ff]/10">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Temp. Aire</span>
                        <span className="text-white font-bold text-sm">{formData.maritimeWeather?.airTemp || '16°C'}</span>
                      </div>
                      <div className="bg-[#010e24]/70 p-2.5 rounded-xl border border-[#a8c8ff]/10">
                        <span className="text-[10px] uppercase text-[#8a919f] font-bold block">Fase Lunar</span>
                        <span className="text-white font-bold text-sm text-cyan-300">{formData.maritimeWeather?.lunarPhase || 'Astronómica'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-anchor text-[#00d2ff]"></i> Semáforo de Puerto (Capitanía)
                    </h4>
                    
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-2 font-semibold">
                        Estado Actual de Puerto Quidico / Tirúa
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { status: 'ABIERTO', label: 'Puerto Abierto', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
                          { status: 'PRECAUCIÓN', label: 'Precaución', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                          { status: 'CERRADO', label: 'Puerto Cerrado', color: 'border-rose-500 bg-rose-950/40 text-rose-300' },
                        ].map((item) => (
                          <button
                            key={item.status}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                maritimeWeather: {
                                  ...(formData.maritimeWeather || {}),
                                  portStatus: item.status,
                                  portStatusDetail: item.status === 'ABIERTO' 
                                    ? 'Abierto para embarcaciones menores dentro y fuera de la bahía'
                                    : item.status === 'PRECAUCIÓN'
                                    ? 'Precaución por oleaje moderado en barra de Quidico'
                                    : 'Suspendido para naves menores por marejadas'
                                }
                              });
                            }}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              (formData.maritimeWeather?.portStatus || 'ABIERTO') === item.status
                                ? `${item.color} shadow-lg ring-2 ring-white/20`
                                : 'border-[#a8c8ff]/20 bg-[#010e24] text-[#8a919f] hover:text-white'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${
                              item.status === 'ABIERTO' ? 'bg-emerald-400' : item.status === 'PRECAUCIÓN' ? 'bg-amber-400' : 'bg-rose-500'
                            }`} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                        Detalle del Estado de Puerto
                      </label>
                      <input
                        type="text"
                        value={formData.maritimeWeather?.portStatusDetail || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          maritimeWeather: {
                            ...(formData.maritimeWeather || {}),
                            portStatusDetail: e.target.value
                          }
                        })}
                        placeholder="Ej: Abierto para embarcaciones menores dentro y fuera de la bahía"
                        className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-water text-[#00d2ff]"></i> Ciclo de Mareas en Quidico
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Próxima Pleamar (Marea Alta)
                        </label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.highTide || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: {
                              ...(formData.maritimeWeather || {}),
                              highTide: e.target.value
                            }
                          })}
                          placeholder="Ej: 14:20 hrs (1.6m)"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                          Próxima Bajamar (Marea Baja)
                        </label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.lowTide || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: {
                              ...(formData.maritimeWeather || {}),
                              lowTide: e.target.value
                            }
                          })}
                          placeholder="Ej: 20:45 hrs (0.4m)"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-wind text-[#00d2ff]"></i> Viento, Oleaje y Temperaturas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Velocidad del Viento</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.windSpeed || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), windSpeed: e.target.value }
                          })}
                          placeholder="Ej: 12 Nudos"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Dirección del Viento</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.windDirection || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), windDirection: e.target.value }
                          })}
                          placeholder="Ej: Sur-Suroeste (SSO)"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Altura del Oleaje</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.waveHeight || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), waveHeight: e.target.value }
                          })}
                          placeholder="Ej: 1.8 m"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Temperatura Aire</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.airTemp || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), airTemp: e.target.value }
                          })}
                          placeholder="Ej: 17°C"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Temperatura Agua</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.waterTemp || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), waterTemp: e.target.value }
                          })}
                          placeholder="Ej: 13°C"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-semibold">Fase Lunar</label>
                        <input
                          type="text"
                          value={formData.maritimeWeather?.lunarPhase || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: { ...(formData.maritimeWeather || {}), lunarPhase: e.target.value }
                          })}
                          placeholder="Ej: Cuarto Creciente"
                          className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                        Aviso o Recomendación a Pescadores / Recolectoras
                      </label>
                      <textarea
                        rows={2}
                        value={formData.maritimeWeather?.advisory || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          maritimeWeather: {
                            ...(formData.maritimeWeather || {}),
                            advisory: e.target.value
                          }
                        })}
                        placeholder="Ej: Condiciones favorables para faenas de pesca artesanal..."
                        className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
                        Timestamp o Fuente
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.maritimeWeather?.updatedAt || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            maritimeWeather: {
                              ...(formData.maritimeWeather || {}),
                              updatedAt: e.target.value
                            }
                          })}
                          className="flex-1 bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            setFormData({
                              ...formData,
                              maritimeWeather: {
                                ...(formData.maritimeWeather || {}),
                                updatedAt: `Hoy ${timeStr} hrs • Capitanía de Puerto`
                              }
                            });
                          }}
                          className="bg-[#1c2a41] hover:bg-[#2c3951] text-xs font-bold text-[#00d2ff] px-3 rounded-xl border border-[#a8c8ff]/30 cursor-pointer"
                        >
                          Hora Actual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* TAB 4: AVISOS A LA COMUNIDAD */}
              {activeTab === 'notices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#c0c6d6]">
                      Avisos de utilidad pública, rondas médicas, juntas de vecinos y avisos marítimos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newNotice = {
                          id: `aviso-${Date.now()}`,
                          urgent: false,
                          title: "Nuevo Aviso a la Comunidad",
                          date: "Esta semana",
                          content: "Escribe aquí la información importante para los vecinos de Quidico y Tirúa."
                        };
                        setFormData({ ...formData, communityNotices: [...(formData.communityNotices || []), newNotice] });
                      }}
                      className="bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wide flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <i className="fa-solid fa-plus"></i> Agregar Aviso
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.communityNotices?.map((aviso, index) => (
                      <div key={aviso.id || index} className="bg-[#112036]/70 border border-[#a8c8ff]/20 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#a8c8ff]/10 pb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!aviso.urgent}
                              onChange={(e) => {
                                const updated = [...formData.communityNotices];
                                updated[index].urgent = e.target.checked;
                                setFormData({ ...formData, communityNotices: updated });
                              }}
                              className="accent-[#ff5449] w-4 h-4 cursor-pointer"
                            />
                            <span className={`text-[11px] font-bold uppercase ${aviso.urgent ? 'text-[#ffb4ab]' : 'text-[#c0c6d6]'}`}>
                              {aviso.urgent ? '🚨 Aviso Prioritario / Urgente' : 'Aviso Normal'}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.communityNotices.filter((_, i) => i !== index);
                              setFormData({ ...formData, communityNotices: updated });
                            }}
                            className="text-[#ffb4ab] hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can"></i> Eliminar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Título del Aviso</label>
                            <input
                              type="text"
                              value={aviso.title || ''}
                              onChange={(e) => {
                                const updated = [...formData.communityNotices];
                                updated[index].title = e.target.value;
                                setFormData({ ...formData, communityNotices: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Fecha / Convocatoria</label>
                            <input
                              type="text"
                              value={aviso.date || ''}
                              onChange={(e) => {
                                const updated = [...formData.communityNotices];
                                updated[index].date = e.target.value;
                                setFormData({ ...formData, communityNotices: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Contenido del Aviso</label>
                            <textarea
                              rows={2}
                              value={aviso.content || ''}
                              onChange={(e) => {
                                const updated = [...formData.communityNotices];
                                updated[index].content = e.target.value;
                                setFormData({ ...formData, communityNotices: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: AUSPICIADORES & COMERCIO */}
              {activeTab === 'sponsors' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-solid fa-handshake text-[#00d2ff]"></i> Gestión de Auspiciadores & Métricas
                      </h4>
                      <p className="text-xs text-[#c0c6d6] mt-0.5">
                        Administra las marcas comerciales de Tirúa y Quidico que apoyan a la radio y emite sus comprobantes de impacto.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadAllSponsorsReport}
                        className="bg-[#1c2a41] hover:bg-[#2c3951] text-white border border-[#a8c8ff]/25 px-3 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow cursor-pointer"
                        title="Descargar informe completo de todos los clientes en archivo de texto"
                      >
                        <i className="fa-solid fa-file-invoice text-emerald-400"></i>
                        <span>Descargar Balance TXT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newSponsor = {
                            id: `sponsor-${Date.now()}`,
                            name: "Nuevo Auspiciador Comercial",
                            tagline: "Servicios y Productos Locales",
                            description: "Descripción comercial del negocio y sus beneficios para la comunidad.",
                            phone: "+569 6267 9087",
                            whatsappUrl: "https://wa.me/56962679087",
                            instagramUrl: "https://www.instagram.com/",
                            image: "/images/originales_blog/auspiciador-don-nica.jpg",
                            category: "Comercio Local",
                            tags: ["Atención Personalizada", "Calidad Garantizada"],
                            clicks: 0
                          };
                          setFormData({
                            ...formData,
                            sponsors: [...(formData.sponsors || []), newSponsor]
                          });
                          showToast("➕ Nuevo auspiciador agregado a la lista");
                        }}
                        className="bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] font-bold uppercase text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
                      >
                        <i className="fa-solid fa-plus"></i> Agregar Auspiciador
                      </button>
                    </div>
                  </div>

                  {/* Resumen Comercial & Métricas Generales */}
                  <div className="bg-[#112036]/80 p-4 rounded-2xl border border-[#00d2ff]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center text-lg">
                        <i className="fa-solid fa-chart-line"></i>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs uppercase">
                          Balance Comercial & Pautas Publicitarias
                        </h5>
                        <p className="text-[11px] text-[#c0c6d6]">
                          {formData.sponsors?.length || 0} auspiciadores activos • {formData.sponsors?.reduce((acc, s) => acc + (s.clicks || 0), 0) || 0} contactos y clics acumulados
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.sponsors?.map((sp, index) => (
                      <div key={sp.id || index} className="bg-[#112036]/70 border border-[#a8c8ff]/20 rounded-2xl p-4 sm:p-5 space-y-4">
                        {/* Header Auspiciador con métricas de clic y acciones comerciales */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#a8c8ff]/15 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#00d2ff]/20 text-[#00d2ff] font-bold flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span className="font-bold text-white uppercase text-sm">
                              {sp.name || 'Sin Nombre'}
                            </span>
                            <span className="text-[10px] bg-[#1c2a41] text-[#a5e7ff] px-2 py-0.5 rounded-full font-bold uppercase">
                              {sp.category || 'General'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                              <i className="fa-solid fa-chart-simple text-xs"></i>
                              {sp.clicks || 0} clics
                            </span>

                            {/* Botón Comprobante WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleSendSponsorWhatsAppReport(sp)}
                              className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] uppercase font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                              title="Enviar comprobante formal de clics al WhatsApp del cliente"
                            >
                              <i className="fa-brands fa-whatsapp"></i>
                              <span>Comprobante WA</span>
                            </button>

                            {/* Botón Copiar Reporte */}
                            <button
                              type="button"
                              onClick={() => handleCopySponsorReport(sp)}
                              className="bg-[#1c2a41] hover:bg-[#2c3951] text-[#a5e7ff] text-[10px] uppercase font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-[#a8c8ff]/20"
                              title="Copiar texto formal de pauta"
                            >
                              <i className="fa-solid fa-copy"></i>
                              <span>Copiar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.sponsors];
                                updated[index].clicks = 0;
                                setFormData({ ...formData, sponsors: updated });
                                showToast(`🔄 Contador de clics reiniciado para ${sp.name}`);
                              }}
                              className="text-[10px] text-[#8a919f] hover:text-white transition-colors cursor-pointer px-1.5 py-1"
                              title="Reiniciar contador de clics a 0"
                            >
                              Reiniciar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (formData.sponsors.length <= 1) {
                                  alert("Debe quedar al menos un auspiciador registrado.");
                                  return;
                                }
                                const updated = formData.sponsors.filter((_, i) => i !== index);
                                setFormData({ ...formData, sponsors: updated });
                                showToast(`🗑️ Auspiciador eliminado`);
                              }}
                              className="text-[#ffb4ab] hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer ml-1"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>

                        {/* Campos de Edición */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Nombre del Negocio</label>
                            <input
                              type="text"
                              value={sp.name || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].name = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Categoría o Giro</label>
                            <input
                              type="text"
                              value={sp.category || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].category = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              placeholder="Ej: Productos del Mar, Ferretería, Cabañas"
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Teléfono / WhatsApp</label>
                            <input
                              type="text"
                              value={sp.phone || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].phone = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Eslogan / Frase Promocional</label>
                            <input
                              type="text"
                              value={sp.tagline || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].tagline = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Ruta Imagen / Afiche</label>
                            <input
                              type="text"
                              value={sp.image || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].image = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-[10px] uppercase text-[#a5e7ff] mb-1 font-bold">Descripción Completa</label>
                            <textarea
                              rows={2}
                              value={sp.description || ''}
                              onChange={(e) => {
                                const updated = [...formData.sponsors];
                                updated[index].description = e.target.value;
                                setFormData({ ...formData, sponsors: updated });
                              }}
                              className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: RESPALDOS, PIN Y SEGURIDAD */}
              {activeTab === 'backup' && (
                <div className="space-y-5">
                  {/* Descarga y Copia de Respaldo */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-cloud-arrow-down text-[#00d2ff]"></i> Exportar y Guardar Respaldo
                    </h4>
                    <p className="text-xs text-[#c0c6d6]">
                      Descarga una copia completa de toda la configuración para tener un respaldo seguro o para enviársela al desarrollador web.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="bg-[#00d2ff] hover:bg-[#a5e7ff] text-[#003543] font-bold text-xs uppercase px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow"
                      >
                        <i className="fa-solid fa-download"></i> Descargar archivo JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyBackup}
                        className="bg-[#1c2a41] hover:bg-[#2c3951] text-white font-bold text-xs uppercase px-4 py-2 rounded-xl border border-[#a8c8ff]/30 flex items-center gap-2 cursor-pointer shadow"
                      >
                        <i className="fa-solid fa-copy"></i> Copiar Código JSON
                      </button>
                    </div>
                  </div>

                  {/* Importar Respaldo */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-file-import text-[#00d2ff]"></i> Importar Respaldo JSON
                    </h4>
                    <textarea
                      rows={3}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Pega aquí el código JSON para restaurar tu configuración previa..."
                      className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl p-2.5 text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleImportJson}
                      className="bg-[#3491ff] hover:bg-[#00d2ff] text-white hover:text-[#002955] font-bold text-xs uppercase px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow"
                    >
                      <i className="fa-solid fa-check"></i> Cargar e Importar
                    </button>
                  </div>

                  {/* Sincronización en la Nube y Alertas en Tiempo Real */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-solid fa-tower-broadcast text-[#00d2ff]"></i> Sincronización en la Nube (Alertas y Programación)
                      </h4>
                      <div className="flex items-center gap-2">
                        {syncStatus === 'syncing' && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-arrows-rotate fa-spin"></i> Sincronizando...
                          </span>
                        )}
                        {syncStatus === 'synced' && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-check"></i> Sincronizado {lastSyncTime ? `(${lastSyncTime})` : ''}
                          </span>
                        )}
                        {syncStatus === 'error' && (
                          <span className="text-[10px] text-[#8a919f] flex items-center gap-1">
                            <i className="fa-solid fa-circle-info"></i> Modo Local Activo
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#c0c6d6]">
                      Permite que las alertas de emergencia comunal y cambios de transmisión se distribuyan a todos los teléfonos y oyentes en tiempo real a través de un archivo JSON remoto o webhook.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase text-[#a5e7ff] font-bold">
                        URL de Sincronización Remota (Endpoint JSON o Webhook)
                      </label>
                      <input
                        type="text"
                        value={formData.remoteSyncUrl || ''}
                        onChange={(e) => setFormData({ ...formData, remoteSyncUrl: e.target.value })}
                        placeholder="Predeterminado: /radio-remote-config.json (o URL de Firebase / Servidor)"
                        className="w-full bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePushCloudNow}
                        disabled={isPushingCloud}
                        className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-bold text-xs uppercase px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00d2ff]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <i className={`fa-solid fa-cloud-arrow-up ${isPushingCloud ? 'animate-bounce' : ''}`}></i>
                        <span>{isPushingCloud ? 'Distribuyendo a la Nube...' : '🚀 Publicar Cambios a la Nube / Oyentes Ahora'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSync}
                        className="bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#00d2ff] hover:text-white border border-[#00d2ff]/40 font-bold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all"
                      >
                        <i className="fa-solid fa-rotate"></i> Probar Descarga desde la Nube
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadRemoteJson}
                        className="bg-[#1c2a41] hover:bg-[#2c3951] text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl border border-[#a8c8ff]/30 flex items-center gap-2 cursor-pointer shadow transition-all"
                      >
                        <i className="fa-solid fa-file-arrow-down text-emerald-400"></i> Descargar radio-remote-config.json
                      </button>
                    </div>
                  </div>

                  {/* Cambiar PIN */}
                  <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-key text-[#f6bf22]"></i> Cambiar PIN de Acceso
                    </h4>
                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="password"
                        maxLength={8}
                        value={newPinValue}
                        onChange={(e) => setNewPinValue(e.target.value)}
                        placeholder="Nuevo PIN (ej: 2026)"
                        className="flex-1 bg-[#010e24] border border-[#a8c8ff]/20 rounded-xl px-3 py-1.5 text-white text-center font-mono"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (newPinValue.length >= 4) {
                            await updatePin(newPinValue);
                            setNewPinValue('');
                            showToast('🔑 PIN actualizado y resguardado con cifrado seguro');
                          } else {
                            showToast('⚠️ El PIN debe tener al menos 4 caracteres');
                          }
                        }}
                        className="bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] font-bold text-xs uppercase px-4 py-1.5 rounded-xl cursor-pointer"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Restaurar Fábrica */}
                  <div className="pt-2 border-t border-[#a8c8ff]/15">
                    <button
                      type="button"
                      onClick={handleResetToFactory}
                      className="text-[#ffb4ab] hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-rotate-left"></i> Restaurar todos los valores de fábrica iniciales
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: MANUAL DE ENTREGA Y OPERACIÓN */}
              {activeTab === 'manual' && (
                <div className="space-y-6">
                  {/* Encabezado del Manual */}
                  <div className="bg-gradient-to-r from-[#003543]/70 via-[#112036] to-[#010e24] p-5 rounded-2xl border border-[#00d2ff]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-[10px] font-bold uppercase mb-1">
                        <i className="fa-solid fa-certificate text-[9px]"></i> Sistema Oficial de Entrega 2026
                      </div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <i className="fa-solid fa-book-open text-[#00d2ff]"></i> Manual de Operación para el Propietario
                      </h4>
                      <p className="text-xs text-[#a5e7ff] mt-0.5">
                        Guía de referencia rápida para operar la radio, gestionar auspiciadores y activar emergencias comunales.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadOwnerManual}
                      className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Oswald',sans-serif] font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <i className="fa-solid fa-file-arrow-down text-sm"></i>
                      <span>Descargar Manual (.txt)</span>
                    </button>
                  </div>

                  {/* Tarjetas de Guía Paso a Paso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta 1: Acceso y Seguridad */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-[#3491ff]/20 text-[#00d2ff] flex items-center justify-center text-xs">
                          1
                        </div>
                        <span>🔐 Acceso Seguro & Atajos de Cabina</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Protección Criptográfica:</strong> Resguardado con hash seguro SHA-256. Puedes actualizar tu PIN en la pestaña "Respaldos & PIN".</li>
                        <li><strong>Atajo Rápido:</strong> Presiona <kbd className="bg-[#010e24] px-1.5 py-0.5 rounded text-white border border-white/20">Alt + A</kbd> o <kbd className="bg-[#010e24] px-1.5 py-0.5 rounded text-white border border-white/20">Ctrl + Shift + A</kbd> desde cualquier lugar.</li>
                        <li><strong>Pie de Página:</strong> Clic en el botón con candado "Panel Emisora".</li>
                      </ul>
                    </div>

                    {/* Tarjeta 2: Señal de Audio Streaming */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-[#3491ff]/20 text-[#00d2ff] flex items-center justify-center text-xs">
                          2
                        </div>
                        <span>📻 Streaming de Audio HD & ECO</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Servidores Compatibles:</strong> Icecast, Shoutcast, SonicPanel o Zenofm.</li>
                        <li><strong>Detalle Clave:</strong> Si tu servidor es Shoutcast o SonicPanel, incluye siempre el punto y coma <code>;</code> al final de la URL.</li>
                        <li><strong>Selector HD vs ECO:</strong> Tus auditores pueden elegir entre 128 kbps (estéreo fiel) y 64 kbps (ahorro del 50% de datos en caminos o mar).</li>
                      </ul>
                    </div>

                    {/* Tarjeta 3: Cadena de Emergencia */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                          3
                        </div>
                        <span>🚨 Cadena Radial de Emergencia</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Activación en 1 Clic:</strong> Ve a la pestaña "Cadena de Emergencia" y pulsa cualquiera de las 4 plantillas oficiales (Marejadas, Corte de Ruta, Corte Eléctrico o Temporal).</li>
                        <li><strong>Aviso Inmediato:</strong> Aparece de inmediato una barra fija roja/ámbar con sirena parpadeante al tope de la web para todos los auditores.</li>
                        <li><strong>Desactivar:</strong> Basta con mover el interruptor a "DESACTIVADA" y pulsar Guardar Cambios.</li>
                      </ul>
                    </div>

                    {/* Tarjeta 4: Canción y Tema al Aire */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                          4
                        </div>
                        <span>🎵 Canción y Metadatos en Vivo</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Pestaña "Al Aire & Música":</strong> Actualiza la canción sonando, locutor y género musical.</li>
                        <li><strong>Botones de 1 Clic:</strong> Activa transmisiones temáticas como "Música Continuada", "Cumbia Ranchera", etc.</li>
                        <li><strong>Interacción:</strong> Los auditores tienen botones directos para buscar el videoclip o dedicar la canción por WhatsApp.</li>
                      </ul>
                    </div>

                    {/* Tarjeta 5: Auspiciadores y Métricas */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                          5
                        </div>
                        <span>💼 Auspiciadores & Métricas de Clics</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Métricas Reales:</strong> En la pestaña "Auspiciadores", el sistema cuenta automáticamente cuántos clics recibe cada empresa local.</li>
                        <li><strong>Comprobante para Clientes:</strong> Muestra estas métricas a tus clientes para comprobar la efectividad de la pauta publicitaria.</li>
                        <li><strong>Tarifario:</strong> El tarifario comercial interactivo permite que nuevos comerciantes coticen por WhatsApp en segundos.</li>
                      </ul>
                    </div>

                    {/* Tarjeta 6: App PWA y Micrófono */}
                    <div className="bg-[#112036]/60 p-4 rounded-2xl border border-[#a8c8ff]/15 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                          6
                        </div>
                        <span>📲 App Móvil PWA & Notas de Voz</span>
                      </div>
                      <ul className="text-xs text-[#c0c6d6] space-y-1.5 pl-8 list-disc">
                        <li><strong>Instalar App:</strong> Los oyentes pueden pulsar "Instalar App" para tener el logo de Radio Quidico directamente en su pantalla de inicio.</li>
                        <li><strong>Micrófono Abierto:</strong> Los vecinos pueden grabar audios de hasta 60 segundos con visualizador y enviártelos por WhatsApp para salir al aire.</li>
                        <li><strong>Respaldos:</strong> Descarga siempre un archivo JSON en "Respaldos & PIN" para no perder ninguna modificación.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Pie de Firma de Entrega */}
                  <div className="p-4 rounded-xl bg-[#010e24] border border-[#00d2ff]/20 flex items-center justify-between text-xs text-[#a5e7ff]">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-400"></i>
                      <span>Plataforma 100% optimizada, configurada y lista para operación comercial continua.</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-75">v2.0 • Edición Costera Azul</span>
                  </div>
                </div>
              )}

            </div>

            {/* Barra Inferior con Botón Guardar */}
            <div className="bg-[#010e24] px-6 py-4 border-t border-[#a8c8ff]/15 flex items-center justify-between">
              <span className="text-[11px] text-[#8a919f]">
                Tus cambios se guardan localmente de inmediato en tu navegador.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs uppercase font-bold text-[#c0c6d6] hover:text-white transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Inter',sans-serif] font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,210,255,0.4)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i> Guardar Cambios
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
