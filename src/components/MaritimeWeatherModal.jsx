import React, { useState } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const MaritimeWeatherModal = ({ isOpen, onClose }) => {
  const { config, refreshLiveMaritimeWeather } = useRadioConfig();
  const [isUpdating, setIsUpdating] = useState(false);
  const currentConfig = config || RADIO_CONFIG;
  const weather = currentConfig.maritimeWeather || RADIO_CONFIG.maritimeWeather;

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsUpdating(true);
    try {
      await refreshLiveMaritimeWeather();
    } catch {}
    setIsUpdating(false);
  };

  const isPortOpen = weather.portStatus === 'ABIERTO';
  const isPortCaution = weather.portStatus === 'PRECAUCIÓN';
  const isPortClosed = weather.portStatus === 'CERRADO';

  const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
  const reportUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('Hola Radio Puerto Quidico, reporto información sobre las condiciones del mar en mi sector:')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d1c32] border border-[#00d2ff]/40 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.85)] relative max-h-[92vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar boletín"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Encabezado con Icono Marino */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#003543] to-[#00d2ff] p-0.5 flex items-center justify-center shadow-lg border border-[#00d2ff]/50 shrink-0">
            <div className="w-full h-full bg-[#0d1c32] rounded-[14px] flex items-center justify-center text-[#00d2ff] text-2xl">
              <i className="fa-solid fa-anchor"></i>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c2a41] border border-[#00d2ff]/30 text-[10px] font-['Oswald',sans-serif] uppercase font-bold text-[#00d2ff]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping"></span>
                Servicio de Utilidad Náutica
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                title="Actualizar datos satelitales en vivo"
              >
                <i className={`fa-solid fa-satellite-dish text-[9px] ${isUpdating ? 'animate-spin' : ''}`}></i>
                <span>{isUpdating ? 'Consultando...' : 'Satélite en Vivo'}</span>
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-['Anton',sans-serif] uppercase tracking-wide text-white leading-tight">
              BOLETÍN MARÍTIMO & MAREAS
            </h2>
            <p className="text-xs text-[#a5e7ff] font-['Inter',sans-serif]">
              Caleta Quidico • Borde Costero Tirúa • Isla Mocha (Lat: -38.243, Lon: -73.492)
            </p>
          </div>
        </div>

        {/* Tarjeta Principal de Estado de Puerto */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
          isPortOpen 
            ? 'bg-gradient-to-r from-emerald-950/50 via-[#0d1c32] to-[#0d1c32] border-emerald-500/40' 
            : isPortCaution
            ? 'bg-gradient-to-r from-amber-950/50 via-[#0d1c32] to-[#0d1c32] border-amber-500/40'
            : 'bg-gradient-to-r from-rose-950/50 via-[#0d1c32] to-[#0d1c32] border-rose-500/40'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <span className={`w-4 h-4 rounded-full inline-block ${
                isPortOpen ? 'bg-emerald-400' : isPortCaution ? 'bg-amber-400' : 'bg-rose-500'
              }`}></span>
              <span className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                isPortOpen ? 'bg-emerald-400' : isPortCaution ? 'bg-amber-400' : 'bg-rose-500'
              }`}></span>
            </div>

            <div>
              <span className="text-[11px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#c0c6d6] block">
                Condición de Capitanía de Puerto:
              </span>
              <h3 className={`text-lg sm:text-xl font-['Anton',sans-serif] uppercase tracking-wider ${
                isPortOpen ? 'text-emerald-300' : isPortCaution ? 'text-amber-300' : 'text-rose-400'
              }`}>
                PUERTO {weather.portStatus}
              </h3>
              <p className="text-xs text-[#d6e3ff] mt-0.5">
                {weather.portStatusDetail}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-[#8a919f] font-mono block">
              {weather.updatedAt}
            </span>
            <span className="text-[11px] text-[#00d2ff] font-bold font-['Oswald',sans-serif] uppercase">
              VHF Canal 16 • 105.1 FM
            </span>
          </div>
        </div>

        {/* Grilla de Mediciones Marítimas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
          
          {/* Marea Alta (Pleamar) */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#00d2ff] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Próxima Pleamar
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.highTide}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                Marea Alta en Quidico
              </span>
            </div>
          </div>

          {/* Marea Baja (Bajamar) */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#3491ff] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-arrow-trend-down"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Próxima Bajamar
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.lowTide}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                Marea Baja en Orilla
              </span>
            </div>
          </div>

          {/* Viento & Dirección */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#f6bf22] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-wind"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Viento Costero
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.windSpeed}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                {weather.windDirection}
              </span>
            </div>
          </div>

          {/* Altura de Ola */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#00d2ff] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-water"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Oleaje en Barra
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.waveHeight}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                Olas del Pacífico Sur
              </span>
            </div>
          </div>

          {/* Temperaturas */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#f6bf22] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-temperature-half"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Aire / Agua de Mar
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.airTemp} / {weather.waterTemp}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                {weather.condition}
              </span>
            </div>
          </div>

          {/* Fase Lunar */}
          <div className="bg-[#010e24] p-4 rounded-2xl border border-[#a8c8ff]/15 flex items-center gap-3.5 shadow">
            <div className="w-10 h-10 rounded-xl bg-[#1c2a41] text-[#a5e7ff] flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-moon"></i>
            </div>
            <div>
              <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] block">
                Fase Lunar
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {weather.lunarPhase}
              </span>
              <span className="text-[10px] text-[#8a919f] block">
                Repunte de Marea Vivo
              </span>
            </div>
          </div>

        </div>

        {/* Recomendación y Aviso de Seguridad Marítima */}
        <div className="bg-[#112036] p-4 rounded-2xl border border-[#a8c8ff]/20 mb-6 flex items-start gap-3">
          <i className="fa-solid fa-life-ring text-[#f6bf22] text-xl mt-0.5 shrink-0"></i>
          <div>
            <h4 className="text-xs font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wider">
              Aviso a la Navegación y Recolectores de Orilla
            </h4>
            <p className="text-xs text-[#c0c6d6] mt-1 leading-relaxed">
              {weather.advisory}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] font-['Oswald',sans-serif] font-bold text-xs uppercase py-3 px-5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>Reportar Estado del Mar al Aire</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="sm:w-auto px-6 py-3 rounded-xl bg-[#1c2a41] hover:bg-[#2c3951] text-[#d6e3ff] text-xs font-['Oswald',sans-serif] font-bold uppercase transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
