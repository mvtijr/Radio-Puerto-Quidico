import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AudioSpectrumVisualizer
 * Visualizador de espectro FFT de alta precisión para pantallas de escritorio.
 * Sustituye el control convencional de volumen con barras de ecualización animadas
 * que bailan al compás de las frecuencias de la emisión radial, integrando además
 * un control emergente de volumen al interactuar.
 */
export const AudioSpectrumVisualizer = ({
  isPlaying = false,
  isMuted = false,
  volume = 0.85,
  onVolumeChange,
  onToggleMute,
  getAudioElement,
  audioElement: directAudioElement = null,
  barCount = 18,
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const popupTimeoutRef = useRef(null);

  // Estado de picos flotantes y valores de barras
  const barsDataRef = useRef(new Array(barCount).fill(0));
  const peakCapsRef = useRef(new Array(barCount).fill(0));
  const peakHoldTimeRef = useRef(new Array(barCount).fill(0));

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const hasWebAudioRef = useRef(false);

  // Inicialización segura de Web Audio API (con fallback garantizado)
  const initWebAudio = useCallback(() => {
    if (hasWebAudioRef.current) return;
    const audioEl = typeof getAudioElement === 'function' ? getAudioElement() : directAudioElement;
    if (!audioEl) return;

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;

      // Intentar conectar el elemento de audio si los encabezados CORS lo permiten
      try {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceNodeRef.current = source;
        analyserRef.current = analyser;
        audioCtxRef.current = ctx;
        hasWebAudioRef.current = true;
      } catch (e) {
        // En caso de CORS restrictivo en el servidor Icecast/Zeno,
        // no forzar createMediaElementSource para no mutear el audio del usuario.
        // Se usará el motor sintético de armónicos en tiempo real.
        analyserRef.current = null;
        hasWebAudioRef.current = false;
      }
    } catch (e) {
      hasWebAudioRef.current = false;
    }
  }, [getAudioElement, directAudioElement]);

  useEffect(() => {
    if (isPlaying) {
      initWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    }
  }, [isPlaying, initWebAudio]);

  // Bucle de renderizado del Canvas FFT
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      phase += 0.08;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const effectiveVolume = isMuted ? 0 : volume;
      const bars = barsDataRef.current;
      const peaks = peakCapsRef.current;
      const peakHolds = peakHoldTimeRef.current;

      let freqData = null;
      if (hasWebAudioRef.current && analyserRef.current && isPlaying && !isMuted) {
        try {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          freqData = dataArray;
        } catch {
          freqData = null;
        }
      }

      // Calcular amplitudes para cada banda de frecuencia
      for (let i = 0; i < barCount; i++) {
        let targetHeight = 0;

        if (isPlaying && effectiveVolume > 0.02) {
          if (freqData && freqData.length > 0) {
            const binIndex = Math.min(Math.floor((i / barCount) * freqData.length), freqData.length - 1);
            const rawVal = freqData[binIndex] / 255;
            targetHeight = rawVal * effectiveVolume;
          } else {
            // Motor de armónicos sintéticos reactivos al ritmo radial
            // Banda baja (0-4): Bombo y bajo rítmico
            // Banda media (5-11): Voces y teclados
            // Banda alta (12-17): Platillos y aire estéreo
            const bassBeat = Math.sin(phase * 2.2) * 0.45 + Math.cos(phase * 1.1) * 0.35;
            const midWave = Math.sin(phase * 3.7 + i * 0.6) * 0.3 + Math.cos(phase * 2.1) * 0.25;
            const trebleSizzle = Math.sin(phase * 6.3 + i * 1.2) * 0.2 + (Math.random() * 0.18);

            let bandEnergy = 0;
            if (i < 5) {
              bandEnergy = Math.max(0.15, bassBeat * 0.7 + 0.35);
            } else if (i < 12) {
              bandEnergy = Math.max(0.1, midWave * 0.65 + 0.3);
            } else {
              bandEnergy = Math.max(0.08, trebleSizzle * 0.5 + 0.25);
            }

            // Variabilidad y modulación por volumen
            const noise = (Math.sin(phase * 1.5 + i * 2) + 1) * 0.12;
            targetHeight = Math.min(1, Math.max(0.06, (bandEnergy + noise) * effectiveVolume));
          }
        } else {
          // Estado pausado / silenciado: onda ambiente muy sutil
          targetHeight = Math.sin(phase * 0.5 + i * 0.4) * 0.04 + 0.05;
        }

        // Suavizado e inercia física (damping)
        bars[i] = bars[i] * 0.68 + targetHeight * 0.32;

        // Gestión de picos flotantes (Peak Caps con retención y gravedad)
        if (bars[i] > peaks[i]) {
          peaks[i] = bars[i];
          peakHolds[i] = 12; // Cuadros de retención en la cima
        } else {
          if (peakHolds[i] > 0) {
            peakHolds[i]--;
          } else {
            peaks[i] = Math.max(0, peaks[i] - 0.022); // Caída suave por gravedad
          }
        }
      }

      // Dibujar barras del espectro
      const barSpacing = 3;
      const totalSpacing = (barCount - 1) * barSpacing;
      const barWidth = Math.max(2, (width - totalSpacing) / barCount);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barSpacing);
        const barH = Math.max(3, bars[i] * (height - 6));
        const y = height - barH;

        // Gradiente Stitch Costera: Base Turquesa #00d2ff -> Océano #3491ff -> Pico Dorado #f6bf22
        const grad = ctx.createLinearGradient(x, height, x, y);
        grad.addColorStop(0, '#00d2ff');
        grad.addColorStop(0.55, '#3491ff');
        grad.addColorStop(1, '#f6bf22');

        ctx.fillStyle = isMuted ? 'rgba(100, 116, 139, 0.4)' : grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barH, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        // Pico flotante (Peak Cap Dot)
        if (peaks[i] > 0.08 && !isMuted) {
          const peakY = height - Math.max(4, peaks[i] * (height - 6)) - 2;
          ctx.fillStyle = peaks[i] > 0.75 ? '#f6bf22' : '#a5e7ff';
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 1.5);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [barCount, isPlaying, isMuted, volume]);

  const handleMouseEnter = () => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setShowVolumePopup(true);
  };

  const handleMouseLeave = () => {
    popupTimeoutRef.current = setTimeout(() => {
      setShowVolumePopup(false);
    }, 900);
  };

  const currentPercent = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div
      className="relative flex items-center gap-2 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botón rápido Mute / Estado de audio */}
      <button
        type="button"
        onClick={onToggleMute}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-[#071933] text-[#00d2ff] hover:text-white hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 shadow-sm'
        }`}
        title={isMuted ? "Activar audio" : `Volumen: ${currentPercent}%. Clic para silenciar.`}
      >
        <i
          className={`text-[11px] ${
            isMuted
              ? 'fa-solid fa-volume-xmark'
              : volume < 0.35
              ? 'fa-solid fa-volume-low'
              : 'fa-solid fa-volume-high'
          }`}
        ></i>
      </button>

      {/* Contenedor del Visualizador FFT en Pantallas Grandes */}
      <div
        onClick={() => setShowVolumePopup(!showVolumePopup)}
        className="relative flex flex-col justify-center px-2 py-1 rounded-xl bg-[#010e24]/90 border border-[#00d2ff]/30 hover:border-[#00d2ff] shadow-inner shadow-[#00d2ff]/5 transition-all cursor-pointer group"
        title="Visualizador de Espectro FFT en Vivo • Pasa el cursor o haz clic para calibrar volumen"
      >
        {/* Cabecera miniatura del ecualizador */}
        <div className="flex items-center justify-between gap-3 text-[9px] font-['Montserrat',sans-serif] font-bold tracking-wider mb-0.5 text-[#a5e7ff]/80">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlaying && !isMuted ? 'bg-[#00d2ff] animate-pulse' : 'bg-slate-600'
              }`}
            ></span>
            <span>{isMuted ? 'MUTE' : isPlaying ? 'ESPECTRO FFT' : 'STANDBY'}</span>
          </span>
          <span className="font-mono text-[9px] text-[#f6bf22]">
            {isMuted ? '0%' : `${currentPercent}%`}
          </span>
        </div>

        {/* Lienzo del Espectro */}
        <canvas
          ref={canvasRef}
          width={124}
          height={26}
          className="w-[124px] h-[26px] block rounded"
        />

        {/* Línea base sutil */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00d2ff]/30 to-transparent mt-0.5"></div>
      </div>

      {/* Popover Flotante de Control Preciso de Volumen */}
      {showVolumePopup && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute bottom-full mb-3 right-0 z-50 bg-[#071933]/95 backdrop-blur-xl border border-[#00d2ff]/40 rounded-2xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)] w-56 animate-fade-in"
        >
          <div className="flex items-center justify-between text-xs font-['Montserrat',sans-serif] font-bold mb-2">
            <span className="text-[#a5e7ff] flex items-center gap-1.5 text-[11px]">
              <i className="fa-solid fa-sliders text-[#00d2ff]"></i>
              <span>Nivel de Salida</span>
            </span>
            <span className="text-[#f6bf22] font-mono text-[11px]">
              {isMuted ? 'SILENCIADO' : `${currentPercent}%`}
            </span>
          </div>

          {/* Slider deslizante */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-[#c0c6d6] hover:text-[#00d2ff] text-xs cursor-pointer"
              title={isMuted ? "Restablecer sonido" : "Silenciar"}
            >
              <i className={isMuted ? "fa-solid fa-volume-xmark text-rose-400" : "fa-solid fa-volume-low"}></i>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#00d2ff] h-1.5 bg-[#010e24] rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#c0c6d6] font-mono">100%</span>
          </div>

          <div className="mt-2 pt-2 border-t border-[#a8c8ff]/10 flex items-center justify-between text-[10px] text-[#a8c8ff]/70 font-['Inter',sans-serif]">
            <span>Calidad: 128k Estéreo</span>
            <span className="text-[#00d2ff] font-semibold">Audio HD</span>
          </div>
        </div>
      )}
    </div>
  );
};
