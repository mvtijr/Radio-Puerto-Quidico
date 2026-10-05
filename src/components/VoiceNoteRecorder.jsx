import React, { useState, useRef, useEffect } from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const VoiceNoteRecorder = ({ onClose }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;

  const [recorderState, setRecorderState] = useState('idle'); // 'idle' | 'recording' | 'recorded'
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Quidico');
  const [category, setCategory] = useState('saludo'); // 'saludo' | 'cancion' | 'aviso'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [waveLevels, setWaveLevels] = useState(Array(18).fill(20));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Iniciar visualizador de audio en tiempo real
  const startAudioVisualizer = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Tomar 18 frecuencias representativas
        const levels = [];
        const step = Math.max(1, Math.floor(dataArray.length / 18));
        for (let i = 0; i < 18; i++) {
          const val = dataArray[i * step] || 0;
          // Normalizar altura entre 15% y 100%
          const pct = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
          levels.push(pct);
        }
        setWaveLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (e) {
      console.warn('[Audio Visualizer Error]', e);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setWaveLevels(Array(18).fill(15));
  };

  // Comenzar a grabar
  const startRecording = async () => {
    setErrorMessage('');
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta grabación directa de micrófono.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startAudioVisualizer(stream);

      // Determinar mimeType compatible
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopAudioVisualizer();
        // Detener tracks del micrófono para apagar el indicador rojo del navegador
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecorderState('recorded');
      };

      mediaRecorder.start(250); // Emitir chunks cada 250ms
      setRecorderState('recording');
      setRecordSeconds(0);

      // Iniciar temporizador (máximo 60 segundos)
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Permite el acceso al micrófono en la barra de tu navegador.'
          : err.message || 'No fue posible acceder al micrófono.'
      );
      setRecorderState('idle');
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Reiniciar para grabar de nuevo
  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordSeconds(0);
    setRecorderState('idle');
    setIsPlayingAudio(false);
  };

  // Reproducir/Pausar audio grabado
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Formatear segundos en MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Enviar audio a la cabina
  const handleSendVoiceNote = async () => {
    if (!audioBlob) return;

    const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');
    const senderName = name.trim() || 'Auditor de Quidico';
    const senderLoc = location.trim() || 'Zona Costera';
    const categoryLabel = category === 'saludo' ? 'Cariñoso Saludo' : category === 'cancion' ? 'Petición Musical' : 'Aviso a la Comunidad';

    const messageText = `🎙️ *¡NUEVA NOTA DE VOZ PARA EL AIRE!* 📻\n` +
      `👤 *De:* ${senderName}\n` +
      `📍 *Desde:* ${senderLoc}\n` +
      `📌 *Tipo:* ${categoryLabel}\n` +
      `⏱️ *Duración:* ${formatTime(recordSeconds)}\n\n` +
      `_Grabado desde el portal web oficial www.radiopuertoquidico.cl_`;

    const fileExt = audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const fileName = `nota-voz-radio-quidico-${senderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExt}`;
    const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });

    // 1. Si soporta Web Share API con archivos (Android Chrome / iPhone Safari)
    if (navigator.canShare && navigator.canShare({ files: [audioFile] })) {
      try {
        await navigator.share({
          files: [audioFile],
          title: `Nota de Voz para ${currentConfig.station?.name || 'Radio Puerto Quidico'}`,
          text: messageText
        });
        if (onClose) onClose();
        return;
      } catch (shareErr) {
        if (shareErr.name !== 'AbortError') {
          console.warn('[WebShare fallback]', shareErr);
        }
      }
    }

    // 2. Fallback de Escritorio / WhatsApp Web: Descargar archivo y redirigir
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    // Abrir WhatsApp con mensaje predeterminado
    const waUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(
      messageText + `\n\n*(Adjunto a continuación el archivo de audio que acabo de descargar: ${fileName})*`
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    alert(`¡Tu nota de voz se descargó como "${fileName}"!\n\nSe ha abierto el WhatsApp de Radio Puerto Quidico. Solo adjunta el archivo de audio para que los locutores lo transmitan al aire.`);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Datos del Auditor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
            Tu Nombre o Familia:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Don Juan / Familia Mariñán"
            className="w-full bg-[#010e24] border border-[#a8c8ff]/25 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] mb-1 font-semibold">
            Lugar donde nos sintonizas:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: Caleta Quidico, Tirúa, Ponotro..."
            className="w-full bg-[#010e24] border border-[#a8c8ff]/25 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
          />
        </div>
      </div>

      {/* Tipo de Nota de Voz */}
      <div>
        <label className="block text-[11px] font-['Oswald',sans-serif] uppercase tracking-wider text-[#a5e7ff] mb-1.5 font-semibold">
          Motivo del Mensaje de Voz:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'saludo', label: 'Saludo al Aire', icon: 'fa-heart' },
            { id: 'cancion', label: 'Pedir Canción', icon: 'fa-music' },
            { id: 'aviso', label: 'Aviso Comunal', icon: 'fa-bullhorn' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`p-2 rounded-xl border text-xs font-['Oswald',sans-serif] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                category === item.id
                  ? 'bg-[#00d2ff] text-[#003543] font-bold border-[#00d2ff] shadow-md'
                  : 'bg-[#112036] text-[#c0c6d6] border-[#a8c8ff]/20 hover:border-[#00d2ff]'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xs`}></i>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Área Central de Grabación con Visualizador */}
      <div className="p-6 rounded-2xl bg-[#010e24] border border-[#00d2ff]/30 text-center space-y-4 shadow-inner relative overflow-hidden">
        
        {/* Visualizador de Barras de Audio */}
        <div className="h-16 flex items-center justify-center gap-1.5 px-4">
          {waveLevels.map((lvl, idx) => (
            <div
              key={idx}
              style={{ height: `${lvl}%` }}
              className={`w-1.5 sm:w-2 rounded-full transition-all duration-75 ${
                recorderState === 'recording'
                  ? 'bg-gradient-to-t from-[#ff5449] to-[#f6bf22] shadow-[0_0_8px_rgba(255,84,73,0.5)]'
                  : recorderState === 'recorded'
                  ? 'bg-gradient-to-t from-[#00d2ff] to-[#3491ff]'
                  : 'bg-[#1c2a41]'
              }`}
            />
          ))}
        </div>

        {/* Temporizador y Estado */}
        <div className="flex items-center justify-center gap-2">
          {recorderState === 'recording' && (
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          )}
          <span className={`font-mono text-2xl font-bold tracking-widest ${
            recorderState === 'recording' ? 'text-rose-400' : 'text-white'
          }`}>
            {formatTime(recordSeconds)}
          </span>
          <span className="text-xs text-[#8a919f] font-mono">/ 01:00</span>
        </div>

        {/* Instrucción dinámica */}
        <p className="text-xs text-[#a5e7ff] font-['Inter',sans-serif]">
          {recorderState === 'idle' && 'Pulsa el botón rojo para comenzar a grabar tu saludo.'}
          {recorderState === 'recording' && '¡Habla con tranquilidad! Estamos grabando tu voz para el aire...'}
          {recorderState === 'recorded' && 'Grabación lista. Puedes escucharla antes de enviarla a cabina.'}
        </p>

        {/* Botones de Control de Grabación */}
        <div className="flex items-center justify-center gap-4 pt-1">
          {recorderState === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-2xl shadow-[0_0_24px_rgba(225,29,72,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer group"
              title="Comenzar a grabar"
            >
              <i className="fa-solid fa-microphone group-hover:scale-110 transition-transform"></i>
            </button>
          )}

          {recorderState === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Detener grabación"
            >
              <i className="fa-solid fa-stop"></i>
            </button>
          )}

          {recorderState === 'recorded' && (
            <div className="flex items-center gap-3">
              {/* Botón Escuchar */}
              <button
                type="button"
                onClick={togglePlayAudio}
                className="px-4 py-2.5 rounded-xl bg-[#1c2a41] hover:bg-[#2c3951] text-[#00d2ff] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <i className={`fa-solid ${isPlayingAudio ? 'fa-pause' : 'fa-play'}`}></i>
                {isPlayingAudio ? 'Pausar' : 'Escuchar'}
              </button>

              {/* Botón Grabar de Nuevo */}
              <button
                type="button"
                onClick={resetRecording}
                className="px-4 py-2.5 rounded-xl bg-[#1c2a41] hover:bg-rose-950 text-[#ffb4ab] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Borrar y Regrabar
              </button>
            </div>
          )}
        </div>

        {/* Reproductor de audio invisible */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
        )}

        {/* Error de micrófono si ocurre */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-[#ffb4ab]">
            <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Botón de Envío Directo a WhatsApp */}
      {recorderState === 'recorded' && (
        <button
          type="button"
          onClick={handleSendVoiceNote}
          className="w-full bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] font-['Oswald',sans-serif] font-bold text-sm uppercase py-3.5 px-6 rounded-2xl shadow-[0_4px_24px_rgba(246,191,34,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 animate-fadeIn"
        >
          <i className="fa-brands fa-whatsapp text-xl"></i>
          <span>Enviar Nota de Voz al WhatsApp de Cabina</span>
        </button>
      )}

      {/* Nota de Ayuda Comunitaria */}
      <div className="text-[11px] text-[#8a919f] text-center font-['Inter',sans-serif]">
        💡 <strong className="text-white">Tip para vecinos y pescadores:</strong> Tu mensaje se enviará directamente a los locutores de Radio Puerto Quidico para ser emitido en el programa en vivo.
      </div>
    </div>
  );
};
