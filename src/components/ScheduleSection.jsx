import React, { useState } from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useAudio } from '../context/AudioContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { getCurrentShow } from '../utils/timeUtils';

export const ScheduleSection = () => {
  const { config } = useRadioConfig();
  const rawSchedule = config?.schedule || RADIO_CONFIG.schedule;
  
  // Garantizar que solo se muestren programas oficiales con sus afiches reales correspondientes
  const schedule = (Array.isArray(rawSchedule) ? rawSchedule : RADIO_CONFIG.schedule)
    .filter(p => p && p.image && (
      p.id === 'prog-noticias-matinal' || 
      p.id === 'prog-noticias-mediodia' || 
      p.id === 'prog-surcando-el-lafken' || 
      p.id === 'prog-dj-dino'
    ));

  const [filter, setFilter] = useState('all'); // 'all' | 'noticias' | 'martes' | 'sunday'
  const [selectedPoster, setSelectedPoster] = useState(null);
  const { togglePlayLive, isPlaying } = useAudio();
  const currentShow = getCurrentShow(schedule);

  const formatDays = (days) => {
    if (!days || !days.length) return '';
    if (days.length === 7) return 'Todos los días';
    if (days.length === 6 && !days.includes('Domingo')) return 'De Lunes a Sábado';
    if (days.length === 5 && !days.includes('Sábado') && !days.includes('Domingo')) return 'Lunes a Viernes';
    if (days.length === 1 && days[0] === 'Domingo') return 'Acompañando tu Domingo';
    if (days.length === 1 && days[0] === 'Martes') return 'Todos los Martes';
    if (days.length === 1) return `Solo ${days[0]}`;
    if (days.length === 2 && days.includes('Sábado') && days.includes('Domingo')) return 'Sábados y Domingos';
    return days.join(', ');
  };

  const filteredPrograms = schedule.filter((prog) => {
    if (filter === 'all') return true;
    if (filter === 'noticias') {
      return prog.id.includes('noticias');
    }
    if (filter === 'martes') {
      return prog.days && prog.days.includes('Martes');
    }
    if (filter === 'sunday') {
      return prog.days && prog.days.includes('Domingo');
    }
    return true;
  });

  return (
    <section id="programacion" className="py-20 md:py-24 bg-[#041329]/80 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de Programación Oficial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-tower-broadcast text-[11px]"></i>
              <span>Nuevo Dial 91.3 FM • Caleta Quidico & Tirúa</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Programación <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff]">Oficial en Vivo</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-2xl leading-relaxed">
              Conoce los programas oficiales que se transmiten al aire por el dial 91.3 FM y señal web. Información veraz, hechos locales y la mejor animación para nuestra comunidad.
            </p>
          </div>

          {/* Filtros de Programación: Todos / Noticias / Martes / Domingos */}
          <div className="flex items-center gap-1.5 bg-[#010e24] p-1.5 rounded-full border border-[#a8c8ff]/20 shadow-md self-start md:self-auto flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs font-['Montserrat',sans-serif] font-bold px-3.5 sm:px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                  : 'text-[#c0c6d6] hover:text-white'
              }`}
            >
              Todos ({schedule.length})
            </button>
            <button
              onClick={() => setFilter('noticias')}
              className={`text-xs font-['Montserrat',sans-serif] font-bold px-3.5 sm:px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                filter === 'noticias'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                  : 'text-[#c0c6d6] hover:text-white'
              }`}
            >
              Las Noticias (2)
            </button>
            <button
              onClick={() => setFilter('martes')}
              className={`text-xs font-['Montserrat',sans-serif] font-bold px-3.5 sm:px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                filter === 'martes'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                  : 'text-[#c0c6d6] hover:text-white'
              }`}
            >
              Martes (Lafken)
            </button>
            <button
              onClick={() => setFilter('sunday')}
              className={`text-xs font-['Montserrat',sans-serif] font-bold px-3.5 sm:px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                filter === 'sunday'
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                  : 'text-[#c0c6d6] hover:text-white'
              }`}
            >
              Domingos (DJ Dino)
            </button>
          </div>
        </div>

        {/* Parrilla de Programas Oficiales (4 Columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrograms.map((prog) => {
            const isLive = currentShow?.id === prog.id;

            return (
              <article
                key={prog.id}
                className={`sh-card p-5 sm:p-6 rounded-3xl relative flex flex-col justify-between group transition-all duration-300 ${
                  isLive
                    ? 'border-2 border-[#00d2ff] bg-gradient-to-br from-[#0c2448]/95 via-[#071933]/90 to-[#041329] shadow-[0_12px_40px_rgba(0,210,255,0.25)]'
                    : 'border border-[#a8c8ff]/15 bg-[#071933]/80 hover:border-[#00d2ff]/40 shadow-xl'
                }`}
              >
                {isLive && <div className="ambient-glow" />}

                <div>
                  {/* Afiche Oficial Grande Panorámico con enlace a Lightbox */}
                  <div
                    onClick={() => setSelectedPoster(prog)}
                    className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden mb-5 border border-[#00d2ff]/30 bg-[#020b18] group-hover:border-[#00d2ff] transition-all shadow-lg cursor-pointer group/poster"
                    title="Clic para ver afiche oficial completo en alta resolución"
                  >
                    <img
                      src={prog.image}
                      alt={prog.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/originales_blog/header-banner.jpg';
                      }}
                      className="w-full h-full object-cover object-center group-hover/poster:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041329] via-transparent to-transparent opacity-75" />
                    
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-white/95 border border-white/20 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center gap-1.5 font-['Inter',sans-serif]">
                      <i className="fa-solid fa-expand text-[10px]"></i> Ver afiche
                    </span>

                    <span className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-full bg-[#041329]/95 backdrop-blur-md border border-[#00d2ff]/50 text-[#00d2ff] font-['Montserrat',sans-serif] text-xs font-black shadow-md flex items-center gap-1.5">
                      <i className="fa-solid fa-tower-broadcast text-[10px]"></i>
                      {prog.dial || '91.3 FM'}
                    </span>
                  </div>

                  {/* Horario & Estado En Vivo */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl text-[#00d2ff]">
                      {prog.time} <span className="text-xs font-semibold text-[#a5e7ff]/70">HRS</span>
                    </span>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f6bf22] text-[#3f2e00] font-['Montserrat',sans-serif] font-black text-[10px] uppercase tracking-wider shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3f2e00] animate-ping"></span>
                        AL AIRE
                      </span>
                    ) : (
                      <span className="text-[10px] font-['Montserrat',sans-serif] font-bold uppercase text-[#a5e7ff] bg-[#010e24] px-2.5 py-1 rounded-full border border-[#a8c8ff]/15">
                        {prog.tag || 'Transmisión Oficial'}
                      </span>
                    )}
                  </div>

                  {/* Días e información del programa */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[11px] font-['Montserrat',sans-serif] font-bold text-white bg-[#00d2ff]/15 border border-[#00d2ff]/30 px-2.5 py-0.5 rounded-md">
                      <i className="fa-regular fa-calendar-check text-[10px] mr-1.5 text-[#00d2ff]"></i>
                      {formatDays(prog.days)}
                    </span>
                    <span className="text-[10px] font-['Montserrat',sans-serif] font-bold uppercase text-[#a5e7ff] bg-[#010e24] px-2 py-0.5 rounded-md border border-[#a8c8ff]/15">
                      {prog.category || 'En Vivo'}
                    </span>
                  </div>

                  <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl uppercase tracking-tight text-white leading-snug">
                    {prog.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#c0c6d6] mt-3 font-['Inter',sans-serif] leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                {/* Footer de la tarjeta con locutor y botones de interacción */}
                <div className="mt-6 pt-4 border-t border-[#a8c8ff]/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      onClick={() => setSelectedPoster(prog)}
                      className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#00d2ff] shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform"
                      title="Ver afiche"
                    >
                      <img src={prog.image} alt={prog.host} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] uppercase text-[#a8c8ff]/70 font-semibold block">Conducción</span>
                      <span className="text-xs text-white font-bold truncate block">
                        {prog.host}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {prog.phone && (
                      <a
                        href={`https://wa.me/${prog.phone.replace(/[^0-9]/g, '')}?text=Hola%20DJ%20Dino,%20estoy%20escuchando%20el%20programa%20en%20Quidico%20y%20quiero%20enviar%20un%20saludo`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Enviar WhatsApp directo al programa"
                      >
                        <i className="fa-brands fa-whatsapp text-base"></i>
                      </a>
                    )}
                    <button
                      onClick={togglePlayLive}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#3491ff] text-[#002955] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all shrink-0 cursor-pointer"
                      title={isPlaying ? "Pausar señal" : "Escuchar en vivo"}
                    >
                      <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs ml-0.5`}></i>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* Modal / Lightbox de Afiche Oficial HD */}
      {selectedPoster && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPoster(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-[#071933] border border-[#00d2ff]/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col items-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPoster(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#010e24]/80 text-[#c0c6d6] hover:text-white hover:bg-rose-500/80 transition-all flex items-center justify-center border border-white/10 cursor-pointer z-10"
              title="Cerrar afiche"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            <div className="w-full rounded-2xl overflow-hidden border border-[#a8c8ff]/20 bg-black shadow-lg mb-4 max-h-[65vh] flex items-center justify-center">
              <img 
                src={selectedPoster.image} 
                alt={selectedPoster.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/originales_blog/header-banner.jpg';
                }}
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            <div className="w-full text-center">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/30 px-3 py-0.5 rounded-full mb-1">
                {selectedPoster.category || 'Programa Oficial'} • {selectedPoster.dial || '91.3 FM'}
              </span>
              <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl text-white">
                {selectedPoster.title}
              </h3>
              <p className="text-xs text-[#a5e7ff] font-['Montserrat',sans-serif] font-semibold mt-1">
                <i className="fa-regular fa-clock mr-1 text-[#00d2ff]"></i>
                {selectedPoster.time} hrs • {formatDays(selectedPoster.days)}
              </p>
              <p className="text-xs text-[#c0c6d6] mt-2 font-['Inter',sans-serif] leading-relaxed">
                {selectedPoster.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#a8c8ff]/15 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    togglePlayLive();
                    setSelectedPoster(null);
                  }}
                  className="bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] px-5 py-2.5 rounded-full font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  <span>{isPlaying ? 'Pausar Radio' : 'Escuchar En Vivo'}</span>
                </button>
                <a
                  href={`https://wa.me/${(selectedPoster.phone || '56962679087').replace(/[^0-9]/g, '')}?text=Hola%20Radio%20Puerto%20Quidico,%20estoy%20escuchando%20el%20programa%20y%20quiero%20enviar%20un%20saludo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-full font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 transition-all"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>WhatsApp Cabina</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
