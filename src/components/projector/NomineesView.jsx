import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.js';

const NomineesView = ({ category, onBack, onShowWinner }) => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    if (!category) return;

    const fetchNominees = async () => {
      setLoading(true);
      setDebug(`Cargando nominados para categoría id=${category.id}`);

      const { data: joins, error: joinsError } = await supabase
        .from('nominee_categories') // 👈 nombre corregido
        .select('id, category_id, nominee_id')
        .eq('category_id', category.id);

      if (joinsError) {
        console.error('Error nominee_categories:', joinsError);
        setDebug(`Error nominee_categories: ${joinsError.message}`);
        setLoading(false);
        return;
      }

      console.log('joins', joins);
      if (!joins || joins.length === 0) {
        setDebug(`No hay filas en nominee_categories para category_id=${category.id}`);
        setNominees([]);
        setLoading(false);
        return;
      }

      const ids = joins.map((j) => j.nominee_id);
      setDebug(`joins ok. nominee_ids = [${ids.join(', ')}]`);

      const { data: nomineesData, error: nomineesError } = await supabase
        .from('nominees')
        .select('id, name, img_url')
        .in('id', ids);

      if (nomineesError) {
        console.error('Error nominees:', nomineesError);
        setDebug(`Error nominees: ${nomineesError.message}`);
        setLoading(false);
        return;
      }

      console.log('nominees', nomineesData);
      setNominees(nomineesData || []);
      setDebug(`Encontrados ${nomineesData?.length || 0} nominados`);
      setLoading(false);
    };

    fetchNominees();
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-2xl">Selecciona una categoría primero.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-2">Cargando nominados...</p>
        {debug && <p className="text-xs text-slate-400">{debug}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col">
      <header className="px-8 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm tracking-[0.35em] text-slate-300/70 uppercase">
            Categoría
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-300 drop-shadow">
            {category.name}
          </h1>
          <p className="text-slate-200/80 mt-1">
            Nominados oficiales para esta categoría.
          </p>
          {debug && (
            <p className="text-xs mt-1 text-slate-400">
              {debug}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-sm md:text-base hover:bg-white/20 transition"
          >
            Volver a categorías
          </button>
          {onShowWinner && nominees.length > 0 && (
            <button
              onClick={onShowWinner}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-sm md:text-base font-semibold hover:bg-emerald-400 transition shadow-lg"
            >
              Revelar ganador
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-10 flex items-center justify-center">
        {nominees.length === 0 ? (
          <p className="text-xl text-slate-200">
            No hay nominados asignados a esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {nominees.map((nominee) => (
              <div
                key={nominee.id}
                className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10
                           hover:bg-white/10 hover:border-yellow-400/60 transition-all duration-200
                           shadow-[0_0_30px_rgba(0,0,0,0.6)] flex flex-col items-center p-6"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-lg mb-4">
                  <img
                    src={nominee.img_url}
                    alt={nominee.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-yellow-200 text-center">
                  {nominee.name}
                </h2>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NomineesView;
