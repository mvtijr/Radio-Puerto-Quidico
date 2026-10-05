import React from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useRadioConfig } from '../context/RadioConfigContext';

export const Footer = ({ onScrollTo, onOpenRequestModal, onOpenAdminModal, onOpenPWAInstall }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  return (
    <footer className="bg-[#010e24]/85 backdrop-blur-md border-t border-[#a8c8ff]/20 pt-16 pb-28 md:pb-24 text-[#d6e3ff] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Columna 1: Presentación de Marca y Logo Oficial */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-0.5 ring-2 ring-[#00d2ff]/60 shadow-[0_0_20px_rgba(0,210,255,0.4)] shrink-0">
                <img
                  src={currentConfig.branding?.logo || RADIO_CONFIG.branding.logo}
                  alt={`Logo ${currentConfig.station?.name || 'Radio Puerto Quidico'}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-['Anton',sans-serif] text-2xl uppercase tracking-wider text-white block">
                  {currentConfig.station?.name || 'RADIO PUERTO QUIDICO'}
                </span>
                <span className="font-['Oswald',sans-serif] text-xs font-bold text-[#00d2ff] tracking-widest uppercase block">
                  {currentConfig.station?.dial || '105.1 FM'} • 91.3 FM TIRÚA COSTA
                </span>
                <span className="text-[11px] text-[#ffdf99] font-serif italic block mt-0.5">
                  "{currentConfig.motto || RADIO_CONFIG.motto}"
                </span>
              </div>
            </div>

            <p className="text-xs text-[#c0c6d6] font-sans leading-relaxed max-w-sm">
              {currentConfig.station?.name || 'Radio Puerto Quidico'} {currentConfig.station?.dial || '105.1 FM'}. "{currentConfig.station?.slogan || 'Tu Radio de Siempre'}". Música, Información, Cultura y Comunidad uniendo todo el borde costero y el mundo a través de nuestra señal digital.
            </p>

            {/* Redes Sociales */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={currentConfig.contact?.socialLinks?.facebook || RADIO_CONFIG.contact.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#3491ff] flex items-center justify-center text-white transition-colors"
              >
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a
                href={currentConfig.contact?.socialLinks?.instagram || RADIO_CONFIG.contact.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#3491ff] flex items-center justify-center text-white transition-colors"
              >
                <i className="fa-brands fa-instagram text-sm"></i>
              </a>
              <a
                href={currentConfig.contact?.socialLinks?.youtube || RADIO_CONFIG.contact.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#3491ff] flex items-center justify-center text-white transition-colors"
              >
                <i className="fa-brands fa-youtube text-sm"></i>
              </a>
              <button
                onClick={onOpenRequestModal}
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#f6bf22] hover:text-[#3f2e00] flex items-center justify-center text-[#f6bf22] transition-colors"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
              </button>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="lg:col-span-3 space-y-3 font-['Oswald',sans-serif]">
            <h4 className="font-['Anton',sans-serif] text-xl tracking-wider uppercase text-white border-b border-[#a8c8ff]/20 pb-2">
              Secciones
            </h4>
            <ul className="space-y-2 text-sm text-[#c0c6d6]">
              <li>
                <button onClick={() => onScrollTo('hero')} className="hover:text-[#00d2ff] transition-colors">
                  Inicio & Live Stream
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('player')} className="hover:text-[#00d2ff] transition-colors">
                  Señales 105.1 FM / 91.3 FM
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('programacion')} className="hover:text-[#00d2ff] transition-colors">
                  Parrilla Programática
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('podcasts')} className="hover:text-[#00d2ff] transition-colors">
                  Radio a la Carta (Pódcasts)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('quidico-tv')} className="hover:text-[#00d2ff] transition-colors">
                  Quidico TV (Canal de Video)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('auspiciadores')} className="hover:text-[#00d2ff] transition-colors">
                  Comercializadora Don Nica
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('comunidad')} className="hover:text-[#00d2ff] transition-colors">
                  Avisos a la Comunidad Tirúa
                </button>
              </li>
              <li className="pt-1">
                <button 
                  onClick={onOpenPWAInstall} 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00d2ff]/15 hover:bg-[#00d2ff] text-[#00d2ff] hover:text-[#003543] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-mobile-screen-button"></i>
                  <span>Instalar App en Celular</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto y Legal */}
          <div className="lg:col-span-4 space-y-3 font-['Oswald',sans-serif]">
            <h4 className="font-['Anton',sans-serif] text-xl tracking-wider uppercase text-white border-b border-[#a8c8ff]/20 pb-2">
              Contacto & Estudios
            </h4>
            <div className="space-y-2 text-xs font-sans text-[#c0c6d6]">
              <p className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-[#00d2ff] mt-1"></i>
                <span>{currentConfig.contact?.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-[#00d2ff]"></i>
                <span>Contacto Cabina: {currentConfig.contact?.whatsappDisplay || currentConfig.contact?.phoneCabina}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-globe text-[#00d2ff]"></i>
                <span>Portal Oficial: {currentConfig.contact?.website}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-[#00d2ff]"></i>
                <span>Email: {currentConfig.contact?.email}</span>
              </p>
              
              {/* Marco Regulatorio y Propiedad Intelectual Chile */}
              <div className="p-2.5 rounded-xl bg-[#010e24]/80 border border-[#a8c8ff]/10 text-[10px] text-[#c0c6d6]/70 leading-relaxed font-sans mt-3">
                <div className="flex items-center gap-1.5 text-[#00d2ff] font-semibold mb-1">
                  <i className="fa-solid fa-shield-halved text-[11px]"></i>
                  <span>Radiodifusión Regulada & Derechos de Autor</span>
                </div>
                <span>
                  Emisora de radiodifusión sonora regulada por <strong>SUBTEL Chile</strong>. Contenidos musicales y fonogramas protegidos por la Ley N° 17.336 de Propiedad Intelectual (SCD / Profovi / ChileActores).
                </span>
              </div>

              <div className="pt-4 mt-2 border-t border-[#a8c8ff]/15 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#c0c6d6]/60">
                <p>
                  © {new Date().getFullYear()} {currentConfig.stationName || 'Radio Puerto Quidico'} {currentConfig.frequencyPrimary}. Todos los derechos reservados.
                </p>
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="hover:text-[#00d2ff] text-[#a8c8ff]/70 transition-colors flex items-center gap-1.5 cursor-pointer font-['Inter',sans-serif] text-[11px] bg-[#1c2a41]/70 hover:bg-[#1c2a41] px-2.5 py-1 rounded-lg border border-[#a8c8ff]/20 shadow-sm"
                  title="Panel de Emisora (Acceso Exclusivo de Cabina)"
                >
                  <i className="fa-solid fa-lock text-[10px] text-[#00d2ff]"></i>
                  <span>Panel Emisora</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
