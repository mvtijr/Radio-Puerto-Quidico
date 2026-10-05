import React, { useState } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';

export const PresenterChatWidget = ({ onOpenRequestModal }) => {
  const { config } = useRadioConfig();
  const [isOpen, setIsOpen] = useState(true);

  const logoUrl = config.branding?.logo || '/logo.png';
  const stationName = config.station?.name || 'Radio Puerto Quidico';

  if (!isOpen) {
    return (
      <aside className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-white p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.4)] border-2 border-[#00d2ff] hover:scale-110 transition-transform overflow-hidden relative group cursor-pointer"
          title={`Abrir contacto con ${stationName}`}
        >
          <img src={logoUrl} alt={stationName} className="w-full h-full object-cover rounded-full" />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#010e24] rounded-full animate-pulse"></span>
        </button>
      </aside>
    );
  }

  return (
    <aside 
      className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end group animate-fadeIn" 
      data-purpose="live-host-chat-bubble"
    >
      <div className="flex flex-col items-end space-y-2">
        
        {/* Host Capsule Badge */}
        <div className="bg-[#112036] text-[#d6e3ff] rounded-full py-1.5 px-3.5 shadow-2xl flex items-center gap-2 border border-[#00d2ff]/30">
          <div className="w-6 h-6 rounded-full bg-white p-0.5 overflow-hidden shadow ring-1 ring-[#00d2ff] shrink-0">
            <img src={logoUrl} alt={stationName} className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-xs font-semibold font-['Inter',sans-serif] text-[#a5e7ff]">
            Peter Brady & DJ Dino
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar chat"
            className="ml-1 text-[#c0c6d6] hover:text-white transition-colors text-xs p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Dialogue Bubble */}
        <div className="bg-[#1c2a41]/95 backdrop-blur-md text-[#d6e3ff] p-4 rounded-2xl rounded-tr-none shadow-2xl max-w-xs text-xs border border-[#a8c8ff]/20">
          <p className="leading-relaxed text-[#c0c6d6] font-['Inter',sans-serif]">
            Hola. Si tienes alguna duda, quieres pedir tu canción o mandar un saludo al aire, ponte en contacto directo con nosotros a cabina.
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#a8c8ff]/15 flex items-center justify-between gap-1.5 font-['Inter',sans-serif]">
            <span className="text-[10px] text-[#00d2ff] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En línea
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenRequestModal('voice')}
                title="Grabar nota de voz al aire"
                className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 shadow hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-['Oswald',sans-serif]"
              >
                <i className="fa-solid fa-microphone text-xs"></i>
                <span>Grabar Voz</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenRequestModal('text')}
                className="bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 shadow-md font-['Inter',sans-serif] uppercase tracking-wide hover:scale-105 active:scale-95 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-xs"></i>
                <span>Escribir</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};
