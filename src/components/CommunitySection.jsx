import React from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useRadioConfig } from '../context/RadioConfigContext';

export const CommunitySection = ({ onOpenRequestModal }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const notices = currentConfig.communityNotices || RADIO_CONFIG.communityNotices;

  const emergencyPhones = [
    { name: 'Cesfam Tirúa', phone: '+56 41 261 1400', icon: 'fa-solid fa-hospital' },
    { name: 'Posta Quidico', phone: '+56 41 261 1450', icon: 'fa-solid fa-user-doctor' },
    { name: 'Capitanía de Puerto', phone: '137', icon: 'fa-solid fa-anchor' },
    { name: 'Bomberos Tirúa', phone: '132', icon: 'fa-solid fa-fire-extinguisher' },
    { name: 'Carabineros Tirúa', phone: '133', icon: 'fa-solid fa-shield-halved' },
    { name: 'Cabina Radio Quidico', phone: currentConfig.contact?.whatsappDisplay || currentConfig.contact?.phoneCabina, icon: 'fa-solid fa-microphone' },
  ];

  return (
    <section id="avisos" className="py-20 md:py-24 bg-[#010e24]/85 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Estilo StreamingHD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6bf22]/15 border border-[#f6bf22]/30 text-[#f6bf22] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-bullhorn text-[11px]"></i>
              <span>Servicio a la Comunidad & Utilidad Pública</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Avisos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f6bf22] via-[#ffdf99] to-white">Comunidad Tirúa</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-xl leading-relaxed">
              Espacio comunitario para difusión de beneficios sociales, reuniones de juntas vecinales y avisos prioritarios de la zona.
            </p>
          </div>

          <button
            onClick={onOpenRequestModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f6bf22] to-[#ffc837] hover:brightness-110 text-[#3f2e00] font-['Montserrat',sans-serif] font-black uppercase text-xs px-6 py-3.5 rounded-full shadow-lg shadow-[#f6bf22]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
            <span>Publicar un Aviso o Saludo</span>
          </button>
        </div>

        {/* Tablón de Avisos en Tarjetas Minimalistas (sh-card) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`sh-card rounded-3xl p-6 sm:p-7 relative transition-all duration-300 flex flex-col justify-between ${
                notice.urgent
                  ? 'border border-[#ffb4ab]/40 bg-gradient-to-br from-[#1c2a41]/90 to-[#071933]/90 shadow-[0_10px_35px_rgba(255,84,73,0.15)]'
                  : 'border border-[#a8c8ff]/12 bg-gradient-to-br from-[#071933]/90 via-[#041329]/90 to-[#010e24]'
              }`}
            >
              <div className="ambient-glow" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  {notice.urgent ? (
                    <span className="inline-flex items-center gap-1.5 bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/40 text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff5449] animate-ping"></span>
                      Aviso Prioritario
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30 text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Comunidad
                    </span>
                  )}

                  <span className="text-xs text-[#a8c8ff]/70 font-['Inter',sans-serif]">
                    {notice.date}
                  </span>
                </div>

                <h3 className="font-['Montserrat',sans-serif] font-bold text-xl uppercase tracking-tight text-white mb-2 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-[#c0c6d6] leading-relaxed font-['Inter',sans-serif]">
                  {notice.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Teléfonos de Emergencia con Tarjeta Glass Minimalista (sh-card) */}
        <div className="sh-card rounded-3xl p-6 sm:p-8 border border-[#a8c8ff]/15 bg-gradient-to-r from-[#071933]/90 via-[#041329]/90 to-[#071933]/90 shadow-2xl">
          <div className="ambient-glow" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#00d2ff]/10 text-[#00d2ff] flex items-center justify-center">
              <i className="fa-solid fa-phone-volume text-lg"></i>
            </div>
            <div>
              <h3 className="font-['Montserrat',sans-serif] font-black text-xl uppercase tracking-tight text-white">
                Teléfonos de Emergencias & Red Asistencial en Tirúa
              </h3>
              <p className="text-xs text-[#c0c6d6] mt-0.5 font-['Inter',sans-serif]">
                Canales de auxilio y contacto directo ante cualquier eventualidad en el territorio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {emergencyPhones.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#010e24]/90 border border-[#a8c8ff]/12 rounded-2xl p-4 text-center flex flex-col justify-between hover:border-[#00d2ff]/40 transition-all duration-300"
              >
                <i className={`${item.icon} text-[#00d2ff] text-xl mx-auto mb-2`}></i>
                <div className="text-xs font-semibold text-[#d6e3ff] line-clamp-1 font-['Montserrat',sans-serif]">
                  {item.name}
                </div>
                <a
                  href={`tel:${item.phone.replace(/\s+/g, '')}`}
                  className="mt-2 text-xs font-mono font-bold text-[#f6bf22] hover:underline"
                >
                  {item.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
