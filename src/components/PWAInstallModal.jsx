import React from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const PWAInstallModal = ({ isOpen, onClose, isInstallable, isInstalled, isIOS, onTriggerInstall }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (onTriggerInstall) {
      const outcome = await onTriggerInstall();
      if (outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d1c32] border border-[#00d2ff]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.85)] relative max-h-[92vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Header con Logo de Radio */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl bg-white p-1 ring-2 ring-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.4)] overflow-hidden shrink-0">
            <img
              src={currentConfig.branding?.logo || '/images/logo-radio-puerto-quidico.jpg'}
              alt="Logo Radio Puerto Quidico"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c2a41] border border-[#00d2ff]/30 text-[10px] font-['Oswald',sans-serif] uppercase font-bold text-[#00d2ff] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              App Oficial Gratuita
            </span>
            <h3 className="text-xl sm:text-2xl font-['Anton',sans-serif] uppercase tracking-wide text-white leading-tight">
              Instalar Radio Quidico
            </h3>
            <p className="text-xs text-[#a5e7ff] font-['Inter',sans-serif]">
              {currentConfig.frequencyPrimary} • {currentConfig.frequencySecondary} Tirúa Costa
            </p>
          </div>
        </div>

        {/* Estado: Ya Instalada */}
        {isInstalled ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <h4 className="text-base font-bold text-white uppercase font-['Anton',sans-serif]">
              ¡La App ya está instalada en este dispositivo!
            </h4>
            <p className="text-xs text-[#c0c6d6] font-['Inter',sans-serif]">
              Puedes abrir Radio Puerto Quidico directamente desde la pantalla de inicio de tu celular o escritorio sin abrir el navegador.
            </p>
          </div>
        ) : isIOS ? (
          /* Instrucciones para iPhone / iPad (Safari) */
          <div className="space-y-4 mb-6">
            <div className="bg-[#112036] p-4 rounded-2xl border border-[#00d2ff]/30 space-y-3">
              <h4 className="text-sm font-bold text-[#00d2ff] uppercase tracking-wide flex items-center gap-2 font-['Inter',sans-serif]">
                <i className="fa-brands fa-apple text-base"></i> Cómo instalar en tu iPhone o iPad:
              </h4>
              
              <div className="flex items-start gap-3 text-xs text-[#d6e3ff]">
                <span className="w-6 h-6 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold flex items-center justify-center shrink-0">1</span>
                <p>
                  En la barra inferior de <strong>Safari</strong>, pulsa el botón <strong>Compartir</strong> <i className="fa-solid fa-arrow-up-from-bracket text-[#00d2ff]"></i> (cuadrado con flecha hacia arriba).
                </p>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#d6e3ff]">
                <span className="w-6 h-6 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold flex items-center justify-center shrink-0">2</span>
                <p>
                  Desliza hacia abajo en el menú y selecciona <strong>"Agregar a pantalla de inicio"</strong> <i className="fa-regular fa-square-plus text-[#00d2ff]"></i>.
                </p>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#d6e3ff]">
                <span className="w-6 h-6 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold flex items-center justify-center shrink-0">3</span>
                <p>
                  Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo! Tendrás el ícono de Radio Quidico en tu inicio.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Chrome / Edge */
          <div className="space-y-4 mb-6">
            <p className="text-xs text-[#c0c6d6] leading-relaxed">
              Instala la aplicación web progresiva (PWA) de <strong>Radio Puerto Quidico</strong> en tu teléfono o computador. Disfruta de la mejor calidad de audio sin ocupar espacio de memoria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#112036] p-3 rounded-xl border border-[#a8c8ff]/15 flex items-center gap-2.5">
                <i className="fa-solid fa-bolt text-[#00d2ff] text-base"></i>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-tight">Carga Ultrarrápida</span>
                  <span className="text-[10px] text-[#8a919f]">Optimizado para 3G/4G rural</span>
                </div>
              </div>

              <div className="bg-[#112036] p-3 rounded-xl border border-[#a8c8ff]/15 flex items-center gap-2.5">
                <i className="fa-solid fa-headphones text-emerald-400 text-base"></i>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-tight">Segundo Plano</span>
                  <span className="text-[10px] text-[#8a919f]">Escucha con pantalla apagada</span>
                </div>
              </div>

              <div className="bg-[#112036] p-3 rounded-xl border border-[#a8c8ff]/15 flex items-center gap-2.5">
                <i className="fa-solid fa-hard-drive text-[#f6bf22] text-base"></i>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-tight">Liviana (&lt; 2 MB)</span>
                  <span className="text-[10px] text-[#8a919f]">No satura tu almacenamiento</span>
                </div>
              </div>

              <div className="bg-[#112036] p-3 rounded-xl border border-[#a8c8ff]/15 flex items-center gap-2.5">
                <i className="fa-solid fa-shield-halved text-[#47d6ff] text-base"></i>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-tight">100% Segura</span>
                  <span className="text-[10px] text-[#8a919f]">Sin spam ni publicidad invasiva</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {!isInstalled && !isIOS && (
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] font-['Inter',sans-serif] font-bold uppercase tracking-wider text-xs py-3.5 px-6 rounded-2xl transition-all shadow-[0_4px_24px_rgba(0,210,255,0.4)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-download"></i>
              {isInstallable ? 'Instalar App Ahora' : 'Agregar a Pantalla de Inicio'}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white font-['Inter',sans-serif] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
