import React from 'react';
import { useAudio } from '../context/AudioContext';

export const SleepTimerModal = ({ isOpen, onClose }) => {
  const { sleepTimerMinutes, sleepTimerRemaining, setSleepTimer } = useAudio();

  if (!isOpen) return null;

  const timerOptions = [15, 30, 45, 60, 90];

  const formatRemaining = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelect = (mins) => {
    setSleepTimer(mins);
    onClose();
  };

  const handleCancel = () => {
    setSleepTimer(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010e24]/85 backdrop-blur-xl animate-fadeIn">
      <div className="sh-card bg-[#071933]/95 border border-[#a8c8ff]/25 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-center">
        <div className="ambient-glow" />

        <div className="w-12 h-12 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] flex items-center justify-center mx-auto mb-4 border border-[#00d2ff]/30 shadow-md">
          <i className="fa-solid fa-moon text-xl"></i>
        </div>

        <h3 className="font-['Montserrat',sans-serif] font-black text-xl text-white">
          Temporizador para Dormir
        </h3>
        <p className="text-xs text-[#c0c6d6] font-['Inter',sans-serif] mt-1.5 leading-relaxed">
          Programa el apagado automático de la transmisión para descansar sin preocuparte por tu batería o datos móviles.
        </p>

        {/* Estado actual si está activo */}
        {sleepTimerRemaining !== null && (
          <div className="my-4 p-3 rounded-2xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-['Montserrat',sans-serif] font-bold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping"></span>
            <span>Apagando en: <span className="font-mono text-white text-sm">{formatRemaining(sleepTimerRemaining)}</span></span>
          </div>
        )}

        {/* Opciones de Minutos */}
        <div className="grid grid-cols-2 gap-2.5 my-5">
          {timerOptions.map((mins) => {
            const isSelected = sleepTimerMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => handleSelect(mins)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] shadow-md shadow-[#00d2ff]/30 ring-2 ring-[#00d2ff]/40'
                    : 'bg-[#010e24] text-[#d6e3ff] hover:text-white hover:bg-[#0e274b] border border-[#a8c8ff]/15'
                }`}
              >
                {mins} Minutos
              </button>
            );
          })}

          {sleepTimerMinutes && (
            <button
              onClick={handleCancel}
              className="py-2.5 px-3 rounded-2xl text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer col-span-2"
            >
              <i className="fa-solid fa-power-off mr-1.5"></i>
              Desactivar Temporizador
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase text-[#c0c6d6] hover:text-white bg-[#010e24]/80 hover:bg-[#010e24] border border-[#a8c8ff]/15 transition-all cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
