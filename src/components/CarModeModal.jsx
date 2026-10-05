import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { useOnAirMetadata } from '../hooks/useOnAirMetadata';
import { RADIO_CONFIG } from '../config/radioConfig';

export const CarModeModal = ({ isOpen, onClose, onOpenVoiceRequest }) => {
  const {
    isPlaying,
    togglePlayLive,
    isLoading,
    isReconnecting,
    activeServer,
    switchServer,
    volume,
    handleVolumeChange,
    toggleMute,
    isMuted,
  } = useAudio();

  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const { song, artist, show, host } = useOnAirMetadata();

  const weather = currentConfig.maritimeWeather || RADIO_CONFIG.maritimeWeather;

  // Manejo de tecla Escape para salir de modo auto
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000814] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none animate-fadeIn overflow-hidden">
      {/* Barra Superior: Logo, Frecuencias, Estado de Puerto y Botón Salir */}
      <div className="flex items-center justify-between gap-3 border-b border-[#a8c8ff]/20 pb-3 sm:pb-4">
        {/* Identidad de la Radio */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-0.5 ring-2 ring-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.4)] overflow-hidden shrink-0">
            <img
              src={currentConfig.branding?.logo || RADIO_CONFIG.branding.logo}
              alt="Logo Radio Puerto Quidico"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Anton',sans-serif] text-xl sm:text-2xl uppercase tracking-wider text-white">
                PUERTO QUIDICO
              </span>
              <span className="bg-[#00d2ff] text-[#002955] text-xs font-['Montserrat',sans-serif] font-black px-2 py-0.5 rounded-full">
                105.1 FM
              </span>
            </div>
            <p className="text-xs text-[#a5e7ff] font-['Montserrat',sans-serif] tracking-wide">
              91.3 FM Tirúa Costa • Modo Conducción & Navegación
            </p>
          </div>
        </div>

        {/* Píldora Náutica de Puerto & Botón de Salir */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Badge Estado de Puerto para Pescadores / Conductores */}
          <div className="hidden sm:flex items-center gap-2 bg-[#071933] border border-[#00d2ff]/40 px-3 py-1.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${
              weather.portStatus === 'ABIERTO' 
                ? 'bg-emerald-400 animate-pulse' 
                : weather.portStatus === 'PRECAUCIÓN' 
                ? 'bg-amber-400' 
                : 'bg-rose-500 animate-ping'
            }`}></span>
            <span className="text-[#00d2ff] uppercase">⚓ PUERTO {weather.portStatus || 'ABIERTO'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-[#f6bf22]">{weather.airTemp || '17°C'}</span>
          </div>

          {/* Botón Salir Extragrande */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-['Montserrat',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Salir del Modo Auto / Bote"
          >
            <i className="fa-solid fa-xmark text-base"></i>
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Centro: Pantalla Extragrande Legible a 1 Metro */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-4 sm:my-6 max-w-4xl mx-auto w-full px-2">
        {/* Indicador de Transmisión al Aire y Servidor */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-['Montserrat',sans-serif] font-black text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SEÑAL EN DIRECTO
          </span>

          {/* Selector / Indicador de Servidor Failover */}
          <button
            type="button"
            onClick={() => switchServer(activeServer === 'primary' ? 'backup' : 'primary')}
            title="Conmutar entre servidor Principal (Zeno) y Respaldo (SonicPanel)"
            className={`px-3 py-1 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeServer === 'backup'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow'
                : 'bg-[#071933] text-[#a5e7ff] border-[#a8c8ff]/30 hover:border-[#00d2ff]'
            }`}
          >
            <i className="fa-solid fa-tower-broadcast text-xs"></i>
            <span>{activeServer === 'backup' ? 'Servidor Respaldo (SonicPanel)' : 'Servidor Principal (Zeno)'}</span>
          </button>
        </div>

        {/* Nombre de la Canción Gigante */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-['Anton',sans-serif] uppercase tracking-wide text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] max-w-3xl line-clamp-2">
          {song || 'Radio Puerto Quidico'}
        </h1>

        {/* Artista Extragrande en Amarillo Brillante */}
        <p className="text-xl sm:text-3xl md:text-4xl font-['Montserrat',sans-serif] font-extrabold text-[#f6bf22] mt-2 sm:mt-3 tracking-wide drop-shadow-md">
          {artist || '105.1 FM Quidico • 91.3 FM Tirúa'}
        </p>

        {/* Programa en Transmisión */}
        <p className="text-xs sm:text-base text-[#a5e7ff] font-['Montserrat',sans-serif] font-semibold mt-2 opacity-90">
          📻 {show || 'Transmisión en Vivo'} • Locución: {host || 'Estudios Centrales'}
        </p>

        {/* BOTÓN GIGANTE DE PLAY / PAUSA (120px) */}
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={togglePlayLive}
            disabled={isLoading && !isReconnecting}
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 cursor-pointer shadow-[0_0_50px_rgba(0,210,255,0.5)] border-4 ${
              isPlaying
                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 border-rose-300 ring-4 ring-rose-500/40 hover:brightness-110'
                : 'bg-gradient-to-tr from-[#00d2ff] via-[#3491ff] to-[#0066cc] border-white ring-4 ring-[#00d2ff]/50 hover:scale-105'
            }`}
            aria-label={isPlaying ? "Pausar transmisión" : "Reproducir transmisión"}
          >
            {isReconnecting ? (
              <i className="fa-solid fa-arrows-rotate fa-spin text-4xl sm:text-5xl text-white"></i>
            ) : isLoading ? (
              <i className="fa-solid fa-spinner fa-spin text-4xl sm:text-5xl text-white"></i>
            ) : isPlaying ? (
              <i className="fa-solid fa-pause text-4xl sm:text-5xl text-white"></i>
            ) : (
              <i className="fa-solid fa-play text-4xl sm:text-5xl text-white ml-2"></i>
            )}
          </button>
        </div>

        <span className="text-xs sm:text-sm font-['Montserrat',sans-serif] uppercase font-bold tracking-widest text-[#a8c8ff]/70 mt-3">
          {isPlaying ? 'Toca para pausar' : 'Toca para reproducir'}
        </span>
      </div>

      {/* Barra Inferior: Botón de WhatsApp de 1 Toque y Volumen */}
      <div className="border-t border-[#a8c8ff]/20 pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
        {/* Botón WhatsApp Gigante de 1 Toque: "Pedir Tema por Voz" */}
        <button
          type="button"
          onClick={() => {
            if (onOpenVoiceRequest) {
              onOpenVoiceRequest();
            } else {
              const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
              const waUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('¡Hola Radio Puerto Quidico! Les escucho en vivo desde la ruta/bote y quiero pedir un tema musical.')}`;
              window.open(waUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-110 text-white font-['Montserrat',sans-serif] font-black text-sm sm:text-base uppercase tracking-wider py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_6px_24px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <i className="fa-solid fa-microphone text-xl text-white animate-pulse"></i>
          <span>Pedir Tema por Voz (1 Toque)</span>
          <i className="fa-brands fa-whatsapp text-2xl text-white ml-1"></i>
        </button>

        {/* Control de Sonido & Mute con Botones Grandes */}
        <div className="flex items-center justify-between sm:justify-end gap-4 bg-[#071933] border border-[#a8c8ff]/20 p-2.5 rounded-2xl">
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-colors cursor-pointer ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-[#1c2a41] hover:bg-[#2c3951] text-[#00d2ff]'
            }`}
            title={isMuted ? "Activar audio" : "Silenciar"}
          >
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>

          <div className="flex-1 sm:w-48 flex items-center gap-3 px-2">
            <span className="text-xs font-['Montserrat',sans-serif] font-bold text-[#a5e7ff] uppercase">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#00d2ff] h-3 bg-[#010e24] rounded-lg cursor-pointer"
              title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
            <span className="text-xs font-mono font-bold text-white w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
