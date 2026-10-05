import React, { useState } from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useAudio } from '../context/AudioContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { EmergencyBanner } from './EmergencyBanner';

export const Header = ({ onOpenRequestModal, onOpenMaritimeModal, onOpenPWAInstall, onOpenAdminModal, onOpenCarMode, activeSection, onScrollTo }) => {
  const { isPlaying, togglePlayLive } = useAudio();
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  const weather = currentConfig.maritimeWeather || RADIO_CONFIG.maritimeWeather;

  const navItems = [
    { id: 'hero', label: 'Inicio' },
    { id: 'player', label: 'En Vivo' },
    { id: 'programacion', label: 'Programación' },
    { id: 'podcasts', label: 'A la Carta', badge: 'Podcast' },
    { id: 'quidico-tv', label: 'Quidico TV', badge: 'HD' },
    { id: 'comunidad', label: 'Comunidad' },
    { id: 'auspiciadores', label: 'Auspiciadores' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#010e24]/90 backdrop-blur-xl border-b border-[#a8c8ff]/12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Banner de Alerta de Emergencia y Cadena Comunal si está activo */}
      <EmergencyBanner />

      {/* Barra superior minimalista: Estado de transmisión y Clima Marítimo */}
      <div className="bg-[#000814]/85 border-b border-[#a8c8ff]/10 text-[11px] py-1 px-4 sm:px-6 lg:px-8 tracking-wider text-[#c0c6d6] font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Lado Izquierdo: Estado de Transmisión */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d2ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d2ff]"></span>
            </span>
            <span className="text-[#00d2ff] font-bold uppercase text-[10px] sm:text-[11px] font-['Montserrat',sans-serif] tracking-wider">
              AL AIRE 24/7
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-[#a8c8ff]/80 truncate text-[11px]">
              Estudios Centrales en Caleta Quidico & Tirúa Costa
            </span>
          </div>

          {/* Lado Derecho: Píldora Náutica de Mareas y WhatsApp Cabina */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            {/* Píldora Náutica Interactiva con Mareas */}
            <button 
              type="button"
              onClick={onOpenMaritimeModal}
              title="Abrir Boletín Marítimo & Mareas de Quidico"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#071933]/90 hover:bg-[#0d284f] border border-[#00d2ff]/30 text-[#d6e3ff] transition-all cursor-pointer shadow-sm hover:border-[#00d2ff] whitespace-nowrap text-[11px]"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                weather.portStatus === 'ABIERTO' 
                  ? 'bg-emerald-400 animate-pulse' 
                  : weather.portStatus === 'PRECAUCIÓN'
                  ? 'bg-amber-400'
                  : 'bg-rose-500 animate-ping'
              }`}></span>
              <span className="text-[#00d2ff] font-semibold uppercase tracking-wide text-[10px] sm:text-[11px] font-['Montserrat',sans-serif]">
                ⚓ {weather.portStatus || 'ABIERTO'}
              </span>
              <span className="text-white/20 hidden md:inline">•</span>
              <span className="text-[#f6bf22] hidden md:inline text-[11px] font-medium">
                {weather.highTide?.split(' ')[0] || '14:20'} Pleamar
              </span>
              <span className="text-white/20 hidden lg:inline">•</span>
              <span className="text-[#a5e7ff] text-[11px] hidden lg:inline font-medium">
                {weather.airTemp || '17°C'}
              </span>
            </button>

            <span className="text-white/20 hidden sm:inline">|</span>
            <button 
              onClick={onOpenRequestModal}
              className="hover:text-[#00d2ff] transition-colors hidden sm:flex items-center gap-1.5 text-[#d6e3ff] whitespace-nowrap cursor-pointer text-xs font-medium"
            >
              <i className="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
              <span>{currentConfig.contact?.whatsappDisplay || currentConfig.contact?.whatsapp}</span>
            </button>

            {onOpenAdminModal && (
              <>
                <span className="text-white/20 hidden sm:inline">|</span>
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="hover:text-white text-[#00d2ff] transition-all hidden sm:inline-flex items-center gap-1.5 text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider bg-[#071933] hover:bg-[#00d2ff]/20 border border-[#00d2ff]/40 px-2.5 py-0.5 rounded-full cursor-pointer shadow-sm"
                  title="Panel de Emisora (Acceso Autorizado)"
                >
                  <i className="fa-solid fa-lock text-[9px] text-[#00d2ff]"></i>
                  <span>Panel Emisora</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Navegación Principal Estilo StreamingHD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[68px] sm:h-[72px] flex items-center justify-between gap-4">
          
          {/* Logo y Marca con distribución limpia */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0 select-none py-1"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white p-0.5 ring-2 ring-[#00d2ff]/50 group-hover:ring-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)] group-hover:scale-105 transition-all overflow-hidden shrink-0">
              <img
                src={currentConfig.branding?.logo || '/images/logo-radio-puerto-quidico.jpg'}
                alt="Logo Radio Puerto Quidico"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <div className="flex flex-col leading-tight shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-['Montserrat',sans-serif] font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-[#00d2ff] transition-colors whitespace-nowrap">
                  PUERTO QUIDICO
                </span>
                <span className="font-['Montserrat',sans-serif] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] tracking-wider leading-none shadow-sm whitespace-nowrap">
                  {currentConfig.frequencyPrimary || '105.1 FM'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[#00d2ff] font-['Montserrat',sans-serif] text-[10px] font-semibold tracking-wider whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  SEÑAL ONLINE HD
                </span>
                <span className="text-[#8a919f] text-[10px]">•</span>
                <span className="font-['Inter',sans-serif] text-[11px] text-[#a8c8ff]/75 font-medium whitespace-nowrap">
                  {currentConfig.frequencySecondary || '91.3 FM'} Tirúa Costa
                </span>
              </div>
            </div>
          </div>

          {/* Menú Desktop con Botones Píldora Minimalistas (XL >= 1280px) */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-[#071933]/60 border border-[#a8c8ff]/12 px-3 py-1.5 rounded-full shadow-inner">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => handleNavClick(item.id)} 
                  className={`px-3.5 py-1.5 rounded-full text-xs font-['Montserrat',sans-serif] font-semibold tracking-wide uppercase transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-[#00d2ff] bg-[#00d2ff]/15 border border-[#00d2ff]/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]' 
                      : 'text-[#c0c6d6] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#00d2ff] text-[#002955] text-[9px] px-1.5 py-0.2 rounded font-black tracking-tight">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Botones de Acción Derecha */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botón Escuchar Rápido (para usuarios desktop) */}
            <button
              onClick={togglePlayLive}
              title={isPlaying ? "Pausar transmisión" : "Escuchar transmisión en vivo"}
              className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/40 hover:bg-[#00d2ff]/25 hover:shadow-[0_0_18px_rgba(0,210,255,0.3)]'
              }`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
              <span>{isPlaying ? 'PAUSAR' : 'ESCUCHAR HD'}</span>
            </button>

            {/* Botón Instalar App PWA */}
            <button
              type="button"
              onClick={onOpenPWAInstall}
              title="Instalar Aplicación en tu Dispositivo"
              className="hidden 2xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#071933]/90 hover:bg-[#0e274b] border border-[#a8c8ff]/20 hover:border-[#00d2ff]/60 text-[#a5e7ff] hover:text-white text-xs font-['Montserrat',sans-serif] font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-mobile-screen-button text-xs text-[#00d2ff]"></i>
              <span>Instalar App</span>
            </button>

            {/* Botón Modo Auto / Bote */}
            <button
              type="button"
              onClick={onOpenCarMode}
              title="Modo Auto / Bote (Interfaz gigante para conducción en Ruta P-72S y navegación en lanchas)"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#071933]/90 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/40 hover:border-[#00d2ff] text-[#00d2ff] hover:text-white text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-car-side text-xs text-[#00d2ff]"></i>
              <span>Auto/Bote</span>
            </button>

            {/* Botón Pedir Tema (Píldora dorada prominente) */}
            <button
              onClick={onOpenRequestModal}
              title="Pedir tema musical o enviar saludo por WhatsApp"
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#f6bf22] to-[#ffc837] hover:brightness-110 text-[#3f2e00] text-xs uppercase font-['Montserrat',sans-serif] tracking-wider font-extrabold h-9 sm:h-auto py-2 px-3 sm:px-4 rounded-full transition-all shadow-[0_4px_16px_rgba(246,191,34,0.35)] hover:shadow-[0_6px_22px_rgba(246,191,34,0.5)] hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <i className="fa-brands fa-whatsapp text-sm sm:text-base"></i>
              <span className="hidden sm:inline">Pedir Tema</span>
            </button>

            {/* Toggle Menú Móvil / Tablet (< 1280px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#071933] hover:bg-[#0e274b] border border-[#a8c8ff]/20 text-[#00d2ff] hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm shrink-0"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm sm:text-base`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil y Tablet con Estilo Glass Espacioso */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#010e24]/98 backdrop-blur-2xl border-b border-[#00d2ff]/20 px-4 sm:px-6 pt-4 pb-6 space-y-3 animate-fadeIn shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#a8c8ff]/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#00d2ff] overflow-hidden shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.4)]">
                <img src={currentConfig.branding?.logo || RADIO_CONFIG.branding.logo} alt={currentConfig.station?.name || 'Radio Puerto Quidico'} className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="block font-['Montserrat',sans-serif] font-black text-white text-sm sm:text-base leading-tight">
                  {currentConfig.station?.name || 'RADIO PUERTO QUIDICO'}
                </span>
                <span className="block text-[11px] font-semibold text-[#00d2ff] font-['Montserrat',sans-serif] tracking-wider">
                  {currentConfig.station?.dial || '105.1 FM'} • 91.3 FM TIRÚA
                </span>
              </div>
            </div>

            <button
              onClick={togglePlayLive}
              className={`px-3 py-1.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold flex items-center gap-1.5 ${
                isPlaying ? 'bg-rose-500 text-white' : 'bg-[#00d2ff] text-[#002955]'
              }`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
              <span>{isPlaying ? 'PAUSAR' : 'PLAY'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-['Montserrat',sans-serif] font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/40 shadow-sm' 
                      : 'text-[#d6e3ff] hover:bg-[#071933] hover:text-white border border-[#a8c8ff]/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#00d2ff] text-[#002955] text-[9px] px-1.5 py-0.5 rounded font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onOpenMaritimeModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#00d2ff] bg-[#071933] hover:bg-[#0e274b] border border-[#00d2ff]/30 flex items-center justify-between transition-colors shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-anchor text-[#00d2ff]"></i>
                <span className="font-['Montserrat',sans-serif]">Boletín Marítimo & Mareas</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                weather.portStatus === 'ABIERTO' ? 'bg-emerald-400 text-[#003543]' : 'bg-rose-500 text-white'
              }`}>
                ⚓ {weather.portStatus || 'ABIERTO'}
              </span>
            </button>

            {/* Botón Modo Auto / Bote Móvil */}
            <button
              onClick={() => {
                if (onOpenCarMode) onOpenCarMode();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-[#00d2ff] bg-[#071933] hover:bg-[#00d2ff]/20 border border-[#00d2ff]/40 flex items-center justify-between shadow-md transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2 font-['Montserrat',sans-serif]">
                <i className="fa-solid fa-car-side text-[#00d2ff] text-sm"></i>
                <span>MODO AUTO / BOTE (PANTALLA GIGANTE)</span>
              </span>
              <span className="text-[10px] bg-[#00d2ff]/20 text-[#00d2ff] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                1 TOQUE
              </span>
            </button>

            {/* Botón Instalar App PWA Móvil */}
            <button
              onClick={() => {
                if (onOpenPWAInstall) onOpenPWAInstall();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#071933] to-[#0d284f] border border-[#00d2ff]/40 flex items-center justify-between shadow-md transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2 text-white font-['Montserrat',sans-serif]">
                <i className="fa-solid fa-mobile-screen-button text-[#00d2ff] text-sm"></i>
                <span>INSTALAR APP EN TU CELULAR</span>
              </span>
              <span className="text-[10px] bg-[#00d2ff] text-[#002955] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                GRATIS
              </span>
            </button>

            <button
              onClick={() => {
                onOpenRequestModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f6bf22] to-[#ffc837] text-[#3f2e00] font-['Montserrat',sans-serif] font-black py-2.5 rounded-2xl text-xs uppercase shadow-md transition-all cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              <span>WhatsApp Cabina ({currentConfig.contact?.whatsappDisplay || currentConfig.contact?.whatsapp})</span>
            </button>

            {onOpenAdminModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenAdminModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-[#a8c8ff] hover:text-white bg-[#071933] hover:bg-[#0e274b] border border-[#00d2ff]/30 transition-all cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2 font-['Montserrat',sans-serif]">
                  <i className="fa-solid fa-lock text-[#00d2ff]"></i>
                  <span>Panel de Control de la Emisora</span>
                </span>
                <span className="text-[10px] text-[#a5e7ff] font-mono bg-[#002955] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <i className="fa-solid fa-key text-[9px] text-[#00d2ff]"></i>
                  <span>Cabina</span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
