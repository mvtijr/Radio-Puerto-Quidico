import React from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const QuidicoTVSection = ({ onOpenRequestModal }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const tvImage = currentConfig.branding?.tvMockImage || '/images/originales_blog/youtube-puerto-quidico-tv.jpg';
  const youtubeUrl = currentConfig.contact?.socialLinks?.youtube || RADIO_CONFIG.contact.socialLinks.youtube;

  return (
    <section id="quidico-tv" className="py-20 md:py-24 bg-[#041329]/80 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de Quidico TV Estilo StreamingHD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-tv text-[11px]"></i>
              <span>Canal Audiovisual Oficial</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Puerto Quidico <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff]">TV HD</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-xl leading-relaxed">
              Mira nuestras transmisiones simultáneas en directo, reportajes costeros, entrevistas en estudio y las mejores postales de Tirúa y Quidico.
            </p>
          </div>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-['Montserrat',sans-serif] font-bold uppercase text-xs px-6 py-3.5 rounded-full shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
          >
            <i className="fa-brands fa-youtube text-base"></i>
            <span>Suscribirse al Canal</span>
          </a>
        </div>

        {/* Grilla de Video y Estudio en Vivo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Pantalla de Video Principal con estilo sh-card y Browser Frame */}
          <div className="lg:col-span-8 sh-card rounded-3xl overflow-hidden border border-[#a8c8ff]/15 bg-[#010e24] shadow-2xl relative group">
            
            {/* Barra superior de frame de video */}
            <div className="px-5 py-3 bg-[#010e24] border-b border-[#a8c8ff]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-[11px] font-mono text-[#a5e7ff] ml-2">stream.youtube.com/quidicotv</span>
              </div>
              <span className="text-[10px] font-['Montserrat',sans-serif] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                1080p 60FPS
              </span>
            </div>

            {/* Contenedor del Video */}
            <div className="aspect-video relative flex items-center justify-center bg-[#071933]">
              
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: `url('${tvImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010e24] via-[#010e24]/30 to-transparent" />

              {/* Botón Central de Play hacia YouTube */}
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reproducir en Canal de YouTube Puerto Quidico TV"
                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff0000] to-[#ff4e4e] hover:brightness-110 text-white flex items-center justify-center text-2xl shadow-[0_0_35px_rgba(255,0,0,0.6)] transform group-hover:scale-110 transition-all border-2 border-white cursor-pointer"
              >
                <i className="fa-solid fa-play ml-1"></i>
              </a>

              {/* Overlays UI de video */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="bg-[#00d2ff] text-[#002955] text-xs font-['Montserrat',sans-serif] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span> QUIDICO TV EN VIVO
                </span>
              </div>

              {/* Barra inferior del video */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#c0c6d6]">
                <div className="flex items-center gap-2 bg-[#010e24]/85 px-3 py-1.5 rounded-full backdrop-blur-md border border-[#a8c8ff]/15">
                  <i className="fa-solid fa-eye text-[#00d2ff]"></i>
                  <span className="text-[11px] font-medium">Transmitiendo para Tirúa, Quidico y el mundo</span>
                </div>
                
                <a 
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors bg-[#010e24]/85 px-3 py-1.5 rounded-full border border-[#a8c8ff]/15 flex items-center gap-1.5 text-[11px] font-semibold text-[#a5e7ff]"
                  title="Abrir en YouTube"
                >
                  <span>Abrir en YouTube</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>

            </div>
          </div>

          {/* Columna Lateral / Datos del Estudio en Vivo (sh-card) */}
          <div className="lg:col-span-4">
            <div className="sh-card p-6 sm:p-8 rounded-3xl border border-[#a8c8ff]/15 shadow-xl bg-gradient-to-br from-[#071933]/90 via-[#041329]/90 to-[#010e24] space-y-5">
              <div className="ambient-glow" />

              <div className="flex items-center justify-between pb-3 border-b border-[#a8c8ff]/15">
                <h3 className="font-['Montserrat',sans-serif] font-bold text-xl uppercase tracking-tight text-white">
                  EN ESTUDIO
                </h3>
                <span className="text-[10px] font-['Montserrat',sans-serif] bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  AL AIRE
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                  <span className="text-[#00d2ff] text-[10px] font-bold uppercase tracking-wider block font-['Montserrat',sans-serif]">
                    Programa Principal
                  </span>
                  <p className="font-bold text-white text-base font-['Montserrat',sans-serif] mt-1">
                    "Conexión Arauco & Costa Viva"
                  </p>
                  <p className="text-xs text-[#c0c6d6] mt-1.5 leading-relaxed font-['Inter',sans-serif]">
                    Noticias costeras, música chilena y latina, informes meteorológicos y entrevistas comunitarias.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                  <span className="text-[#a5e7ff] text-[10px] uppercase tracking-wider block font-['Montserrat',sans-serif] font-bold">
                    Línea Directa en Cabina
                  </span>
                  <p className="font-bold text-white text-base font-mono mt-1">
                    {currentConfig.contact?.whatsappDisplay || '+569 6267 9087'}
                  </p>
                  <p className="text-xs text-[#f6bf22] mt-1 flex items-center gap-1.5 font-medium">
                    <i className="fa-brands fa-whatsapp text-emerald-400"></i> WhatsApp disponible las 24 horas
                  </p>
                </div>

                {/* Botón de Saludo en Vivo en Píldora */}
                <button
                  onClick={onOpenRequestModal}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] font-['Montserrat',sans-serif] font-black uppercase text-xs tracking-wider py-3.5 rounded-full transition-all shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <i className="fa-regular fa-comment-dots text-sm"></i>
                  <span>Enviar Saludo a la Pantalla</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
