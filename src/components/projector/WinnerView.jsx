import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.js';

const WinnerView = ({ category, onBackToNominees }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTie, setIsTie] = useState(false);

  useEffect(() => {
    if (!category) return;

    const fetchWinner = async () => {
      setLoading(true);

      // Trae todos los votos de esa categoría
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('nominee_id')
        .eq('category_id', category.id);

      if (votesError || !votes || votes.length === 0) {
        setWinners([]);
        setLoading(false);
        return;
      }

      // Cuenta votos por nominee_id
      const counts = {};
      votes.forEach((v) => {
        counts[v.nominee_id] = (counts[v.nominee_id] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(counts));
      const winnerIds = Object.entries(counts)
        .filter(([id, count]) => count === maxVotes)
        .map(([id]) => Number(id));

      setIsTie(winnerIds.length > 1);

      // Busca todos los datos de los ganadores
      const { data: nomineesData, error: nomineesError } = await supabase
        .from('nominees')
        .select('*')
        .in('id', winnerIds);

      setWinners(nomineesData || []);
      setLoading(false);
    };

    fetchWinner();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Calculando ganador...</p>
      </div>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Aún no hay votos para esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <p className="text-base uppercase tracking-[0.4em] text-slate-200/80 mb-3">
          {isTie ? '¡Es un empate!' : 'Y el ganador es...'}
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-300 drop-shadow mb-6">
          {category.name}
        </h1>

        <div className="flex flex-row flex-wrap justify-center gap-6">
          {winners.map((winner) => (
            <div key={winner.id} className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-yellow-300 shadow-lg mb-4">
                <img
                  src={winner.img_url}
                  alt={winner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {winner.name}
              </h2>
            </div>
          ))}
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
