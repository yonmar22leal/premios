const CategoryControls = ({ categories, state, updateState }) => {
  const { current_view, current_category_id } = state;

  return (
    <section className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6 text-yellow-200">Controles del proyector</h2>
      
      <div className="flex flex-col gap-6">
        {/* Botón Título */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => updateState({ current_view: 'title', current_category_id: null })}
            className={`px-6 py-3 rounded-xl text-lg font-semibold border-2 flex-1 transition-all ${
              current_view === 'title' 
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/25' 
                : 'bg-white/5 border-transparent text-white/90 hover:bg-white/10'
            }`}
          >
            📺 Título
          </button>
        </div>

        {/* Categorías */}
        <div>
          <h3 className="text-md font-semibold mb-4 text-yellow-200">📂 Categorías disponibles:</h3>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => updateState({ current_view: 'category', current_category_id: null })}
              className={`px-4 py-2 rounded-lg text-sm bg-white/5 border hover:bg-white/10`}
            >
              Ver todas las categorías
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => updateState({ current_view: 'category', current_category_id: cat.id })}
                className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  String(current_category_id) === String(cat.id) && (current_view === 'voting' || current_view === 'nominees')
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/25 scale-105'
                    : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40 hover:scale-105'
                }`}
              >
                {cat.name || cat.nombre || cat.title || cat.display_name || `Cat ${cat.id}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryControls;
