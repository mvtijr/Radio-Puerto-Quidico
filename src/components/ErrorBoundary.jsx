import React from 'react';

/**
 * ErrorBoundary - Protección de Resiliencia Global para Radio Puerto Quidico
 * Captura excepciones en componentes hijos para evitar que la página quede en blanco (White Screen of Death),
 * garantizando que el AudioPlayer persista y la transmisión continúe sonando sin interrupciones.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[RadioErrorBoundary] Error interceptado en interfaz:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-10 mx-auto max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#071933]/95 border-2 border-amber-500/50 text-center shadow-2xl backdrop-blur-xl relative z-30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-amber-500/30">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>La transmisión de radio sigue al aire</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-['Montserrat',sans-serif] mb-2 tracking-tight">
            Módulo en Recuperación Automática
          </h3>
          <p className="text-xs sm:text-sm text-[#c0c6d6] font-['Inter',sans-serif] mb-6 max-w-lg mx-auto leading-relaxed">
            Se produjo un conflicto menor al procesar los datos de este módulo. La señal en vivo de <strong className="text-[#00d2ff]">Radio Puerto Quidico 105.1 FM / 91.3 FM</strong> no ha sido afectada y sigue sonando.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00d2ff] to-[#3491ff] text-[#002955] font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#00d2ff]/25 flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              Reintentar Módulo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full bg-[#010e24] hover:bg-[#1c2a41] text-[#d6e3ff] font-['Montserrat',sans-serif] font-semibold text-xs transition border border-[#a8c8ff]/20 cursor-pointer"
            >
              Recargar Sitio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
