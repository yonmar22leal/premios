const NomineeList = ({ state, nominees, presentNominee, updateState }) => {
  const { current_category_id, current_view } = state;

  if (!current_category_id) return null;

  return (
    <>
      {/* Botón Nominados */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => updateState({ current_view: 'nominees', current_category_id })}
          className={`px-6 py-3 rounded-xl text-lg font-semibold border-2 flex-1 transition-all ${
            current_view === 'nominees'
              ? 'bg-blue-500 text-black border-blue-400 shadow-lg shadow-blue-500/25'
              : 'bg-white/5 border-transparent text-white/90 hover:bg-white/10'
          }`}
        >
          🏆 Nominados
        </button>
      </div>

      {/* Lista de nominados */}
      <div className="mt-4 bg-slate-900/70 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-md font-semibold mb-3 text-yellow-200">🎬 Presentaciones de nominados</h3>
        {nominees.length === 0 ? (
          <p className="text-sm text-slate-300">No hay nominados con presentaciones en esta categoría.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {nominees.map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-black/40 border border-white/10">
                  {n.img_url ? (
                    <img src={n.img_url} alt={n.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.name}</div>
                  <div className="text-xs text-slate-400">
                    {n.video_url ? '✅ Con presentación' : '❌ Sin presentación'}
                  </div>
                </div>
                <button
                  onClick={() => presentNominee(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    n.video_url 
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md hover:scale-105' 
                      : 'bg-white/5 text-white/60 cursor-not-allowed'
                  }`}
                  disabled={!n.video_url}
                >
                  ▶ Presentar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NomineeList;
