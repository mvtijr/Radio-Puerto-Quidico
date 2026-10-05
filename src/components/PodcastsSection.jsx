import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const PodcastsSection = () => {
  const { config } = useRadioConfig();
  const rawPodcasts = config?.podcasts || RADIO_CONFIG.podcasts || [];

  const {
    playbackMode,
    currentPodcast,
    isPlaying,
    playPodcast,
    togglePlayLive,
    podcastProgress
  } = useAudio();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categorías disponibles
  const categories = [
    { id: 'all', label: 'Todos los Pódcasts' },
    { id: 'historia', label: 'Historia Local' },
    { id: 'reportaje', label: 'Reportajes Especiales' },
    { id: 'comunidad', label: 'Comunidad & Autoridades' },
    { id: 'musica', label: 'Música & Entretención' }
  ];

  const handlePodcastClick = (podcast) => {
    if (playbackMode === 'podcast' && currentPodcast?.id === podcast.id) {
      togglePlayLive();
    } else {
      playPodcast(podcast);
    }
  };

  const handleShareWhatsApp = (podcast) => {
    const text = encodeURIComponent(
      `🎙️ Te comparto este programa grabado de Radio Puerto Quidico (105.1 FM / 91.3 FM):\n\n"${podcast.title}" (${podcast.duration})\n\nEscúchalo aquí: https://radio-puerto-quidico.vercel.app/#podcasts`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Filtrado de programas
  const filteredPodcasts = rawPodcasts.filter((pod) => {
    // Filtro por categoría
    if (filter === 'historia' && !pod.category?.toLowerCase().includes('historia')) return false;
    if (filter === 'reportaje' && !pod.category?.toLowerCase().includes('reportaje')) return false;
    if (filter === 'comunidad' && !pod.category?.toLowerCase().includes('comunidad') && !pod.category?.toLowerCase().includes('autoridades')) return false;
    if (filter === 'musica' && !pod.category?.toLowerCase().includes('música') && !pod.category?.toLowerCase().includes('musica')) return false;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = pod.title?.toLowerCase().includes(term);
      const matchDesc = pod.description?.toLowerCase().includes(term);
      const matchCat = pod.category?.toLowerCase().includes(term);
      return matchTitle || matchDesc || matchCat;
    }

    return true;
  });

  return (
    <section id="podcasts" className="py-20 md:py-24 bg-[#010e24]/90 backdrop-blur-md border-t border-[#a8c8ff]/12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#a8c8ff]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6bf22]/15 border border-[#f6bf22]/35 text-[#f6bf22] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-headphones text-[11px]"></i>
              <span>Radio a la Carta • Archivo Sonoro Comunitario</span>
            </div>
            
            <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Programas Grabados <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#47d6ff] to-[#a5e7ff]">& Entrevistas</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c0c6d6] font-['Inter',sans-serif] mt-2 max-w-2xl leading-relaxed">
              ¿No alcanzaste a sintonizar en vivo a las 11:00 AM? Revive los programas más escuchados, entrevistas comunales, relatos de pescadores y reportajes de Isla Mocha cuando quieras.
            </p>
          </div>

          {/* Barra de búsqueda rápida */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Buscar pódcast o tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#071933]/90 border border-[#a8c8ff]/25 focus:border-[#00d2ff] rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#8a919f] focus:outline-none transition-all shadow-inner"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#a5e7ff]/60"></i>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8a919f] hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filtros de Categorías */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`text-xs font-['Montserrat',sans-serif] font-bold px-4 py-2 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                filter === cat.id
                  ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/20'
                  : 'bg-[#071933] text-[#c0c6d6] hover:text-white hover:bg-[#071933]/80 border border-[#a8c8ff]/15'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grilla de Pódcasts y Programas Grabados */}
        {filteredPodcasts.length === 0 ? (
          <div className="bg-[#071933]/60 border border-[#a8c8ff]/15 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <i className="fa-solid fa-compact-disc text-4xl text-[#a5e7ff]/40 mb-4 animate-spin"></i>
            <h3 className="text-white font-bold text-lg font-['Montserrat',sans-serif]">No encontramos pódcasts</h3>
            <p className="text-xs text-[#c0c6d6] mt-1">
              No hay audios disponibles para el criterio de búsqueda "{searchTerm}". Prueba con otra palabra clave.
            </p>
            <button
              onClick={() => { setFilter('all'); setSearchTerm(''); }}
              className="mt-4 px-4 py-2 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-xs font-bold uppercase tracking-wider hover:bg-[#00d2ff]/30 transition-all cursor-pointer"
            >
              Ver todos los programas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPodcasts.map((pod) => {
              const isThisPodcastActive = playbackMode === 'podcast' && currentPodcast?.id === pod.id;
              const isThisPodcastPlaying = isThisPodcastActive && isPlaying;

              return (
                <article
                  key={pod.id}
                  className={`bg-[#071933]/90 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-lg ${
                    isThisPodcastActive
                      ? 'border-[#00d2ff] shadow-[0_0_25px_rgba(0,210,255,0.25)] ring-1 ring-[#00d2ff]'
                      : 'border-[#a8c8ff]/15 hover:border-[#00d2ff]/50 hover:shadow-xl'
                  }`}
                >
                  <div>
                    {/* Portada del Episodio con Botón de Play Central */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#041329]">
                      <img
                        src={pod.cover || '/images/originales_blog/header-banner.jpg'}
                        alt={pod.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/originales_blog/header-banner.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071933] via-[#071933]/30 to-transparent" />

                      {/* Botón Central Play / Pause sobre la Imagen */}
                      <button
                        type="button"
                        onClick={() => handlePodcastClick(pod)}
                        className={`absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${
                          isThisPodcastPlaying
                            ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                            : 'bg-gradient-to-tr from-[#00d2ff] to-[#3491ff] text-[#002955] ring-4 ring-[#00d2ff]/30 hover:brightness-110'
                        }`}
                        title={isThisPodcastPlaying ? "Pausar pódcast" : "Escuchar este programa"}
                      >
                        <i className={`text-xl ${isThisPodcastPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play ml-0.5'}`}></i>
                      </button>

                      {/* Píldora de Categoría en la Esquina Superior */}
                      <span className="absolute top-3 left-3 bg-[#010e24]/85 text-[#00d2ff] text-[10px] font-['Montserrat',sans-serif] font-bold px-3 py-0.5 rounded-full border border-[#00d2ff]/30 backdrop-blur-md">
                        {pod.category || 'Programa Especial'}
                      </span>

                      {/* Duración */}
                      <span className="absolute bottom-3 right-3 bg-[#010e24]/90 text-[#f6bf22] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#f6bf22]/30 flex items-center gap-1">
                        <i className="fa-regular fa-clock text-[9px]"></i>
                        {pod.duration || 'Grabación'}
                      </span>
                    </div>

                    {/* Barra de progreso interactiva si este podcast está activo */}
                    {isThisPodcastActive && (
                      <div className="w-full h-1 bg-[#010e24]">
                        <div
                          className="h-full bg-gradient-to-r from-[#00d2ff] to-[#f6bf22] transition-all duration-300"
                          style={{ width: `${podcastProgress}%` }}
                        />
                      </div>
                    )}

                    {/* Metadatos y Descripción del Programa */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] text-[#a5e7ff]/70 font-['Inter',sans-serif] mb-2">
                        <i className="fa-regular fa-calendar-days text-[#00d2ff]"></i>
                        <span>{pod.date || 'Emisión Radial'}</span>
                        <span>•</span>
                        <span className="text-[#c0c6d6]">Caleta Quidico</span>
                      </div>

                      <h3 className="font-['Montserrat',sans-serif] font-black text-base sm:text-lg text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#00d2ff] transition-colors">
                        {pod.title}
                      </h3>

                      <p className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] leading-relaxed line-clamp-3">
                        {pod.description}
                      </p>
                    </div>
                  </div>

                  {/* Acciones del Episodio: Escuchar, Descargar y Compartir */}
                  <div className="px-5 pb-5 pt-3 border-t border-[#a8c8ff]/10 flex items-center justify-between gap-2">
                    {/* Botón Escuchar / Pausar */}
                    <button
                      type="button"
                      onClick={() => handlePodcastClick(pod)}
                      className={`text-xs font-['Montserrat',sans-serif] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                        isThisPodcastPlaying
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/30'
                      }`}
                    >
                      <i className={isThisPodcastPlaying ? "fa-solid fa-volume-high text-[11px] animate-pulse" : "fa-solid fa-play text-[10px]"}></i>
                      <span>{isThisPodcastPlaying ? 'En Reproducción' : 'Escuchar'}</span>
                    </button>

                    {/* Botones secundarios: Descargar audio y Compartir por WhatsApp */}
                    <div className="flex items-center gap-1.5">
                      {pod.audioUrl && (
                        <a
                          href={pod.audioUrl}
                          download={`${pod.title}.mp3`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#010e24] text-[#a5e7ff] hover:text-white hover:bg-[#00d2ff]/20 border border-[#a8c8ff]/20 flex items-center justify-center transition-all cursor-pointer"
                          title="Descargar audio para escuchar sin internet en el mar o ruta"
                        >
                          <i className="fa-solid fa-download text-xs"></i>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(pod)}
                        className="w-8 h-8 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-all cursor-pointer"
                        title="Compartir este pódcast por WhatsApp"
                      >
                        <i className="fa-brands fa-whatsapp text-xs"></i>
                      </button>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* Banner Informativo para la Comunidad */}
        <div className="mt-12 bg-gradient-to-r from-[#003543]/40 via-[#071933] to-[#010e24] border border-[#00d2ff]/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d2ff]/15 border border-[#00d2ff]/40 text-[#00d2ff] flex items-center justify-center shrink-0">
              <i className="fa-solid fa-podcast text-xl"></i>
            </div>
            <div>
              <h4 className="font-['Montserrat',sans-serif] font-black text-lg text-white">
                ¿Tienes una grabación o testimonio histórico de Quidico o Tirúa?
              </h4>
              <p className="text-xs sm:text-sm text-[#c0c6d6] font-['Inter',sans-serif] mt-1 leading-relaxed max-w-2xl">
                En Radio Puerto Quidico preservamos la memoria de nuestros navegantes, recolectoras de orilla y vecinos. Envíanos tu material sonoro para incorporarlo a nuestro archivo comunitario.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/56962679087?text=Hola%20Radio%20Puerto%20Quidico,%20tengo%20un%20audio/entrevista%20para%20Radio%20a%20la%20Carta"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i>
            <span>Enviar Audio a Cabina</span>
          </a>
        </div>

      </div>
    </section>
  );
};
