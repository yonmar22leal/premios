const TitleScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative flex items-center justify-center">
      {/* Fondo de luces espectáculo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.4),transparent),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent),radial-gradient(circle_at_40%_40%,rgba(56,189,248,0.25),transparent)] animate-pulse-slow pointer-events-none" />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] tracking-widest">
          PREMIOS
        </h1>

        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-sky-200 drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
          IEC 2025
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-slate-100/80 max-w-xl">
          Noche de reconocimientos, celebración y talentos destacados.
        </p>

        <button
          onClick={onStart}
          className="mt-10 px-10 py-4 rounded-2xl text-lg sm:text-2xl font-semibold text-white
                     bg-white/15 border border-white/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)]
                     hover:bg-white/25 hover:scale-105 active:scale-95 transition-all duration-200
                     flex items-center gap-2"
        >
          Iniciar Premios ✨
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
