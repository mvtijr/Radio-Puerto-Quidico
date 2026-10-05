import React, { useState, useEffect } from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useAudio } from '../context/AudioContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { getCurrentShow } from '../utils/timeUtils';
import { useOnAirMetadata } from '../hooks/useOnAirMetadata';

export const HeroSection = ({ onOpenRequestModal, onScrollTo }) => {
  const { isPlaying, togglePlayLive, isLoading, audioQuality, toggleAudioQuality } = useAudio();
  const { song, artist, host, genre } = useOnAirMetadata();
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const [currentShow, setCurrentShow] = useState(() => getCurrentShow(currentConfig.schedule));
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [selectedDial, setSelectedDial] = useState('105.1');

  useEffect(() => {
    setCurrentShow(getCurrentShow(currentConfig.schedule));
    const timer = setInterval(() => {
      setCurrentShow(getCurrentShow(currentConfig.schedule));
    }, 30000);
    return () => clearInterval(timer);
  }, [currentConfig.schedule]);

  return (
    <section id="hero" className="relative overflow-hidden min-h-[95vh] flex flex-col justify-between pt-28 sm:pt-32 pb-12 border-b border-[#a8c8ff]/12">
      
      {/* Fondo con Ondas de Radio SVG Animadas estilo StreamingHD */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        {/* Capa de ondas 1 (Lenta hacia la izquierda) */}
        <div className="absolute inset-0 flex items-center justify-start wave-1">
          <svg className="w-[2880px] h-[360px] max-w-none text-[#00d2ff]/10 fill-current" viewBox="0 0 2880 360" preserveAspectRatio="none">
            <path d="M0,180 C360,280 720,80 1080,180 C1440,280 1800,80 2160,180 C2520,280 2880,80 2880,180 L2880,360 L0,360 Z" />
          </svg>
        </div>

        {/* Capa de ondas 2 (Deriva suave a la derecha) */}
        <div className="absolute inset-0 flex items-center justify-start wave-2">
          <svg className="w-[2880px] h-[360px] max-w-none text-[#3491ff]/10 fill-current" viewBox="0 0 2880 360" preserveAspectRatio="none">
            <path d="M0,140 C400,40 800,240 1200,140 C1600,40 2000,240 2400,140 C2800,40 3200,240 3200,140 L3200,360 L0,360 Z" />
          </svg>
        </div>

        {/* Capa de ondas 3 (Rápida y sutil) */}
        <div className="absolute inset-0 flex items-center justify-start wave-3">
          <svg className="w-[2880px] h-[360px] max-w-none text-[#a5e7ff]/5 fill-current" viewBox="0 0 2880 360" preserveAspectRatio="none">
            <path d="M0,200 C320,100 640,300 960,200 C1280,100 1600,300 1920,200 C2240,100 2560,300 2880,200 L2880,360 L0,360 Z" />
          </svg>
        </div>
      </div>

      {/* Resplandor radial de ambiente */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#00d2ff]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#3491ff]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Gradiente sutil para garantizar contraste y legibilidad con el fondo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#010e24] via-[#041329]/50 to-transparent pointer-events-none z-0" />

      {/* Contenedor Principal Hero */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12 py-6 md:py-10">
          
          {/* Lado Izquierdo: Tipografía Principal StreamingHD, Badges y CTAs */}
          <div className="lg:col-span-7 z-20 text-left">
            
            {/* Eyebrow Badge en Píldora Luminosa */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#010e24]/90 backdrop-blur-md border border-[#00d2ff]/40 text-xs font-['Montserrat',sans-serif] uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d2ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d2ff]"></span>
              </span>
              <span className="font-bold text-[#d6e3ff]">
                Transmisión Digital en Vivo • <span className="text-[#00d2ff] font-extrabold">{currentConfig.frequencyPrimary} & {currentConfig.frequencySecondary}</span>
              </span>
            </div>

            {/* Headline Principal con Tipografía Montserrat Moderna y Acento Gradiente */}
            <h1 className="font-['Montserrat',sans-serif] font-black text-4xl sm:text-6xl lg:text-6xl xl:text-7xl tracking-tight leading-[1.06] text-white">
              La Voz Costera que Une a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff] drop-shadow-[0_4px_24px_rgba(0,210,255,0.35)]">
                Quidico y el Mundo
              </span>
            </h1>

            {/* Subtítulo amplio y legible */}
            <p className="font-['Inter',sans-serif] text-base sm:text-lg text-[#c0c6d6] mt-6 max-w-2xl leading-relaxed">
              Transmitiendo las 24 horas desde Caleta Quidico y Tirúa con sonido digital de alta definición. La sintonía comunitaria que conecta a nuestra gente con música, noticias locales y cultura marítima.
            </p>

            {/* Grupo de Botones de Acción Estilo StreamingHD (Pills) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Botón Principal: Escuchar Señal HD */}
              <button
                onClick={togglePlayLive}
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#00d2ff] via-[#3491ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Montserrat',sans-serif] font-extrabold uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 text-xs sm:text-sm shadow-[0_4px_25px_rgba(0,210,255,0.45)] hover:shadow-[0_6px_30px_rgba(0,210,255,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#002955] text-[#00d2ff] flex items-center justify-center shadow-inner">
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  ) : (
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs ml-0.5`}></i>
                  )}
                </div>
                <span>{isPlaying ? 'PAUSAR TRANSMISIÓN' : `ESCUCHAR EN VIVO ${currentConfig.frequencyPrimary}`}</span>
              </button>

              {/* Botón Secundario: Quidico TV */}
              <button
                onClick={() => onScrollTo('quidico-tv')}
                className="inline-flex items-center justify-center gap-2.5 bg-[#071933]/90 hover:bg-[#0e274b] text-[#a5e7ff] hover:text-white font-['Montserrat',sans-serif] font-bold uppercase tracking-wider px-6 py-4 rounded-full transition-all border border-[#a8c8ff]/20 hover:border-[#00d2ff]/50 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-tv text-[#00d2ff]"></i>
                <span>Quidico TV HD</span>
              </button>
            </div>

            {/* Fila Inferior: Micrófono Abierto y Web Oficial */}
            <div className="mt-8 pt-6 border-t border-[#a8c8ff]/15 flex flex-wrap items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => onOpenRequestModal('voice')}
                title="Grabar un saludo o aviso con tu propia voz para que salga al aire"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 hover:text-white font-['Montserrat',sans-serif] font-bold uppercase tracking-wider transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <i className="fa-solid fa-microphone text-rose-400"></i>
                <span>Micrófono Abierto: Grabar Voz</span>
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071933]/70 border border-[#a8c8ff]/15 text-[#a8c8ff]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-['Inter',sans-serif] font-medium tracking-wide">
                  {currentConfig.broadcastHours || 'Transmisión 24 Horas Ininterrumpidas'}
                </span>
              </div>
            </div>

          </div>

          {/* Lado Derecho: Advance Player Mockup (Estructura de Ventana y Reproductor StreamingHD) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Resplandor ambiental de la tarjeta */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#00d2ff]/15 blur-3xl -z-10 pointer-events-none" />

            <div className="w-full max-w-lg lg:max-w-none">
              
              {/* Contenedor del Reproductor Estilo Ventana StreamingHD */}
              <div className="sh-card rounded-3xl border border-[#a8c8ff]/20 bg-[#071933]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                
                {/* Cabecera de Ventana de Navegador / Aplicación */}
                <div className="px-5 py-3.5 bg-[#010e24]/90 border-b border-[#a8c8ff]/12 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>

                  {/* Barra de Dirección Segura SSL */}
                  <div className="flex-1 max-w-[240px] mx-auto bg-[#071933] border border-[#a8c8ff]/15 rounded-full px-3 py-1 flex items-center justify-center gap-1.5 text-[11px] text-[#a5e7ff] font-mono">
                    <i className="fa-solid fa-lock text-emerald-400 text-[10px]"></i>
                    <span className="truncate">player.radioquidico.cl/live</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse"></span>
                    <span className="text-[10px] font-['Montserrat',sans-serif] font-bold text-[#00d2ff] uppercase tracking-wider hidden sm:inline">
                      LIVE HD
                    </span>
                  </div>
                </div>

                {/* Selector de Dial de Frecuencia */}
                <div className="p-4 bg-[#041329]/80 border-b border-[#a8c8ff]/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDial('105.1')}
                      className={`px-3 py-1 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase transition-all cursor-pointer ${
                        selectedDial === '105.1'
                          ? 'bg-[#00d2ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                          : 'bg-[#071933] text-[#c0c6d6] hover:text-white border border-[#a8c8ff]/15'
                      }`}
                    >
                      105.1 FM Quidico
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDial('91.3')}
                      className={`px-3 py-1 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase transition-all cursor-pointer ${
                        selectedDial === '91.3'
                          ? 'bg-[#00d2ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                          : 'bg-[#071933] text-[#c0c6d6] hover:text-white border border-[#a8c8ff]/15'
                      }`}
                    >
                      91.3 FM Tirúa
                    </button>
                  </div>

                  {/* Toggle de Calidad */}
                  <button
                    type="button"
                    onClick={toggleAudioQuality}
                    title="Alternar calidad de audio: HD 128 kbps o Ahorro de Datos 64 kbps"
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      audioQuality === 'ECO'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                        : 'bg-[#00d2ff]/15 text-[#00d2ff] border-[#00d2ff]/40'
                    }`}
                  >
                    {audioQuality === 'ECO' ? '🌱 ECO 64k' : '⚡ HD 128k'}
                  </button>
                </div>

                {/* Pantalla Visual del Reproductor: Video de la Radio */}
                <div className="relative w-full h-[220px] sm:h-[260px] overflow-hidden bg-[#010e24]">
                  <video
                    ref={(el) => {
                      if (el) {
                        el.muted = isVideoMuted;
                        el.play().catch(() => {});
                      }
                    }}
                    src="/videos/radio-quidico.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041329] via-transparent to-transparent pointer-events-none" />

                  {/* Badges Flotantes sobre el Video */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#010e24]/80 backdrop-blur-md border border-[#00d2ff]/30 text-[#00d2ff] font-['Montserrat',sans-serif] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping"></span>
                      EN TRANSMISIÓN
                    </span>
                  </div>

                  {/* Botón Silenciar/Activar Video */}
                  <button
                    type="button"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    title={isVideoMuted ? "Activar audio del video" : "Silenciar video"}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#010e24]/80 hover:bg-[#00d2ff] hover:text-[#002955] backdrop-blur-md border border-[#00d2ff]/40 text-[#a5e7ff] flex items-center justify-center transition-all shadow cursor-pointer"
                  >
                    <i className={`fa-solid ${isVideoMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs`}></i>
                  </button>
                </div>

                {/* Módulo de Control de Audio & Metadatos Sonando al Aire */}
                <div className="p-5 bg-gradient-to-b from-[#041329] to-[#010e24]">
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Información de la canción */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-['Montserrat',sans-serif] font-bold tracking-wider text-[#00d2ff] flex items-center gap-1">
                          <i className="fa-solid fa-compact-disc text-[9px] text-[#f6bf22]"></i>
                          Sonando al Aire ({genre || 'Música & Noticias'})
                        </span>
                      </div>
                      
                      <p className="text-sm sm:text-base font-bold text-white truncate font-['Montserrat',sans-serif]">
                        {song || 'Señal en Vivo'}
                      </p>
                      <p className="text-xs text-[#a8c8ff]/80 truncate font-['Inter',sans-serif] mt-0.5">
                        {artist || 'Radio Puerto Quidico 91.3 FM'} • {host || currentShow?.host || 'DJ Dino & Prensa'}
                      </p>
                    </div>

                    {/* Botón Grande Play/Pause del Mockup */}
                    <button
                      onClick={togglePlayLive}
                      title={isPlaying ? "Pausar" : "Reproducir en Vivo"}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 shrink-0 cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-500 text-white shadow-rose-500/30'
                          : 'bg-gradient-to-tr from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-[#00d2ff]/30 ring-4 ring-[#00d2ff]/20'
                      }`}
                    >
                      {isLoading ? (
                        <i className="fa-solid fa-circle-notch fa-spin text-base"></i>
                      ) : (
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ml-0.5`}></i>
                      )}
                    </button>
                  </div>

                  {/* Ecualizador Animado de Espectro Estéreo */}
                  <div className="mt-4 pt-3.5 border-t border-[#a8c8ff]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#a5e7ff]/70 uppercase">
                        {selectedDial === '105.1' ? '105.1 MHz FM' : '91.3 MHz FM'}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {isPlaying ? 'BUFFER: 100%' : 'STANDBY'}
                      </span>
                    </div>

                    {/* Barras de Ecualizador */}
                    <div className="flex items-end gap-1 h-5 px-1">
                      <span className={`w-1 bg-[#00d2ff] ${isPlaying ? 'eq-bar' : 'h-1.5'} rounded-full`}></span>
                      <span className={`w-1 bg-[#a5e7ff] ${isPlaying ? 'eq-bar' : 'h-3'} rounded-full`}></span>
                      <span className={`w-1 bg-[#3491ff] ${isPlaying ? 'eq-bar' : 'h-2'} rounded-full`}></span>
                      <span className={`w-1 bg-[#00d2ff] ${isPlaying ? 'eq-bar' : 'h-4'} rounded-full`}></span>
                      <span className={`w-1 bg-[#a5e7ff] ${isPlaying ? 'eq-bar' : 'h-1.5'} rounded-full`}></span>
                      <span className={`w-1 bg-[#3491ff] ${isPlaying ? 'eq-bar' : 'h-3'} rounded-full`}></span>
                      <span className={`w-1 bg-[#00d2ff] ${isPlaying ? 'eq-bar' : 'h-2'} rounded-full`}></span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Banda de Estadísticas y Confianza Estilo StreamingHD (Stats Band) */}
        <div className="mt-6 sm:mt-10 pt-4">
          <div className="sh-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#a8c8ff]/15 bg-gradient-to-r from-[#071933]/90 via-[#041329]/90 to-[#071933]/90">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#a8c8ff]/10">
              
              <div className="pt-2 lg:pt-0">
                <span className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#a5e7ff] block">
                  24/7
                </span>
                <span className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] font-medium mt-1 block">
                  Señal al Aire Ininterrumpida
                </span>
              </div>

              <div className="pt-2 lg:pt-0">
                <span className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-white block">
                  105.1 FM
                </span>
                <span className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] font-medium mt-1 block">
                  Caleta Quidico & Arauco
                </span>
              </div>

              <div className="pt-2 lg:pt-0">
                <span className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-white block">
                  91.3 FM
                </span>
                <span className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] font-medium mt-1 block">
                  Tirúa Costa & Borde Marítimo
                </span>
              </div>

              <div className="pt-2 lg:pt-0">
                <span className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-[#f6bf22] block">
                  100%
                </span>
                <span className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] font-medium mt-1 block">
                  Comunitaria, Libre y Local
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Indicador sutil de scroll hacia abajo */}
      <div 
        onClick={() => onScrollTo('player')}
        className="relative z-20 pt-6 flex flex-col items-center justify-center text-[#a5e7ff]/60 hover:text-[#00d2ff] transition-colors cursor-pointer"
      >
        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-widest font-semibold mb-1">
          Explorar Contenido
        </span>
        <div className="w-5 h-8 border border-[#a5e7ff]/40 rounded-full flex justify-center pt-1">
          <span className="w-1 h-2 bg-[#00d2ff] rounded-full animate-bounce"></span>
        </div>
      </div>

    </section>
  );
};
