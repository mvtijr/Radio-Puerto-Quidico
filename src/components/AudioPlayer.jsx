import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { getCurrentShow } from '../utils/timeUtils';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useOnAirMetadata } from '../hooks/useOnAirMetadata';

export const AudioPlayer = ({ onOpenRequestModal, onOpenSongHistory, onOpenSleepTimer, onOpenCarMode }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const {
    playbackMode,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    currentPodcast,
    podcastProgress,
    streamError,
    isReconnecting,
    retryCount,
    isNetworkOffline,
    activeServer,
    switchServer,
    isFailoverActive,
    reconnectStream,
    audioQuality,
    setAudioQuality,
    qualityToast,
    togglePlayLive,
    switchToLive,
    handleVolumeChange,
    toggleMute,
    sleepTimerMinutes,
    sleepTimerRemaining
  } = useAudio();

  const { song, artist, show, host, broadcastMode, searchYouTube, dedicateOnWhatsApp } = useOnAirMetadata();

  const [currentShow] = useState(getCurrentShow());
  const [selectedFreq, setSelectedFreq] = useState('105.1');

  const displayTitle = playbackMode === 'podcast' && currentPodcast
    ? currentPodcast.title
    : `${song} - ${artist}`;

  const displaySubtitle = playbackMode === 'podcast' && currentPodcast
    ? `Podcast Especial • ${currentPodcast.category}`
    : `${show} • Conduce: ${host}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Radio Puerto Quidico 105.1 FM',
        text: '¡Escucha en vivo Radio Puerto Quidico 105.1 FM, la voz de Tirúa y la costa!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace de Radio Puerto Quidico copiado al portapapeles!');
    }
  };

  return (
    <section 
      id="player" 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#010e24]/92 backdrop-blur-xl border-t border-[#a8c8ff]/12 py-3 px-4 sm:px-6 md:px-10 shadow-[0_-4px_30px_rgba(0,0,0,0.7)] pb-safe"
      data-purpose="sticky-live-player"
    >
      {/* Barra de progreso si está sonando un podcast */}
      {playbackMode === 'podcast' && (
        <div className="w-full bg-[#071933] h-1 mb-2">
          <div 
            className="bg-[#00d2ff] h-1 transition-all duration-300"
            style={{ width: `${podcastProgress}%` }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          
          {/* Lado Izquierdo: Metadatos del Programa */}
          <div className="md:col-span-4 flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-lg ring-2 ring-[#00d2ff]/50 overflow-hidden">
                <img
                  src={playbackMode === 'podcast' && currentPodcast?.cover ? currentPodcast.cover : (currentConfig.branding?.logo || RADIO_CONFIG.branding.logo)}
                  alt={currentConfig.station?.name || "Radio Puerto Quidico"}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#00d2ff] text-[#002955] font-['Montserrat',sans-serif] font-black text-[9px] px-1.5 py-0.2 rounded-full border border-[#010e24] shadow">
                {selectedFreq}
              </span>
              <span className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-[#010e24] rounded-full ${
                isPlaying ? 'bg-[#00d2ff] animate-pulse' : 'bg-slate-600'
              }`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full text-[#00d2ff] font-['Montserrat',sans-serif]">
                  {playbackMode === 'live' ? broadcastMode : 'PODCAST GRABADO'}
                </span>
                
                {playbackMode === 'live' ? (
                  <>
                    {!isReconnecting && !streamError && (
                      <span className="text-[10px] text-emerald-400 font-['Montserrat',sans-serif] uppercase font-bold tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Al Aire
                      </span>
                    )}
                    {isFailoverActive && !isReconnecting && (
                      <button
                        type="button"
                        onClick={() => switchServer('primary')}
                        title="Transmitiendo en Servidor de Respaldo (SonicPanel). Clic para volver a Principal"
                        className="text-[9px] text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.2 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer animate-pulse hover:bg-amber-500/30"
                      >
                        <i className="fa-solid fa-shield-halved text-[9px] text-amber-400"></i>
                        <span>Respaldo</span>
                      </button>
                    )}
                    {isReconnecting && (
                      <span className="text-[10px] text-amber-400 font-['Montserrat',sans-serif] uppercase font-bold tracking-wider flex items-center gap-1 bg-amber-400/10 px-2 py-0.2 rounded-full border border-amber-400/30 animate-pulse">
                        <i className="fa-solid fa-arrows-rotate fa-spin text-[9px]"></i>
                        Reconectando {retryCount > 0 ? `(${retryCount}/3)` : ''}
                      </span>
                    )}
                    {isNetworkOffline && (
                      <span className="text-[10px] text-rose-400 font-['Montserrat',sans-serif] uppercase font-bold tracking-wider flex items-center gap-1 bg-rose-500/10 px-2 py-0.2 rounded-full border border-rose-500/30">
                        <i className="fa-solid fa-wifi-slash text-[9px]"></i>
                        Sin Red Móvil
                      </span>
                    )}
                    {streamError && !isReconnecting && (
                      <button
                        onClick={reconnectStream}
                        className="text-[10px] text-rose-300 hover:text-white font-['Montserrat',sans-serif] font-bold flex items-center gap-1 bg-rose-500/20 px-2 py-0.2 rounded-full border border-rose-500/40 cursor-pointer animate-pulse"
                      >
                        <i className="fa-solid fa-rotate-right text-[9px]"></i>
                        Reintentar Señal
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={switchToLive}
                    className="text-[10px] text-[#f6bf22] hover:text-white font-['Montserrat',sans-serif] font-bold flex items-center gap-1 cursor-pointer bg-[#f6bf22]/15 px-2 py-0.2 rounded-full border border-[#f6bf22]/30"
                  >
                    <i className="fa-solid fa-radio text-[9px]"></i>
                    Volver a Señal en Vivo
                  </button>
                )}

                <span className="text-[10px] text-[#8a919f] hidden sm:inline">• {audioQuality === 'ECO' ? 'ECO 64k' : 'HD 128k'}</span>
              </div>
              
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 font-['Montserrat',sans-serif] truncate">
                {displayTitle}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[#c0c6d6] font-['Inter',sans-serif]">
                <p className="truncate text-[11px]">
                  {displaySubtitle}
                </p>

                {/* Atajos de Clip en YouTube, Dedicar y Ver Historial */}
                {playbackMode === 'live' && (
                  <div className="hidden lg:flex items-center gap-1.5 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={() => onOpenSongHistory && onOpenSongHistory()}
                      title="Ver qué canciones sonaron recientemente"
                      className="text-[#00d2ff] hover:text-white hover:bg-[#00d2ff]/20 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-[#00d2ff]/30"
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span>¿Qué sonó?</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => searchYouTube()}
                      title="Buscar clip oficial en YouTube"
                      className="text-red-400 hover:text-white hover:bg-rose-600/30 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-rose-500/20"
                    >
                      <i className="fa-brands fa-youtube"></i>
                      <span>Clip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => dedicateOnWhatsApp()}
                      title="Dedicar este tema por WhatsApp"
                      className="text-[#f6bf22] hover:text-white hover:bg-amber-600/30 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-[#f6bf22]/20"
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                      <span>Dedicar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Centro: Controles de Reproducción y Selectores de Frecuencia */}
          <div className="md:col-span-5 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Botón Historial de Canciones para pantallas menores a LG */}
              <button 
                onClick={() => onOpenSongHistory && onOpenSongHistory()}
                className="lg:hidden text-[#c0c6d6] hover:text-[#00d2ff] transition-colors text-xs px-2 py-1 rounded-full border border-[#a8c8ff]/20 flex items-center gap-1 cursor-pointer"
                title="Historial de canciones"
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span className="text-[10px]">Historial</span>
              </button>

              <button 
                onClick={handleShare}
                className="text-[#c0c6d6] hover:text-[#00d2ff] transition-colors text-base"
                title="Compartir Emisora"
              >
                <i className="fa-solid fa-share-nodes"></i>
              </button>

              {/* Botón Modo Auto / Bote */}
              <button
                type="button"
                onClick={() => onOpenCarMode && onOpenCarMode()}
                className="text-[#00d2ff] hover:text-white bg-[#00d2ff]/10 hover:bg-[#00d2ff]/25 border border-[#00d2ff]/30 transition-all text-xs px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Abrir Modo Auto / Bote (Interfaz gigante de alta visibilidad para conducción en Ruta P-72S y faenas marítimas)"
              >
                <i className="fa-solid fa-car-side text-xs text-[#00d2ff]"></i>
                <span className="hidden sm:inline text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">Auto/Bote</span>
              </button>

              {/* Botón Principal Play / Pause */}
              <button
                onClick={togglePlayLive}
                disabled={isLoading && !isReconnecting}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#3491ff] text-[#002955] hover:brightness-110 flex items-center justify-center shadow-[0_0_24px_rgba(0,210,255,0.45)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-[#00d2ff]/30"
                aria-label={isPlaying ? "Pausar emisión" : "Reproducir emisión"}
              >
                {isReconnecting ? (
                  <i className="fa-solid fa-arrows-rotate fa-spin text-lg text-[#002955]"></i>
                ) : isLoading ? (
                  <i className="fa-solid fa-spinner fa-spin text-lg text-[#002955]"></i>
                ) : isPlaying ? (
                  <i className="fa-solid fa-pause text-lg text-[#002955]"></i>
                ) : (
                  <i className="fa-solid fa-play text-lg ml-0.5 text-[#002955]"></i>
                )}
              </button>

              {/* Botón Temporizador para Dormir (Sleep Timer) */}
              <button
                onClick={() => onOpenSleepTimer && onOpenSleepTimer()}
                className={`transition-all text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer ${
                  sleepTimerMinutes
                    ? 'bg-amber-400/20 text-[#f6bf22] border border-amber-400/40 shadow-sm animate-pulse'
                    : 'text-[#c0c6d6] hover:text-[#00d2ff]'
                }`}
                title={sleepTimerMinutes ? `Temporizador activo: apagando en ${Math.ceil(sleepTimerRemaining / 60)} min` : "Temporizador para dormir"}
              >
                <i className="fa-solid fa-moon"></i>
                {sleepTimerMinutes && (
                  <span className="font-mono text-[10px] font-bold">
                    {Math.ceil(sleepTimerRemaining / 60)}m
                  </span>
                )}
              </button>

              <button 
                onClick={toggleMute}
                className="text-[#c0c6d6] hover:text-[#00d2ff] transition-colors text-base"
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                <i className={`fa-solid ${isMuted ? 'fa-volume-xmark text-rose-400' : 'fa-volume-high'}`}></i>
              </button>
            </div>

            {/* Selector de Frecuencias y Calidad en Píldoras */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-['Montserrat',sans-serif] tracking-wider">
              {/* Conmutador Servidor Principal vs Respaldo */}
              <button
                type="button"
                onClick={() => switchServer(activeServer === 'primary' ? 'backup' : 'primary')}
                title={`Servidor streaming: ${activeServer === 'primary' ? 'Zeno FM (Principal)' : 'SonicPanel (Respaldo)'}. Clic para alternar.`}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                  activeServer === 'backup'
                    ? 'bg-amber-400/20 text-[#f6bf22] border-amber-400/40 shadow-sm animate-pulse'
                    : 'bg-[#071933] text-[#a5e7ff] hover:text-white border-[#a8c8ff]/15'
                }`}
              >
                <i className="fa-solid fa-tower-broadcast text-[9px]"></i>
                <span>{activeServer === 'backup' ? 'Respaldo' : 'Principal'}</span>
              </button>
              <button
                onClick={() => setSelectedFreq('105.1')}
                className={`px-3 py-1 rounded-full transition-all font-bold text-[11px] cursor-pointer ${
                  selectedFreq === '105.1'
                    ? 'bg-[#00d2ff] text-[#002955] shadow-sm'
                    : 'bg-[#071933] text-[#c0c6d6] hover:text-white border border-[#a8c8ff]/15'
                }`}
              >
                <i className="fa-solid fa-radio mr-1 text-[#002955]/70"></i> 105.1 FM Quidico
              </button>

              <button
                onClick={() => setSelectedFreq('91.3')}
                className={`px-3 py-1 rounded-full transition-all font-bold text-[11px] cursor-pointer ${
                  selectedFreq === '91.3'
                    ? 'bg-[#00d2ff] text-[#002955] shadow-sm'
                    : 'bg-[#071933] text-[#c0c6d6] hover:text-white border border-[#a8c8ff]/15'
                }`}
              >
                <i className="fa-solid fa-tower-cell mr-1 text-[#002955]/70"></i> 91.3 FM Tirúa
              </button>

              {/* Selector de Calidad Inteligente HD vs ECO */}
              <div 
                className="inline-flex items-center bg-[#010e24] p-0.5 rounded-full border border-[#00d2ff]/30 shadow-inner"
                data-purpose="audio-quality-selector"
              >
                <button 
                  type="button"
                  onClick={() => setAudioQuality('HD')}
                  title="Calidad Óptima Estéreo (128 kbps)"
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    audioQuality === 'HD'
                      ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow'
                      : 'text-[#c0c6d6] hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-bolt text-[9px]"></i>
                  <span>HD 128k</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setAudioQuality('ECO')}
                  title="Ahorro de Datos Móviles (64 kbps) - Ideal para zonas rurales"
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    audioQuality === 'ECO'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-[#002955] shadow'
                      : 'text-[#c0c6d6] hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-leaf text-[9px]"></i>
                  <span>ECO 64k</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Volumen y Botón WhatsApp Cabina */}
          <div className="hidden md:flex md:col-span-3 items-center justify-end gap-4">
            <div className="flex items-center gap-2 text-[#c0c6d6]">
              <i className="fa-solid fa-volume-high text-xs text-[#a5e7ff]"></i>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-[#00d2ff] h-1.5 bg-[#071933] rounded cursor-pointer"
                title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            <button
              onClick={onOpenRequestModal}
              className="bg-gradient-to-r from-[#f6bf22] to-[#ffc837] hover:brightness-110 text-[#3f2e00] px-4 py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(246,191,34,0.3)] hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp Cabina
            </button>
          </div>

        </div>
      </div>

      {/* Notificación Toast Flotante de Cambio de Calidad o Temporizador */}
      {qualityToast && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#071933]/95 backdrop-blur-md border border-[#00d2ff] text-white px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.85)] text-xs font-['Montserrat',sans-serif] font-bold flex items-center gap-2.5 animate-bounce pointer-events-none">
          <i className="fa-solid fa-circle-check text-[#00d2ff] text-sm"></i>
          <span>{qualityToast}</span>
        </div>
      )}
    </section>
  );
};
