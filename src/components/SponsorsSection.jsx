import React, { useState } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const SponsorsSection = ({ onOpenRequestModal, onOpenAdvertisingModal }) => {
  const { config, updateConfig } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const sponsors = currentConfig.sponsors && currentConfig.sponsors.length > 0
    ? currentConfig.sponsors
    : RADIO_CONFIG.sponsors;

  const [activeSponsorIndex, setActiveSponsorIndex] = useState(0);
  const currentSponsor = sponsors[activeSponsorIndex] || sponsors[0];

  const handleSponsorClick = (sponsor) => {
    try {
      const updatedSponsors = sponsors.map(s => {
        if (s.id === sponsor.id || s.name === sponsor.name) {
          return { ...s, clicks: (s.clicks || 0) + 1 };
        }
        return s;
      });
      updateConfig({ sponsors: updatedSponsors });
    } catch (e) {
      console.warn('Error tracking click:', e);
    }
  };

  return (
    <section 
      id="auspiciadores"
      className="py-20 md:py-24 bg-[#041329]/80 backdrop-blur-md border-t border-[#a8c8ff]/12 relative overflow-hidden" 
      data-purpose="sponsors-showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Sección Estilo StreamingHD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-store text-[11px]"></i>
              <span>Red de Comercio y Empresas Aliadas</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Auspiciadores <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff]">Oficiales</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-xl leading-relaxed">
              Las empresas y emprendimientos que impulsan el desarrollo de Caleta Quidico, Tirúa y la Provincia de Arauco.
            </p>
          </div>

          {/* Botón Ver Tarifario Publicitario en Píldora */}
          <button
            type="button"
            onClick={onOpenAdvertisingModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Montserrat',sans-serif] font-bold uppercase text-xs px-6 py-3.5 rounded-full shadow-lg shadow-[#00d2ff]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
          >
            <i className="fa-solid fa-bullhorn text-xs"></i>
            <span>Ver Tarifas Publicitarias</span>
          </button>
        </div>

        {/* Píldoras de Selección de Auspiciador (si hay más de 1) */}
        {sponsors.length > 1 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {sponsors.map((sp, idx) => (
              <button
                key={sp.id || idx}
                type="button"
                onClick={() => setActiveSponsorIndex(idx)}
                className={`px-4 py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeSponsorIndex === idx
                    ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/25'
                    : 'bg-[#071933] text-[#c0c6d6] hover:text-white border border-[#a8c8ff]/15 hover:bg-[#0e274b]'
                }`}
              >
                <i className="fa-solid fa-store text-xs"></i>
                <span>{sp.name}</span>
                {sp.category && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-sans uppercase font-bold ${
                    activeSponsorIndex === idx ? 'bg-[#002955] text-[#00d2ff]' : 'bg-[#010e24] text-[#8a919f]'
                  }`}>
                    {sp.category}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Auspiciador Oficial Auténtico & Aliado Comercial Exclusivo</span>
          </div>
        )}

        {/* Contenido del Auspiciador Activo en Tarjeta Glass Minimalista (sh-card) */}
        <div className="sh-card rounded-3xl border border-[#a8c8ff]/15 p-6 sm:p-10 shadow-2xl bg-gradient-to-br from-[#071933]/90 via-[#041329]/90 to-[#010e24] relative">
          <div className="ambient-glow" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Lado Izquierdo: Descripción y Contacto */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30 text-[10px] font-['Montserrat',sans-serif] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                  {currentSponsor.category || 'Auspiciador Oficial'}
                </span>
                <span className="text-xs text-[#f6bf22] font-['Montserrat',sans-serif] font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-star text-[10px]"></i> Destacado 105.1 FM
                </span>
              </div>

              <h3 className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl uppercase text-white leading-tight">
                {currentSponsor.name}
              </h3>

              <p className="text-sm font-bold text-[#f6bf22] font-['Montserrat',sans-serif] tracking-wide">
                "{currentSponsor.tagline}"
              </p>

              <p className="text-xs sm:text-sm text-[#c0c6d6] font-['Inter',sans-serif] leading-relaxed">
                {currentSponsor.description}
              </p>

              {/* Etiquetas del Auspiciador */}
              {currentSponsor.tags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentSponsor.tags.map((tag, i) => (
                    <span key={i} className="bg-[#010e24] text-[11px] px-3.5 py-1 rounded-full text-[#a5e7ff] font-medium border border-[#a8c8ff]/15">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Botones de Acción Comercial en Píldoras */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={currentSponsor.whatsappUrl || `https://wa.me/56962679087?text=Hola%20${encodeURIComponent(currentSponsor.name)},%20los%20contacto%20desde%20Radio%20Puerto%20Quidico`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSponsorClick(currentSponsor)}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f6bf22] to-[#ffc837] hover:brightness-110 text-[#3f2e00] font-['Montserrat',sans-serif] font-black uppercase text-xs px-6 py-3.5 rounded-full shadow-lg shadow-[#f6bf22]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i>
                  <span>Contactar vía WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenAdvertisingModal}
                  className="inline-flex items-center justify-center gap-2 bg-[#010e24] hover:bg-[#071933] text-[#d6e3ff] hover:text-white font-['Montserrat',sans-serif] font-bold uppercase text-xs px-5 py-3.5 rounded-full border border-[#a8c8ff]/20 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-coins text-[#00d2ff]"></i>
                  <span>Quiero Auspiciar</span>
                </button>
              </div>
            </div>

            {/* Lado Derecho: Imagen Oficial & Tarjetas de Beneficio */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6 items-center">
              
              {/* Afiche / Imagen Oficial con borde fino y sombra */}
              <div className="w-full sm:w-64 sm:h-64 md:w-72 md:h-72 shrink-0 relative group">
                <a 
                  href={currentSponsor.instagramUrl || "https://www.instagram.com/donnicamar_cl/"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => handleSponsorClick(currentSponsor)}
                  className="block relative rounded-3xl overflow-hidden border border-[#00d2ff]/40 shadow-[0_0_30px_rgba(0,210,255,0.2)] group-hover:border-[#f6bf22] transition-all bg-[#010e24] w-full h-full"
                  title={`Ver información de ${currentSponsor.name}`}
                >
                  <img 
                    src={currentSponsor.image || "/images/originales_blog/auspiciador-don-nica.jpg"} 
                    alt={currentSponsor.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/originales_blog/auspiciador-don-nica.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010e24]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                    <span className="text-white text-xs font-bold font-['Montserrat',sans-serif] flex items-center gap-1.5">
                      <i className="fa-brands fa-instagram text-[#f6bf22]"></i> Ver detalles comerciales
                    </span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-[#00d2ff]"></i>
                  </div>
                </a>
                <span className="absolute -top-2.5 -right-2.5 bg-[#f6bf22] text-[#3f2e00] font-['Montserrat',sans-serif] font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg border border-[#010e24]">
                  Comercio Local
                </span>
              </div>

              {/* Tarjetas de Garantía Comercial */}
              <div className="flex-1 space-y-3 w-full">
                <div className="bg-[#010e24]/80 p-4 rounded-2xl border border-[#a8c8ff]/12 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00d2ff]/10 text-[#00d2ff] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-certificate text-base"></i>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] font-bold text-sm uppercase text-white">
                        Comercio Verificado
                      </h4>
                      <p className="text-xs text-[#c0c6d6] mt-0.5 leading-relaxed font-['Inter',sans-serif]">
                        Emprendimiento arraigado en Tirúa y Quidico con el respaldo oficial de la emisora.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#010e24]/80 p-4 rounded-2xl border border-[#a8c8ff]/12 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#3491ff]/10 text-[#3491ff] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-truck-fast text-base"></i>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] font-bold text-sm uppercase text-white">
                        Atención Comunal
                      </h4>
                      <p className="text-xs text-[#c0c6d6] mt-0.5 leading-relaxed font-['Inter',sans-serif]">
                        Contacto directo vía WhatsApp para compras, despachos y atención personalizada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#010e24]/80 p-4 rounded-2xl border border-[#a8c8ff]/12 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f6bf22]/10 text-[#f6bf22] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-chart-line text-base"></i>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] font-bold text-sm uppercase text-white">
                        Presencia Publicitaria
                      </h4>
                      <p className="text-xs text-[#c0c6d6] mt-0.5 leading-relaxed font-['Inter',sans-serif]">
                        Presencia 24/7 en transmisión radial FM, Quidico TV y plataforma digital.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
