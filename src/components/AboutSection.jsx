import React from 'react';
import { 
  Radio, 
  MapPin, 
  Heart, 
  Wifi, 
  Compass, 
  Award,
  Globe2,
  Share2
} from 'lucide-react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const AboutSection = () => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const webBanner = currentConfig.branding?.webBanner || '/images/originales_blog/header-banner.jpg';

  return (
    <section id="nosotros" className="py-20 md:py-24 bg-[#041329]/80 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Panorámico Oficial de la Caleta y Emisora en Tarjeta Minimalista */}
        <div className="mb-14 rounded-3xl overflow-hidden border border-[#a8c8ff]/20 shadow-2xl relative group bg-[#010e24]">
          <img 
            src={webBanner} 
            alt="Radio Puerto Quidico 105.1 FM - Caleta Quidico y Tirúa"
            className="w-full h-auto max-h-[360px] object-cover group-hover:scale-[1.01] transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#010e24] via-[#010e24]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-5 sm:left-8 flex flex-wrap items-center gap-2.5">
            <span className="bg-[#00d2ff] text-[#002955] font-['Montserrat',sans-serif] font-black text-xs uppercase px-3.5 py-1 rounded-full shadow-md">
              Identidad Costera Oficial
            </span>
            <span className="bg-[#010e24]/85 backdrop-blur-md text-[#a5e7ff] text-xs px-3.5 py-1 rounded-full border border-[#a8c8ff]/20 font-['Montserrat',sans-serif] font-medium">
              Caleta Quidico • Tirúa Costa
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Lado Izquierdo: Historia y Misión */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Nuestra Identidad & Raíces</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-['Montserrat',sans-serif] font-black text-white leading-tight">
              Una Emisora Nacida del Océano y el Compromiso con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#a5e7ff]">
                Tirúa
              </span>
            </h2>

            <p className="text-[#c0c6d6] text-sm sm:text-base leading-relaxed font-['Inter',sans-serif]">
              En la caleta de Puerto Quidico, donde el Océano Pacífico se encuentra con los valles y cerros de la comuna de Tirúa, <strong>Radio Puerto Quidico</strong> acompaña día a día a los pescadores artesanales, recolectoras de orilla, agricultores y a cada familia de nuestro territorio.
            </p>

            <p className="text-[#c0c6d6] text-sm sm:text-base leading-relaxed font-['Inter',sans-serif]">
              Somos un medio de comunicación independiente, pluralista y con vocación comunitaria. Creemos en el valor de la interculturalidad, el respeto a la cosmovisión Mapuche-Lafkenche, la memoria de nuestros mayores y el derecho a estar informados sin importar la lejanía.
            </p>

            {/* Puntos destacados en Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-[#071933]/90 border border-[#a8c8ff]/12 p-4 rounded-2xl">
                <div className="p-2.5 bg-[#f6bf22]/10 rounded-xl text-[#f6bf22]">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Montserrat',sans-serif]">Transmisión Digital y FM</h4>
                  <p className="text-xs text-[#c0c6d6] mt-0.5 font-['Inter',sans-serif]">Llegando a la comuna y al mundo entero.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#071933]/90 border border-[#a8c8ff]/12 p-4 rounded-2xl">
                <div className="p-2.5 bg-[#00d2ff]/10 rounded-xl text-[#00d2ff]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Montserrat',sans-serif]">Servicio Solidario</h4>
                  <p className="text-xs text-[#c0c6d6] mt-0.5 font-['Inter',sans-serif]">Difusión comunitaria y avisos de salud.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Lado Derecho: Tarjeta Visual de Cobertura y Territorio (sh-card) */}
          <div className="sh-card bg-gradient-to-br from-[#071933]/90 via-[#041329]/90 to-[#010e24] border border-[#a8c8ff]/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="ambient-glow" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#a8c8ff]/15">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#f6bf22]" />
                <span className="font-['Montserrat',sans-serif] font-bold text-white text-base">Territorio de Cobertura</span>
              </div>
              <span className="text-xs text-[#00d2ff] font-['Montserrat',sans-serif] font-semibold bg-[#00d2ff]/10 border border-[#00d2ff]/30 px-2.5 py-0.5 rounded-full">
                Provincia de Arauco
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#d6e3ff] font-['Inter',sans-serif]">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                <span className="font-medium text-white">Puerto Quidico & Borde Costero</span>
                <span className="text-emerald-400 font-semibold font-['Montserrat',sans-serif] text-xs">100% Cobertura</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                <span className="font-medium text-white">Urbano Tirúa & Caleta</span>
                <span className="text-emerald-400 font-semibold font-['Montserrat',sans-serif] text-xs">100% Cobertura</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                <span className="font-medium text-white">Sectores Rurales y Valle</span>
                <span className="text-emerald-400 font-semibold font-['Montserrat',sans-serif] text-xs">Señal Clara</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#010e24]/80 border border-[#a8c8ff]/10">
                <span className="font-medium text-white">Isla Mocha & Chile / Exterior</span>
                <span className="text-[#00d2ff] font-semibold font-['Montserrat',sans-serif] text-xs">Online HD 24/7</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
