// PresentationView.jsx - FULLSCREEN AUTOMÁTICO
import React, { useRef, useEffect, useCallback, useState } from 'react';

const PresentationView = ({ nominee, onEnd }) => {
  const videoRef = useRef(null);
  const hasMounted = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  console.log('[PresentationView] Render con nominee:', nominee?.name);

  const handleEnd = useCallback(() => {
    console.log('[PresentationView] Finalizando presentación');
    if (onEnd) onEnd();
  }, [onEnd]);

  // ✅ Función para entrar en pantalla completa
  const enterFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen().then(() => {
        setIsFullscreen(true);
        console.log('[PresentationView] ✅ Entró en fullscreen');
      }).catch(e => {
        console.error('[PresentationView] ❌ Error fullscreen:', e);
      });
    }
  }, []);

  // ✅ Salir de fullscreen
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    hasMounted.current = true;
    const video = videoRef.current;
    if (!video || !nominee?.video_url) {
      console.warn('[PresentationView] Sin video ref o URL');
      return;
    }

    console.log('[PresentationView] Configurando video:', nominee.video_url);

    const handleLoadedMetadata = () => {
      console.log('[PresentationView] ✅ METADATA CARGADA - Fullscreen + Play');
      
      // ✅ Entrar en fullscreen automáticamente
      enterFullscreen();
      
      // Play después de fullscreen
      video.play().catch(e => console.error('[PresentationView] ❌ Error play:', e));
    };

    const handleError = (e) => {
      console.error('[PresentationView] ❌ Error video:', e);
      console.error('target.error:', video.error);
      handleEnd();
    };

    const handleEnded = () => {
      console.log('[PresentationView] ✅ Video terminado');
      handleEnd();
    };

    // ✅ Detectar cambios de fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Pre-play (sin fullscreen aún)
    video.play().catch(e => console.warn('[PresentationView] Pre-play failed:', e));

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        video.removeEventListener('ended', handleEnded);
        video.pause();
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      exitFullscreen();
    };
  }, [nominee?.video_url, handleEnd, enterFullscreen, exitFullscreen]);

  if (!nominee || !nominee.video_url) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">No hay presentación disponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-6xl relative">
        
        {/* Debug info - Solo fuera de fullscreen */}
        {!isFullscreen && (
          <div className="absolute top-4 left-4 text-white bg-black/90 p-3 rounded-lg text-sm z-50 backdrop-blur-sm">
            <p>🎥 {nominee.name}</p>
            <p>Status: {isFullscreen ? 'Fullscreen' : 'Cargando...'}</p>
            <button
              onClick={enterFullscreen}
              className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              📺 Pantalla Completa
            </button>
          </div>
        )}

        {/* Botón salir fullscreen - Solo en fullscreen */}
        {isFullscreen && (
          <button
            onClick={exitFullscreen}
            className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl"
            title="Salir de pantalla completa"
          >
            ❌
          </button>
        )}
        
        <video
          ref={videoRef}
          className={`w-full h-[80vh] max-w-6xl object-contain rounded-2xl shadow-2xl transition-all duration-300 ${
            isFullscreen ? 'rounded-none shadow-none' : ''
          }`}
          src={nominee.video_url}
          autoPlay
          muted
          playsInline
          controls={false} 
          preload="auto"
          loop={false}
        >
          Tu navegador no soporta video.
        </video>
      </div>
    </div>
  );
};

export default PresentationView;
