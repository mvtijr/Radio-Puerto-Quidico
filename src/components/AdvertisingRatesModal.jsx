import React from 'react';
import { useRadioConfig } from '../context/RadioConfigContext';
import { RADIO_CONFIG } from '../config/radioConfig';

export const AdvertisingRatesModal = ({ isOpen, onClose }) => {
  const { config } = useRadioConfig();
  const currentConfig = config || RADIO_CONFIG;
  const plans = currentConfig.advertisingPlans || RADIO_CONFIG.advertisingPlans;

  if (!isOpen) return null;

  const rawNumber = (currentConfig.contact?.whatsapp || '56962679087').replace(/[^0-9]/g, '');

  const handleConsultPlan = (planName) => {
    const text = `¡Hola Radio Puerto Quidico! 👋\n` +
      `📻 Me interesa contratar el *${planName}* para auspiciar mi negocio en la 105.1 FM / 91.3 FM.\n` +
      `¿Podrían indicarme los requisitos y formas de emisión? Muchas gracias.`;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#010e24]/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d1c32] border border-[#00d2ff]/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.85)] relative max-h-[92vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1c2a41] hover:bg-[#2c3951] text-[#c0c6d6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar tarifario"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2a41] border border-[#00d2ff]/30 text-[11px] font-['Oswald',sans-serif] uppercase font-bold text-[#00d2ff] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Pauta Comercial Oficial 2026
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-['Anton',sans-serif] uppercase tracking-wide text-white leading-tight">
            Planes de Auspicio & Publicidad Radial
          </h2>
          <p className="text-xs sm:text-sm text-[#a5e7ff] font-['Inter',sans-serif] mt-1.5">
            Llega a miles de hogares, negocios, pescadores y familias en Caleta Quidico, Tirúa, Isla Mocha y todo Arauco.
          </p>
        </div>

        {/* Rejilla de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 sm:p-6 border transition-all flex flex-col justify-between relative ${
                plan.recommended
                  ? 'bg-gradient-to-b from-[#112036] to-[#041329] border-[#00d2ff] shadow-[0_0_30px_rgba(0,210,255,0.25)] ring-2 ring-[#00d2ff]/40'
                  : 'bg-[#010e24] border-[#a8c8ff]/20 hover:border-[#a8c8ff]/50'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                  ★ Más Solicitado
                </span>
              )}

              <div>
                <span className="text-[10px] font-['Oswald',sans-serif] uppercase tracking-widest text-[#a5e7ff] font-bold block mb-1">
                  {plan.tier}
                </span>
                <h3 className="text-lg font-bold text-white uppercase font-['Anton',sans-serif] leading-tight">
                  {plan.name}
                </h3>
                
                <div className="my-4 pb-4 border-b border-[#a8c8ff]/15">
                  <span className="font-['Anton',sans-serif] text-2xl sm:text-3xl text-[#f6bf22]">
                    {plan.price}
                  </span>
                  <span className="block text-[10px] text-[#8a919f] mt-0.5">
                    Facturación mensual sin amarres
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#d6e3ff] mb-6">
                  {plan.features?.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <i className="fa-solid fa-check text-[#00d2ff] text-xs mt-0.5 shrink-0"></i>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleConsultPlan(`${plan.tier}: ${plan.name}`)}
                className={`w-full py-3 px-4 rounded-xl font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  plan.recommended
                    ? 'bg-gradient-to-r from-[#00d2ff] to-[#3491ff] hover:brightness-110 text-[#002955] shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-[#1c2a41] hover:bg-[#2c3951] text-[#00d2ff] hover:text-white border border-[#00d2ff]/30'
                }`}
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>Cotizar este Plan</span>
              </button>
            </div>
          ))}
        </div>

        {/* Garantía Comercial & Contacto Directo */}
        <div className="bg-[#112036]/70 rounded-2xl p-5 border border-[#a8c8ff]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                ¿Necesitas un plan personalizado o transmisión de eventos?
              </h4>
              <p className="text-xs text-[#c0c6d6]">
                Transmisiones en directo de inauguraciones, bingos benéficos, festivales costeros y campañas especiales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleConsultPlan('Plan Personalizado para Evento / Empresa')}
            className="bg-[#f6bf22] hover:bg-[#ffdf99] text-[#3f2e00] font-['Oswald',sans-serif] font-bold uppercase text-xs px-6 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>Hablar con Dirección Comercial</span>
          </button>
        </div>

      </div>
    </div>
  );
};
