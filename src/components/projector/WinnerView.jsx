// src/components/projector/WinnerView.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.js';

const WinnerView = ({ category, onBackToNominees }) => {
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchWinner = async () => {
      setLoading(true);

      // traer todos los votos de esa categoría
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('nominee_id')
        .eq('category_id', category.id);

      if (votesError) {
        console.error(votesError);
        setLoading(false);
        return;
      }

      if (!votes || votes.length === 0) {
        setWinner(null);
        setLoading(false);
        return;
      }

      // contar votos por nominee_id
      const counts = {};
      votes.forEach((v) => {
        counts[v.nominee_id] = (counts[v.nominee_id] || 0) + 1;
      });

      const winnerId = Object.entries(counts).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

      // traer datos del ganador
      const { data: nomineeData, error: nomineeError } = await supabase
        .from('nominees')
        .select('*')
        .eq('id', winnerId)
        .single();

      if (nomineeError) {
        console.error(nomineeError);
        setLoading(false);
        return;
      }

      setWinner(nomineeData);
      setLoading(false);
    };

    fetchWinner();
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">No hay categoría seleccionada.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Calculando ganador...</p>
      </div>
    );
  }

  if (!winner) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Aún no hay votos para esta categoría.</p>
      </div>
    );
  }

  // aquí puedes usar el diseño épico que ya tenías, pongo un resumen:
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <p className="text-sm md:text-base uppercase tracking-[0.4em] text-slate-200/80 mb-3">
          Y el ganador es...
        </p>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-yellow-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.9)]">
          {category.name}
        </h1>

        <div className="mt-8 md:mt-10 flex flex-col items-center">
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-[6px] border-yellow-300 shadow-[0_0_60px_rgba(250,204,21,0.9)]">
            <img
              src={winner.img_url}
              alt={winner.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="mt-6 text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            {winner.name}
          </h2>
        </div>

        <button
          onClick={onBackToNominees}
          className="mt-10 px-6 py-3 rounded-2xl bg-white/10 border border-white/30 text-sm md:text-base hover:bg-white/20 transition"
        >
          Volver a nominados
        </button>
      </div>
    </div>
  );
};

export default WinnerView;
