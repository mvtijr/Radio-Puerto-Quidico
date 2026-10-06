import React, { useState, useEffect } from 'react';
import { RadioConfigProvider } from './context/RadioConfigContext';
import { AudioProvider } from './context/AudioContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AudioPlayer } from './components/AudioPlayer';
import { QuidicoTVSection } from './components/QuidicoTVSection';
import { ScheduleSection } from './components/ScheduleSection';
import { PodcastsSection } from './components/PodcastsSection';
import { SponsorsSection } from './components/SponsorsSection';
import { CommunitySection } from './components/CommunitySection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { PresenterChatWidget } from './components/PresenterChatWidget';
import { SongRequestModal } from './components/SongRequestModal';
import { AdminModal } from './components/AdminModal';
import { MaritimeWeatherModal } from './components/MaritimeWeatherModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AdvertisingRatesModal } from './components/AdvertisingRatesModal';
import { SongHistoryModal } from './components/SongHistoryModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { CarModeModal } from './components/CarModeModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { FluidFieldBackground } from '@/components/ui/fluid-field';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalTab, setRequestModalTab] = useState('text');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMaritimeModalOpen, setIsMaritimeModalOpen] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [isAdvertisingModalOpen, setIsAdvertisingModalOpen] = useState(false);
  const [isSongHistoryOpen, setIsSongHistoryOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isCarModeOpen, setIsCarModeOpen] = useState(false);

  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall();

  const handleOpenRequestModal = (tab = 'text') => {
    setRequestModalTab(typeof tab === 'string' ? tab : 'text');
    setIsRequestModalOpen(true);
  };

  // Atajo de teclado: Ctrl + Shift + A o Alt + A para abrir el panel de administración
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsAdminModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#041329] text-[#d6e3ff] flex flex-col relative selection:bg-[#00d2ff] selection:text-[#003543]">
      {/* Fondo Dinámico WebGL Fluid Field Global en toda la página */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FluidFieldBackground 
          hue={-15} 
          saturation={1.4} 
          brightness={1.1} 
          className="w-full h-full" 
        />
      </div>

      {/* Cabecera con barra de transmisión y navegación */}
      <Header 
        onOpenRequestModal={handleOpenRequestModal}
        onOpenMaritimeModal={() => setIsMaritimeModalOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenCarMode={() => setIsCarModeOpen(true)}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
      />

      {/* Contenido Principal con ErrorBoundary para proteger el reproductor de audio persistente */}
      <main className="flex-1 pb-24 md:pb-28 relative z-10">
        <ErrorBoundary>
          {/* Hero Section */}
          <HeroSection 
            onOpenRequestModal={handleOpenRequestModal}
            onScrollTo={scrollToSection}
          />

          {/* Quidico TV en Directo 1080p */}
          <QuidicoTVSection 
            onOpenRequestModal={handleOpenRequestModal}
          />

          {/* Parrilla de Programación Semanal Oficial */}
          <ScheduleSection />

          {/* Radio a la Carta: Repositorio Comunitario de Pódcasts y Programas Grabados */}
          <PodcastsSection 
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenRequestModal={handleOpenRequestModal}
          />

          {/* Auspiciadores Oficiales de la Costa */}
          <SponsorsSection 
            onOpenRequestModal={handleOpenRequestModal}
            onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
          />

          {/* Avisos a la Comunidad de Tirúa */}
          <CommunitySection 
            onOpenRequestModal={handleOpenRequestModal}
          />

          {/* Identidad y Raíces de la Emisora con Banner Panorámico Oficial */}
          <AboutSection />
        </ErrorBoundary>
      </main>

      {/* Pie de Página */}
      <Footer 
        onScrollTo={scrollToSection}
        onOpenRequestModal={handleOpenRequestModal}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
      />

      {/* Presenter Chat Widget Flotante */}
      <PresenterChatWidget 
        onOpenRequestModal={handleOpenRequestModal}
      />

      {/* Reproductor en Vivo Interactivo Persistente */}
      <AudioPlayer 
        onOpenRequestModal={handleOpenRequestModal}
        onOpenSongHistory={() => setIsSongHistoryOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenCarMode={() => setIsCarModeOpen(true)}
      />

      {/* Modo Auto / Bote (Conducción en Ruta P-72S y Navegación Marítima) */}
      <CarModeModal 
        isOpen={isCarModeOpen}
        onClose={() => setIsCarModeOpen(false)}
        onOpenVoiceRequest={() => {
          setIsCarModeOpen(false);
          handleOpenRequestModal('voice');
        }}
      />

      {/* Modal de Historial de Canciones Emitidas */}
      <SongHistoryModal 
        isOpen={isSongHistoryOpen}
        onClose={() => setIsSongHistoryOpen(false)}
      />

      {/* Modal de Temporizador para Dormir */}
      <SleepTimerModal 
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      {/* Modal de Solicitud de Canciones y Saludos por WhatsApp */}
      <SongRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialTab={requestModalTab}
      />

      {/* Panel de Control y Administración Exclusivo de la Emisora */}
      <AdminModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Boletín Marítimo & Mareas de Caleta Quidico & Tirúa */}
      <MaritimeWeatherModal 
        isOpen={isMaritimeModalOpen}
        onClose={() => setIsMaritimeModalOpen(false)}
      />

      {/* Modal Instalador PWA Oficial */}
      <PWAInstallModal 
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onTriggerInstall={triggerInstall}
      />

      {/* Modal de Tarifas & Planes Publicitarios */}
      <AdvertisingRatesModal 
        isOpen={isAdvertisingModalOpen}
        onClose={() => setIsAdvertisingModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <RadioConfigProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </RadioConfigProvider>
  );
}
