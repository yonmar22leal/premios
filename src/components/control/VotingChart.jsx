import { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { NOMINEES_BY_CATEGORY } from '../data/nominees';

const VotingPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(CATEGORIES[0]?.id ?? null);
  const [selectedNomineeId, setSelectedNomineeId] = useState(null);
  const [message, setMessage] = useState('');

  const nominees = selectedCategoryId
    ? NOMINEES_BY_CATEGORY[selectedCategoryId] || []
    : [];

  const handleVote = async (nomineeId) => {
    setSelectedNomineeId(nomineeId);

    // Aquí luego harás la llamada real al backend / Supabase
    // por ahora simulamos:
    // await api.vote({ categoryId: selectedCategoryId, nomineeId });

    setMessage('¡Voto registrado! Gracias por participar.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-yellow-300">
          Votación Premios IEC 2025
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Selecciona una categoría y vota por tu nominado favorito.
        </p>
      </header>

      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        {/* Selector de categoría */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Categoría
          </label>
          <select
            value={selectedCategoryId ?? ''}
            onChange={(e) => {
              setSelectedCategoryId(Number(e.target.value));
              setSelectedNomineeId(null);
              setMessage('');
            }}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white w-full max-w-md"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de nominados para votar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nominees.map((nominee) => (
            <button
              key={nominee.id}
              onClick={() => handleVote(nominee.id)}
              className={`group rounded-2xl bg-white/5 border ${
                selectedNomineeId === nominee.id
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/10'
              } p-4 flex flex-col items-center text-center hover:bg-white/10 hover:border-yellow-400/60 transition`}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-300 mb-3">
                <img
                  src={nominee.avatar}
                  alt={nominee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-yellow-100">
                {nominee.name}
              </span>
              <span className="text-xs text-slate-300 mt-1">
                {nominee.church}
              </span>
              {selectedNomineeId === nominee.id && (
                <span className="mt-2 text-emerald-300 text-xs font-semibold">
                  Voto seleccionado
                </span>
              )}
            </button>
          ))}
        </div>

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
