const RevealWinnerButton = ({ state, updateState, drumrollSfx, winnerSfx }) => {
  const { current_category_id, current_view } = state;

  if (!current_category_id) return null;

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={async () => {
          // 1) Cambiar a results
          await updateState({ current_view: 'results', current_category_id });
          
          // 2) Reproducir sonidos
          const drum = new Audio(drumrollSfx);
          drum.play().catch(console.error);

          setTimeout(() => {
            const win = new Audio(winnerSfx);
            win.play().catch(console.error);
          }, 5000);
        }}
        className={`px-6 py-3 rounded-xl text-lg font-semibold border-2 flex-1 transition-all ${
          current_view === 'results'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg shadow-purple-500/25'
            : 'bg-white/5 border-transparent text-white/90 hover:bg-white/10'
        }`}
      >
        🎉 Revelar Ganador
      </button>
    </div>
  );
};

export default RevealWinnerButton;
