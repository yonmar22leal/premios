const StateInfo = ({ state }) => {
  const { current_view, current_category_id } = state;

  return (
    <section className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-2 text-yellow-200">Estado actual</h2>
      <p className="text-sm text-slate-200">Vista: <span className="font-mono">{current_view}</span></p>
      <p className="text-sm text-slate-200">Categoría: <span className="font-mono">{current_category_id ?? 'ninguna'}</span></p>
    </section>
  );
};

export default StateInfo;
