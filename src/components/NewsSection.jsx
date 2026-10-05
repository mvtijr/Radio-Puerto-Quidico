import React, { useState } from 'react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useRadioConfig } from '../context/RadioConfigContext';

export const NewsSection = () => {
  const { config } = useRadioConfig();
  const newsList = config?.news || RADIO_CONFIG.news;
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <section id="noticias" className="py-20 md:py-24 bg-[#041329]/80 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de Noticias Estilo StreamingHD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-newspaper text-[11px]"></i>
              <span>Prensa & Actualidad Costera</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Noticias de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff]">la Costa</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-xl leading-relaxed">
              Mantente informado con los acontecimientos más relevantes de Caleta Quidico, Tirúa, Cañete e Isla Mocha.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#071933] border border-[#a8c8ff]/15 text-[#a5e7ff] text-xs font-['Montserrat',sans-serif] font-semibold self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]"></span>
            Edición Informativa 105.1 FM
          </span>
        </div>

        {/* Grilla de Noticias con Tarjetas Minimalistas (sh-card) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {newsList.map((item, idx) => (
            <article 
              key={item.id || idx}
              onClick={() => setSelectedArticle(item)}
              className="sh-card rounded-3xl overflow-hidden border border-[#a8c8ff]/12 group hover:border-[#00d2ff]/40 transition-all shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div className="ambient-glow" />

              <div>
                <div className="h-48 bg-[#010e24] relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010e24]/80 via-transparent to-transparent pointer-events-none" />
                  
                  <span className="absolute top-3.5 left-3.5 bg-[#00d2ff] text-[#002955] font-['Montserrat',sans-serif] text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full shadow-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-6">
                  <span className="text-[11px] text-[#a8c8ff]/70 block font-['Inter',sans-serif] font-medium">
                    {item.date}
                  </span>
                  <h3 className="font-['Montserrat',sans-serif] font-bold text-lg text-white mt-2 group-hover:text-[#00d2ff] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#c0c6d6] mt-2.5 leading-relaxed font-['Inter',sans-serif] line-clamp-3">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 flex items-center justify-between text-xs text-[#00d2ff] font-['Montserrat',sans-serif] font-bold border-t border-[#a8c8ff]/10">
                <span>Leer Noticia Completa</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Modal Lector de Noticia Estilo StreamingHD */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010e24]/85 backdrop-blur-xl animate-fadeIn">
          <div className="sh-card bg-[#071933]/95 border border-[#a8c8ff]/25 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <div className="ambient-glow" />

            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#010e24] border border-[#a8c8ff]/20 text-[#c0c6d6] hover:text-white hover:border-[#00d2ff] transition-all flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            <span className="inline-block bg-[#00d2ff]/15 text-[#00d2ff] text-xs font-bold px-3 py-1 rounded-full border border-[#00d2ff]/30 mb-3 font-['Montserrat',sans-serif] uppercase tracking-wider">
              {selectedArticle.category}
            </span>

            <h3 className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl text-white mb-2 leading-tight">
              {selectedArticle.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-[#a8c8ff]/80 mb-5 pb-3 border-b border-[#a8c8ff]/15 font-['Inter',sans-serif]">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>Por: {selectedArticle.author}</span>
            </div>

            <div className="rounded-2xl overflow-hidden mb-5 h-64 bg-[#010e24] border border-[#a8c8ff]/15">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-[#d6e3ff] text-sm leading-relaxed mb-4 font-['Inter',sans-serif]">
              {selectedArticle.summary}
            </p>
            <p className="text-[#c0c6d6] text-xs leading-relaxed font-['Inter',sans-serif]">
              Para ampliación de esta noticia y despachos en vivo desde la Caleta de Quidico y sectores rurales de Tirúa, mantén sintonizada la 105.1 FM o comunícate con nuestro departamento de prensa a través de WhatsApp.
            </p>

            <div className="mt-6 pt-4 border-t border-[#a8c8ff]/15 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-[#00d2ff] hover:brightness-110 text-[#002955] text-xs font-['Montserrat',sans-serif] font-bold px-6 py-2.5 rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
