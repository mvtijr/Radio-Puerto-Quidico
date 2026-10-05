import React, { useState } from 'react';
import { useOnAirMetadata } from '../hooks/useOnAirMetadata';

export const SongHistoryModal = ({ isOpen, onClose }) => {
  const { songHistory, searchYouTube, dedicateOnWhatsApp, refreshMetadata } = useOnAirMetadata();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = (songHistory || []).filter(item => {
    const q = searchTerm.toLowerCase();
    return item.song.toLowerCase().includes(q) || item.artist.toLowerCase().includes(q) || (item.genre && item.genre.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-xl animate-fadeIn">
      <div className="sh-card bg-[#071933]/95 border border-[#a8c8ff]/25 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="ambient-glow" />

        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 border-b border-[#a8c8ff]/15 relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-[10px] sm:text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-2">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>Registro de Emisión 105.1 FM</span>
            </div>
            <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl text-white leading-tight">
              ¿Qué Canción <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#a5e7ff]">Sonó Recién?</span>
            </h3>
            <p className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] mt-1 leading-relaxed">
              Consulta los últimos temas musicales emitidos al aire. Puedes buscar el videoclip o pedir la canción por WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => refreshMetadata()}
              className="w-9 h-9 rounded-full bg-[#010e24] border border-[#a8c8ff]/20 text-[#c0c6d6] hover:text-[#00d2ff] hover:border-[#00d2ff] transition-all flex items-center justify-center cursor-pointer"
              title="Actualizar canciones ahora"
            >
              <i className="fa-solid fa-arrows-rotate text-xs"></i>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#010e24] border border-[#a8c8ff]/20 text-[#c0c6d6] hover:text-white hover:border-[#00d2ff] transition-all flex items-center justify-center cursor-pointer"
              title="Cerrar ventana"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Buscador Rápido de Canciones */}
        <div className="px-5 sm:px-6 pt-4 pb-2 relative z-10">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#a5e7ff]/60"></i>
            <input
              type="text"
              placeholder="Buscar por artista, canción o ritmo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#010e24]/90 border border-[#a8c8ff]/15 rounded-full pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8a919f] focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8a919f] hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Canciones Emitidas */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 relative z-10 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-[#8a919f] text-xs">
              No se encontraron canciones que coincidan con "{searchTerm}".
            </div>
          ) : (
            filteredHistory.map((item, idx) => {
              const isCurrent = idx === 0 && !searchTerm;
              return (
                <div
                  key={item.id || idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#00d2ff]/10 border-[#00d2ff]/40 shadow-sm'
                      : 'bg-[#010e24]/75 border-[#a8c8ff]/10 hover:border-[#00d2ff]/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#00d2ff] text-[#002955]'
                        : 'bg-[#071933] text-[#a5e7ff] border border-[#a8c8ff]/15'
                    }`}>
                      <i className={`fa-solid ${isCurrent ? 'fa-music' : 'fa-compact-disc'} text-sm`}></i>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                          isCurrent
                            ? 'bg-[#f6bf22] text-[#3f2e00]'
                            : 'bg-[#071933] text-[#a8c8ff] border border-[#a8c8ff]/15'
                        }`}>
                          {item.time}
                        </span>
                        {item.genre && (
                          <span className="text-[10px] text-[#8a919f] font-['Inter',sans-serif]">
                            {item.genre}
                          </span>
                        )}
                      </div>

                      <p className="font-['Montserrat',sans-serif] font-bold text-white text-sm sm:text-base mt-0.5 truncate">
                        {item.song}
                      </p>
                      <p className="text-xs text-[#a5e7ff] font-['Inter',sans-serif] truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>

                  {/* Botones de Acción para la Canción */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => searchYouTube(item.artist, item.song)}
                      title="Buscar videoclip en YouTube"
                      className="px-3 py-1.5 rounded-full text-xs font-['Montserrat',sans-serif] font-semibold text-red-400 hover:text-white bg-red-600/10 hover:bg-red-600 border border-red-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <i className="fa-brands fa-youtube text-xs"></i>
                      <span>Clip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => dedicateOnWhatsApp(item.artist, item.song)}
                      title="Pedir o dedicar esta canción por WhatsApp"
                      className="px-3 py-1.5 rounded-full text-xs font-['Montserrat',sans-serif] font-semibold text-emerald-400 hover:text-white bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <i className="fa-brands fa-whatsapp text-xs"></i>
                      <span>Pedir</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-[#010e24]/90 border-t border-[#a8c8ff]/12 relative z-10 flex items-center justify-between text-xs text-[#8a919f]">
          <span>Actualizado en tiempo real con la transmisión FM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#071933] hover:bg-[#0e274b] text-white border border-[#a8c8ff]/20 font-['Montserrat',sans-serif] font-bold text-xs uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
