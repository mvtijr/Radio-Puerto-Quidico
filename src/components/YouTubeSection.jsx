import React from 'react';
import { ExternalLink, Play, Tv, Video } from 'lucide-react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

const YoutubeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const YouTubeSection = () => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const youtubeUrl = currentConfig.contact?.socialLinks?.youtube || RADIO_CONFIG.contact.socialLinks.youtube;
  const youtubeHandle = currentConfig.contact?.socialLinks?.youtubeHandle || RADIO_CONFIG.contact.socialLinks.youtubeHandle;
  const youtubeBanner = currentConfig.branding?.youtubeBanner || '/images/originales_blog/youtube-puerto-quidico-tv.jpg';

  return (
    <section className="py-16 bg-slate-900/40 border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Lado Izquierdo: Descripción y Llamado */}
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-xs font-semibold">
                <Tv className="w-3.5 h-3.5" />
                Señal Audiovisual & Transmisiones
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                Sintoniza Puerto Quidico TV en YouTube
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                No solo nos escuches, ¡míranos! Suscríbete al canal oficial de <strong>PuertoQuidicoTV</strong> en YouTube para ver transmisiones en vivo desde cabina, reportajes a la caleta, eventos comunitarios y actividades del mar en Tirúa.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-red-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  <YoutubeIcon className="w-5 h-5 fill-current" />
                  <span>Suscribirse al Canal ({youtubeHandle})</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </a>
              </div>
            </div>

            {/* Lado Derecho: Imagen del Banner de YouTube */}
            <div className="relative group max-w-sm w-full">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border-2 border-red-800/60 shadow-2xl group-hover:border-red-500 transition-colors bg-slate-950"
              >
                <img
                  src={youtubeBanner}
                  alt="Suscríbete a PuertoQuidicoTV en YouTube"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </a>
              <div className="absolute -bottom-3 -right-3 bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-current" />
                <span>Videos & Directos</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
