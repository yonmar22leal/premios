import { useMemo } from 'react';

const CategorySelector = ({ 
  categories, 
  selectedCategoryId, 
  presentationState, 
  loadingCategories 
}) => {
  const currentCategory = useMemo(() => 
    categories.find(cat => String(cat.id) === String(selectedCategoryId)),
    [categories, selectedCategoryId]
  );

  const isCategoryActive = presentationState?.current_view === 'voting' ||
                          presentationState?.current_view === 'nominees';

  if (loadingCategories) {
    return <p className="text-slate-300">Cargando categorías...</p>;
  }

  if (!categories.length) {
    return <p className="text-slate-300">No hay categorías disponibles.</p>;
  }

  if (!selectedCategoryId) {
    return (
      <div className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-xl px-4 py-6 text-center text-slate-400">
        ⏳ Esperando selección de categoría desde el panel de control...
      </div>
    );
  }

  if (!isCategoryActive) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white w-full max-w-md text-center">
        <span className="font-semibold text-yellow-300 block">
          📍 {currentCategory?.name || 'Categoría seleccionada'}
          {currentCategory?.admin && (
            <span className="ml-2 px-2 py-1 bg-purple-500/80 text-xs rounded-full font-bold">ADMIN</span>
          )}
        </span>
        <span className="text-xs text-slate-400">
          Esperando modo de votación...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-xl px-3 py-2 text-white w-full max-w-md mb-2">
        <span className="font-semibold text-emerald-400 block">
          🎯 {currentCategory?.name || 'Categoría activa'}
          {currentCategory?.admin && (
            <span className="ml-2 px-2 py-1 bg-purple-500/80 text-xs rounded-full font-bold">ADMIN</span>
          )}
        </span>
        <span className="text-xs text-emerald-300">
          ¡Votación habilitada!
        </span>
      </div>
      
      {/* Select bloqueado solo para mostrar contexto */}
      <select
        value={selectedCategoryId ?? ''}
        disabled
        className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-slate-400 w-full max-w-md cursor-not-allowed opacity-60"
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name} {cat.admin && '(ADMIN)'}
          </option>
        ))}
      </select>
    </>
  );
};

export default CategorySelector;
