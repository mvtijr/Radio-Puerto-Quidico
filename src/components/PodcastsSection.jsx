import React from 'react';
import { Headphones, Play, Pause, Clock, Calendar, Sparkles, Volume2 } from 'lucide-react';
import { RADIO_CONFIG } from '../config/radioConfig';
import { useAudio } from '../context/AudioContext';

export const PodcastsSection = () => {
  const { 
    playbackMode, 
    currentPodcast, 
    isPlaying, 
    playPodcast, 
    togglePlayLive 
  } = useAudio();

  const handlePodcastClick = (podcast) => {
    if (playbackMode === 'podcast' && currentPodcast?.id === podcast.id) {
      togglePlayLive();
    } else {
      playPodcast(podcast);
    }
  };

  return (
    <section id="podcasts" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5" />
            Podcasts & Archivo Sonoro
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Escucha Nuestros Programas Grabados
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Si te perdiste alguna de nuestras transmisiones especiales, reportajes de Isla Mocha o testimonios de nuestros ancianos y pescadores, puedes revivirlos aquí.
          </p>
        </div>

        {/* Grilla de Podcasts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {RADIO_CONFIG.podcasts.map((pod) => {
            const isThisPodcastActive = playbackMode === 'podcast' && currentPodcast?.id === pod.id;
            const isThisPodcastPlaying = isThisPodcastActive && isPlaying;

            return (
              <div
                key={pod.id}
                className={`bg-slate-900/60 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isThisPodcastActive
                    ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Portada */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800 group">
                    <img
                      src={pod.cover}
                      alt={pod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                    {/* Botón flotante de play sobre la imagen */}
                    <button
                      onClick={() => handlePodcastClick(pod)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      {isThisPodcastPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <span className="absolute top-3 left-3 bg-slate-950/80 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                      {pod.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {pod.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {pod.date}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2">
                      {pod.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {pod.description}
                    </p>
                  </div>
                </div>

                {/* Pie de tarjeta con estado */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/50 flex items-center justify-between">
                  {isThisPodcastPlaying ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Reproduciendo ahora
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Audio bajo demanda</span>
                  )}

                  <button
                    onClick={() => handlePodcastClick(pod)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {isThisPodcastPlaying ? 'Pausar' : 'Escuchar audio'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
