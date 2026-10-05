import React, { useState, useEffect } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

export const SongRequestModal = ({ isOpen, onClose, initialTab = 'text' }) => {
  const { config } = useRadioConfig();
  const [activeMode, setActiveMode] = useState(initialTab); // 'text' | 'voice'
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Quidico');
  const [messageType, setMessageType] = useState('cancion'); // 'cancion' | 'saludo' | 'aviso'
  const [details, setDetails] = useState('');
  const [copied, setCopied] = useState(false);

  // Cooldown Antispam (45 segundos) para proteger la cabina
  const COOLDOWN_SECONDS = 45;
  const [cooldownRemaining, setCooldownRemaining] = useState(() => {
    try {
      const last = parseInt(localStorage.getItem('rpq_last_request_sent_ts') || '0', 10);
      const remaining = Math.ceil((last + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialTab || 'text');
      // Recalcular cooldown al abrir por si transcurrió el tiempo
      try {
        const last = parseInt(localStorage.getItem('rpq_last_request_sent_ts') || '0', 10);
        const remaining = Math.ceil((last + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
        setCooldownRemaining(remaining > 0 ? remaining : 0);
      } catch {}
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const buildWhatsAppMessage = () => {
    let text = `¡Hola ${config.station?.name || 'Radio Puerto Quidico'} ${config.station?.dial || '105.1 FM'}! 👋\n`;
    text += `📻 Les escribe: ${name.trim() || 'Un auditor'}\n`;
    text += `📍 Desde: ${location}\n\n`;

    if (messageType === 'cancion') {
      text += `🎵 Quiero pedir una canción para escuchar en vivo:\n"${details.trim() || 'Un buen tema musical'}"`;
    } else if (messageType === 'saludo') {
      text += `❤️ Quiero enviar un cariñoso saludo al aire:\n"${details.trim() || 'Muchos saludos a toda la sintonía'}"`;
    } else {
      text += `📢 Aviso para la comunidad / utilidad pública:\n"${details.trim() || 'Aviso comunitario'}"`;
    }

    return text;
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    try {
      localStorage.setItem('rpq_last_request_sent_ts', Date.now().toString());
      setCooldownRemaining(COOLDOWN_SECONDS);
    } catch {}

    const rawNumber = (config.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopy = () => {
    const message = buildWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d1c32] border border-[#a8c8ff]/30 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Encabezado con Logo Oficial */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-2xl p-0.5 ring-2 ring-[#00d2ff]/60 shadow-lg overflow-hidden shrink-0">
            <img 
              src={config.branding?.logo || '/logo.png'} 
              alt={config.station?.name || 'Radio Puerto Quidico'} 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c2a41] border border-[#00d2ff]/30 text-[10px] font-['Oswald',sans-serif] uppercase font-bold text-[#00d2ff] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cabina Central en Vivo
            </div>
            <h3 className="text-lg sm:text-xl font-['Anton',sans-serif] uppercase tracking-wide text-white leading-tight">
              {config.station?.name || 'RADIO PUERTO QUIDICO'}
            </h3>
            <p className="text-xs text-[#a5e7ff] font-['Oswald',sans-serif]">
              {config.station?.dial || '105.1 FM'} • {config.contact?.whatsappDisplay || '+569 6267 9087'}
            </p>
          </div>
        </div>

        {/* Selector de Modo: Texto vs Nota de Voz */}
        <div className="flex rounded-2xl bg-[#010e24] p-1.5 border border-[#a8c8ff]/20 mb-5">
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'text'
                ? 'bg-[#00d2ff] text-[#003543] shadow-md'
                : 'text-[#c0c6d6] hover:text-white'
            }`}
          >
            <i className="fa-regular fa-message text-sm"></i>
            <span>Mensaje de Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('voice')}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeMode === 'voice'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                : 'text-[#c0c6d6] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <i className="fa-solid fa-microphone text-sm"></i>
            <span>Grabar Nota de Voz</span>
            <span className="text-[9px] bg-rose-950/80 text-rose-200 px-1.5 py-0.5 rounded uppercase font-sans font-extrabold hidden sm:inline">
              Al Aire
            </span>
          </button>
        </div>

        {/* Contenido según el Modo */}
        {activeMode === 'voice' ? (
          <VoiceNoteRecorder onClose={onClose} />
        ) : (
          <form onSubmit={handleSendWhatsApp} className="space-y-4 animate-fadeIn">
            {/* Tipo de solicitud */}
            <div>
              <label className="block text-xs font-semibold text-[#c0c6d6] mb-2 font-['Oswald',sans-serif] uppercase tracking-wider">
                ¿Qué deseas enviar a los locutores?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMessageType('cancion')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
                    messageType === 'cancion'
                      ? 'bg-[#00d2ff] text-[#003543] border-[#00d2ff] font-bold shadow'
                      : 'bg-[#112036] text-[#c0c6d6] border-[#a8c8ff]/20 hover:border-[#00d2ff]'
                  }`}
                >
                  <i className="fa-solid fa-music mb-1 text-sm"></i>
                  Pedir Tema
                </button>

                <button
                  type="button"
                  onClick={() => setMessageType('saludo')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
                    messageType === 'saludo'
                      ? 'bg-[#00d2ff] text-[#003543] border-[#00d2ff] font-bold shadow'
                      : 'bg-[#112036] text-[#c0c6d6] border-[#a8c8ff]/20 hover:border-[#00d2ff]'
                  }`}
                >
                  <i className="fa-regular fa-heart mb-1 text-sm"></i>
                  Mandar Saludo
                </button>

                <button
                  type="button"
                  onClick={() => setMessageType('aviso')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
                    messageType === 'aviso'
                      ? 'bg-[#00d2ff] text-[#003543] border-[#00d2ff] font-bold shadow'
                      : 'bg-[#112036] text-[#c0c6d6] border-[#a8c8ff]/20 hover:border-[#00d2ff]'
                  }`}
                >
                  <i className="fa-solid fa-bullhorn mb-1 text-sm"></i>
                  Aviso Social
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-[#c0c6d6] mb-1 font-['Oswald',sans-serif] uppercase tracking-wider">
                Tu Nombre o Familia:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Don Pedro / Familia Marilao"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#010e24] border border-[#a8c8ff]/25 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-colors"
              />
            </div>

            {/* Localidad */}
            <div>
              <label className="block text-xs font-semibold text-[#c0c6d6] mb-1 font-['Oswald',sans-serif] uppercase tracking-wider">
                Sector desde donde nos escuchas:
              </label>
              <input
                type="text"
                placeholder="Ej: Caleta Quidico, Tirúa Urbano, Ponotro, Isla Mocha..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#010e24] border border-[#a8c8ff]/25 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-colors"
              />
            </div>

            {/* Detalle */}
            <div>
              <label className="block text-xs font-semibold text-[#c0c6d6] mb-1 font-['Oswald',sans-serif] uppercase tracking-wider">
                {messageType === 'cancion' && 'Canción y artista que quieres escuchar:'}
                {messageType === 'saludo' && 'Escribe tus saludos para que los lean al aire:'}
                {messageType === 'aviso' && 'Detalle del aviso comunitario:'}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  messageType === 'cancion'
                    ? 'Ej: Los Charros de Lumaco - Cómo dejar de amarte'
                    : 'Escribe tu mensaje con detalles...'
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#010e24] border border-[#a8c8ff]/25 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-colors"
              />
            </div>

            {/* Botones de Envío */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={cooldownRemaining > 0}
                className={`flex-1 flex items-center justify-center gap-2 font-['Oswald',sans-serif] font-bold text-sm uppercase py-3 px-5 rounded-xl shadow-lg transition-all ${
                  cooldownRemaining > 0
                    ? 'bg-[#1c2a41] text-[#8a919f] border border-[#a8c8ff]/20 cursor-not-allowed opacity-80'
                    : 'bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {cooldownRemaining > 0 ? (
                  <>
                    <i className="fa-solid fa-hourglass-half text-amber-400 text-sm animate-pulse"></i>
                    <span>Espera {cooldownRemaining}s para volver a enviar</span>
                  </>
                ) : (
                  <>
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    <span>Enviar a WhatsApp ({config.contact?.whatsappDisplay || '+569 6267 9087'})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] text-xs font-semibold py-3 px-4 rounded-xl transition-colors font-['Oswald',sans-serif] uppercase cursor-pointer"
              >
                <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {cooldownRemaining > 0 && (
              <p className="text-[11px] text-amber-300/90 font-['Inter',sans-serif] text-center flex items-center justify-center gap-1.5 pt-1 bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-3">
                <i className="fa-solid fa-shield-halved text-amber-400 text-xs"></i>
                <span>Protección antispam de cabina activa. Podrás enviar otra solicitud en <strong>{cooldownRemaining}s</strong>.</span>
              </p>
            )}
          </form>
        )}

      </div>
    </div>
  );
};
