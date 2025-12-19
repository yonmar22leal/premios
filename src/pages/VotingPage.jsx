import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase.js';
import { hasVotedCategory, markCategoryVoted } from '../utils/votingCache.js';
import CategorySelector from '../components/votingpage/CategorySelector.jsx';
import NomineesGrid from '../components/votingpage/NomineesGrid.jsx';

const VotingPage = ({ isAdmin = false }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [selectedNomineeId, setSelectedNomineeId] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingNominees, setLoadingNominees] = useState(false);
  const [sendingVote, setSendingVote] = useState(false);
  const [message, setMessage] = useState('');
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [presentationState, setPresentationState] = useState(null);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        setCategories(data);
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('presentation_state_changes_voting')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'presentation_state', filter: 'id=eq.1' },
        (payload) => {
          const st = payload.new;
          setPresentationState(st);
          setSelectedCategoryId(st.current_category_id || null);
        }
      )
      .subscribe((status) => {
      });

    (async () => {
      const { data } = await supabase
        .from('presentation_state')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) {
        setPresentationState(data);
        setSelectedCategoryId(data.current_category_id || null);
      }
    })();

    return () => supabase.removeChannel(channel);
  }, []);

  // Cargar nominados cuando cambia categoría
// Cargar nominados cuando cambia categoría
  useEffect(() => {
    if (!selectedCategoryId) {
      setNominees([]);
      setAlreadyVoted(false);
      return;
    }

    // ⬇️ CAMBIO CLAVE: comprobar voto de forma asíncrona
    (async () => {
      const already = await hasVotedCategory(selectedCategoryId);
      setAlreadyVoted(already);
    })();

    setSelectedNomineeId(null);
    setMessage('');

    const fetchNominees = async () => {
      setLoadingNominees(true);
      const { data: joins } = await supabase
        .from('nominee_categories')
        .select('nominee_id')
        .eq('category_id', selectedCategoryId);

      if (!joins?.length) {
        setNominees([]);
        setLoadingNominees(false);
        return;
      }

      const { data: nomineesData } = await supabase
        .from('nominees')
        .select('*')
        .in('id', joins.map(j => j.nominee_id));

      setNominees(nomineesData || []);
      setLoadingNominees(false);
    };

    fetchNominees();
  }, [selectedCategoryId]);

  const handleVote = async (nomineeId) => {
    if (!selectedCategoryId) return;

    const already = await hasVotedCategory(selectedCategoryId);
    if (already) {
      setMessage('Ya registraste tu voto en esta categoría.');
      return;
    }

    setSendingVote(true);
    setMessage('');
    setSelectedNomineeId(nomineeId);

    // ⬇️ si ahora markCategoryVoted inserta en Supabase, úsalo directo:
    const ok = await markCategoryVoted(selectedCategoryId, nomineeId);

    if (!ok) {
      setMessage('Hubo un error al registrar tu voto.');
    } else {
      setAlreadyVoted(true);
      setMessage(`¡Voto ${isAdmin ? 'ADMIN' : 'público'} registrado! Gracias por participar.`);
    }

    setSendingVote(false);
  };

  const currentCategory = categories.find(cat => String(cat.id) === String(selectedCategoryId));
  const isCategoryActive = presentationState?.current_view === 'voting' || 
                          presentationState?.current_view === 'nominees';
  const isAdminCategory = currentCategory?.admin === true;

  // 🔥 LÓGICA CORREGIDA: Admin SIEMPRE puede votar
  const canVote = isCategoryActive && (!isAdminCategory || isAdmin);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-yellow-300">
          {isAdmin ? '🛡️ Votación ADMIN - Premios IEC 2025' : 'Votación Premios IEC 2025'}
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          {isAdmin ? 'Votación especial para categorías administrativas' : 'Sigue las instrucciones del presentador.'}
        </p>
        {alreadyVoted && (
          <p className="text-xs text-emerald-400 mt-1">Ya registraste tu voto en esta categoría.</p>
        )}
      </header>

      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Categoría {isCategoryActive ? '🎯' : '⏳'}
            {isAdminCategory && (
              <span className="ml-2 px-2 py-1 bg-purple-500/80 text-xs rounded-full font-bold">
                ADMIN {isAdmin ? '✅' : '🔒'}
              </span>
            )}
          </label>
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            presentationState={presentationState}
            loadingCategories={loadingCategories}
          />
        </div>

        {/* 🔥 LÓGICA SIMPLIFICADA Y CORREGIDA */}
        {selectedCategoryId && isCategoryActive ? (
          isAdminCategory && !isAdmin ? (
            <div className="text-center py-12 bg-purple-900/50 border-2 border-purple-500/50 rounded-2xl p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-purple-800/50 flex items-center justify-center">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-300 mb-4">Categoría Administrativa</h3>
              <p className="text-purple-200 text-lg mb-4">
                Esta categoría solo puede votarse desde el modo ADMIN
              </p>
            </div>
          ) : (
            <NomineesGrid
              nominees={nominees}
              selectedNomineeId={selectedNomineeId}
              onVote={handleVote}
              sendingVote={sendingVote}
              alreadyVoted={alreadyVoted}
              loadingNominees={loadingNominees}
            />
          )
        ) : selectedCategoryId && !isCategoryActive ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <span className="text-3xl">⏳</span>
            </div>
            <p className="text-slate-400 text-lg">Esperando modo de votación...</p>
            <p className="text-sm text-slate-500 mt-1">
              Selecciona "Nominados" o "Ganador" en el panel de control
            </p>
          </div>
        ) : null}

        {/* Mensajes */}
        {sendingVote && (
          <div className="mt-6 text-sky-300 text-lg font-semibold text-center py-4 bg-sky-900/30 rounded-2xl">
            Enviando tu voto...
          </div>
        )}
        {message && (
          <div className="mt-6 text-emerald-400 font-bold text-lg text-center py-4 bg-emerald-900/30 rounded-2xl">
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingPage;
