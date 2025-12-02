// src/pages/VotingPage.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase.js';

const VotingPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [selectedNomineeId, setSelectedNomineeId] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingNominees, setLoadingNominees] = useState(false);
  const [sendingVote, setSendingVote] = useState(false);
  const [message, setMessage] = useState('');
  const [debug, setDebug] = useState(null);

  // 1) Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error cargando categorías:', error);
        setDebug(`Error categorías: ${error.message}`);
      } else {
        setCategories(data || []);
        if (data && data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      }

      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  // 2) Cargar nominados cuando cambia la categoría
  useEffect(() => {
    if (!selectedCategoryId) return;

    const fetchNominees = async () => {
      setLoadingNominees(true);
      setDebug(`Cargando nominados para categoría id=${selectedCategoryId}`);

      // join table
      const { data: joins, error: joinsError } = await supabase
        .from('nominee_categories')
        .select('id, category_id, nominee_id')
        .eq('category_id', selectedCategoryId);

      if (joinsError) {
        console.error('Error nominee_categories:', joinsError);
        setDebug(`Error nominee_categories: ${joinsError.message}`);
        setLoadingNominees(false);
        return;
      }

      if (!joins || joins.length === 0) {
        setNominees([]);
        setDebug(`No hay relaciones nominee_categories para category_id=${selectedCategoryId}`);
        setLoadingNominees(false);
        return;
      }

      const ids = joins.map((j) => j.nominee_id);

      const { data: nomineesData, error: nomineesError } = await supabase
        .from('nominees')
        .select('id, name, img_url')
        .in('id', ids);

      if (nomineesError) {
        console.error('Error nominees:', nomineesError);
        setDebug(`Error nominees: ${nomineesError.message}`);
        setLoadingNominees(false);
        return;
      }

      setNominees(nomineesData || []);
      setDebug(`Encontrados ${nomineesData?.length || 0} nominados para la categoría`);
      setLoadingNominees(false);
    };

    fetchNominees();
  }, [selectedCategoryId]);

  // 3) Manejar voto
  const handleVote = async (nomineeId) => {
    if (!selectedCategoryId) return;

    setSendingVote(true);
    setMessage('');
    setSelectedNomineeId(nomineeId);

    const { error } = await supabase.from('votes').insert({
      category_id: selectedCategoryId,
      nominee_id: nomineeId,
      // user_id: puedes luego guardar el ID del usuario autenticado
    });

    if (error) {
      console.error('Error al votar:', error);
      setMessage('Hubo un error al registrar tu voto. Inténtalo de nuevo.');
      setSendingVote(false);
      return;
    }

    setMessage('¡Voto registrado! Gracias por participar.');
    setSendingVote(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-yellow-300">
          Votación Premios IEC 2025
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Selecciona una categoría y vota por tu nominado favorito.
        </p>
        {debug && (
          <p className="text-xs text-slate-500 mt-1">
            {debug}
          </p>
        )}
      </header>

      {/* Contenido */}
      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        {/* Selector de categoría */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Categoría
          </label>

          {loadingCategories ? (
            <p className="text-slate-300">Cargando categorías...</p>
          ) : (
            <select
              value={selectedCategoryId ?? ''}
              onChange={(e) => {
                setSelectedCategoryId(Number(e.target.value));
                setSelectedNomineeId(null);
                setMessage('');
              }}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white w-full max-w-md"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Lista de nominados */}
        {loadingNominees ? (
          <p className="text-slate-300">Cargando nominados...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {nominees.map((nominee) => (
              <button
                key={nominee.id}
                onClick={() => handleVote(nominee.id)}
                disabled={sendingVote}
                className={`group rounded-2xl bg-white/5 border ${
                  selectedNomineeId === nominee.id
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-white/10'
                } p-4 flex flex-col items-center text-center hover:bg-white/10 hover:border-yellow-400/60 transition`}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-300 mb-3">
                  <img
                    src={nominee.img_url}
                    alt={nominee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-yellow-100">
                  {nominee.name}
                </span>
                {selectedNomineeId === nominee.id && (
                  <span className="mt-2 text-emerald-300 text-xs font-semibold">
                    Voto seleccionado
                  </span>
                )}
              </button>
            ))}

            {!loadingNominees && nominees.length === 0 && (
              <p className="col-span-full text-slate-300">
                No hay nominados para esta categoría.
              </p>
            )}
          </div>
        )}

        {/* Estado del voto */}
        {sendingVote && (
          <div className="mt-2 text-sky-300 text-sm">
            Enviando tu voto...
          </div>
        )}
        {message && (
          <div className="mt-2 text-emerald-400 font-semibold">
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingPage;
