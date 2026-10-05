import React, { useState } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { useAudio } from '../context/AudioContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const EmergencyBanner = () => {
  const { config } = useRadioConfig();
  const { isPlaying, togglePlayLive } = useAudio();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentConfig = config || RADIO_CONFIG;
  const alert = currentConfig.emergencyAlert;

  if (!alert || !alert.active) return null;

  const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');

  const handleReportEmergency = () => {
    const text = `🚨 *REPORTE DE EMERGENCIA - COMUNIDAD QUIDICO / TIRÚA*\n` +
      `Estimada cabina de Radio Puerto Quidico, deseo reportar la siguiente situación urgente: `;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isUrgent = alert.level === 'urgente';
  const isWarning = alert.level === 'precaucion';

  // Configuración de temas según el nivel de alerta
  const theme = isUrgent
    ? {
        bg: 'bg-gradient-to-r from-red-950 via-rose-900 to-red-950',
        border: 'border-b-2 border-rose-500 shadow-[0_4px_30px_rgba(244,63,94,0.35)]',
        badgeBg: 'bg-rose-500 text-white',
        pulseBg: 'bg-rose-400',
        titleColor: 'text-white',
        textColor: 'text-rose-100',
        icon: 'fa-triangle-exclamation',
        badgeText: 'ALERTA MÁXIMA / CADENA RADIAL',
      }
    : isWarning
    ? {
        bg: 'bg-gradient-to-r from-amber-950 via-orange-950 to-amber-950',
        border: 'border-b-2 border-amber-400 shadow-[0_4px_30px_rgba(251,191,36,0.25)]',
        badgeBg: 'bg-amber-400 text-[#002955]',
        pulseBg: 'bg-amber-300',
        titleColor: 'text-white',
        textColor: 'text-amber-100',
        icon: 'fa-circle-exclamation',
        badgeText: 'PRECAUCIÓN / AVISO COMUNAL',
      }
    : {
        bg: 'bg-gradient-to-r from-sky-950 via-blue-900 to-sky-950',
        border: 'border-b-2 border-[#00d2ff] shadow-[0_4px_30px_rgba(0,210,255,0.25)]',
        badgeBg: 'bg-[#00d2ff] text-[#002955]',
        pulseBg: 'bg-[#00d2ff]',
        titleColor: 'text-white',
        textColor: 'text-[#d6e3ff]',
        icon: 'fa-bullhorn',
        badgeText: 'CADENA INFORMATIVA COMUNAL',
      };

  return (
    <div 
      className={`w-full transition-all duration-300 relative z-50 ${theme.bg} ${theme.border} text-white font-['Inter',sans-serif]`}
      data-purpose="emergency-broadcast-banner"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        {/* Vista Colapsada Mínima */}
        {isCollapsed ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`w-2.5 h-2.5 rounded-full ${theme.pulseBg} animate-ping shrink-0`} />
              <span className={`text-[10px] font-['Oswald',sans-serif] font-black uppercase px-2 py-0.5 rounded ${theme.badgeBg} shrink-0`}>
                {theme.badgeText}
              </span>
              <p className="font-bold truncate text-white">
                {alert.title}: <span className="font-normal opacity-90">{alert.message}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlayLive}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-['Oswald',sans-serif] font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <i className="fa-solid fa-play text-[9px] text-rose-600"></i>
                  <span>Escuchar</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-xs"
                title="Expandir aviso de emergencia"
              >
                <i className="fa-solid fa-chevron-down"></i>
              </button>
            </div>
          </div>
        ) : (
          /* Vista Completa Expandida de Cadena Radial */
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="flex items-start gap-3 sm:gap-3.5">
              {/* Ícono de Alerta con Baliza */}
              <div className="relative shrink-0 mt-0.5">
                <div className={`w-10 h-10 rounded-2xl ${isUrgent ? 'bg-rose-600/30 border border-rose-400' : 'bg-white/15 border border-white/20'} flex items-center justify-center text-lg shadow-lg`}>
                  <i className={`fa-solid ${theme.icon} ${isUrgent ? 'text-rose-300 animate-bounce' : 'text-white'}`}></i>
                </div>
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${theme.pulseBg} animate-ping`} />
              </div>

              {/* Contenido de la Alerta */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-['Oswald',sans-serif] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badgeBg} shadow-sm`}>
                    {theme.badgeText}
                  </span>
                  <span className="text-[11px] text-white/70 font-medium">
                    105.1 FM Quidico • 91.3 FM Tirúa • Transmisión Prioritaria
                  </span>
                  {alert.source && (
                    <span className="hidden sm:inline-block text-[11px] text-white/60 bg-black/30 px-2 py-0.5 rounded">
                      Fuente: {alert.source}
                    </span>
                  )}
                </div>

                <h3 className={`text-base sm:text-lg font-['Anton',sans-serif] uppercase tracking-wide leading-tight ${theme.titleColor}`}>
                  {alert.title}
                </h3>

                <p className={`text-xs sm:text-sm font-['Inter',sans-serif] leading-relaxed max-w-4xl ${theme.textColor}`}>
                  {alert.message}
                </p>

                {alert.updatedAt && (
                  <span className="text-[10px] text-white/50 block pt-0.5">
                    ⏱️ Última actualización: {alert.updatedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Botones de Acción Inmediata */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-1 md:pt-0">
              {/* Botón Escuchar al Aire */}
              <button
                type="button"
                onClick={togglePlayLive}
                className={`font-['Oswald',sans-serif] uppercase font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isPlaying 
                    ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30' 
                    : 'bg-white text-slate-950 hover:bg-slate-100 hover:scale-105 active:scale-95'
                }`}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-volume-high text-emerald-400' : 'fa-play text-rose-600'}`}></i>
                <span>{isPlaying ? 'Sintonizado al Aire' : 'Escuchar En Vivo'}</span>
              </button>

              {/* Botón Reportar a Cabina por WhatsApp */}
              <button
                type="button"
                onClick={handleReportEmergency}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-['Oswald',sans-serif] uppercase font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Informar situación a cabina radial"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span className="hidden sm:inline">Reportar a Cabina</span>
              </button>

              {/* Minimizar */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="w-8 h-8 rounded-xl bg-black/25 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                title="Minimizar aviso"
              >
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
