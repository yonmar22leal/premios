import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase.js';
import drumrollSfx from '/audio/drumroll.mp3';
import winnerSfx from '/audio/winner.mp3';
import StateInfo from '../components/controlpanel/StateInfo.jsx';
import CategoryControls from '../components/controlpanel/CategoryControls.jsx';
import NomineeList from '../components/controlpanel/NomineeList.jsx';
import RevealWinnerButton from '../components/controlpanel/RevealWinnerButton.jsx';
import Loader from '../components/controlpanel/Loader.jsx';
import VoteResetter from '../components/controlpanel/VoteResetter.jsx';

const ControlPanel = () => {
  const [state, setState] = useState(null);
  const [categories, setCategories] = useState([]);
  const [nomineesList, setNomineesList] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Carga inicial de datos
  useEffect(() => {
    const load = async () => {
      setLoadingState(true);
      setErrorMsg('');

      const { data: st, error: stError } = await supabase
        .from('presentation_state')
        .select('*')
        .eq('id', 1)
        .single();

      if (stError) {
        console.error(stError);
        setErrorMsg('No se pudo cargar el estado de presentación.');
      } else {
        setState(st);
      }

      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (catsError) {
        console.error(catsError);
      } else {
        setCategories(cats || []);
      }

      setLoadingState(false);
    };
    load();
  }, []);

  // Suscripción realtime al estado
  useEffect(() => {
    const channel = supabase
      .channel('presentation_state_changes_control')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'presentation_state', filter: 'id=eq.1' },
        (payload) => {
          console.log('[ControlPanel] realtime update', payload.new);
          setState(payload.new);
        }
      )
      .subscribe();

    const controlChan = supabase
      .channel('presentation_control')
      .on('broadcast', { event: 'refresh' }, (payload) => {
        console.log('REFRESH recibido', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(controlChan);
    };
  }, []);

  // Cargar nominados cuando cambie la categoría
  useEffect(() => {
    const loadNoms = async () => {
      if (!state || !state.current_category_id) {
        setNomineesList([]);
        return;
      }

      try {
        const { data: joins, error: joinsError } = await supabase
          .from('nominee_categories')
          .select('nominee_id')
          .eq('category_id', state.current_category_id);

        if (joinsError) {
          console.error('Error nominee_categories', joinsError);
          setNomineesList([]);
          return;
        }

        const ids = joins.map((j) => j.nominee_id);
        if (!ids || ids.length === 0) {
          setNomineesList([]);
          return;
        }

        const { data: noms, error: nomsError } = await supabase
          .from('nominees')
          .select('id, name, img_url, video_url')
          .in('id', ids);

        if (nomsError) {
          console.error('Error loading nominees for control panel', nomsError);
          setNomineesList([]);
          return;
        }

        setNomineesList(noms || []);
      } catch (e) {
        console.error('Error loading nominees', e);
        setNomineesList([]);
      }
    };

    loadNoms();
  }, [state]);

  // Función para actualizar estado
  const updateState = async (patch) => {
    if (!state) return;
    setLoadingAction(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('presentation_state')
      .update(patch)
      .eq('id', 1)
      .select('*')
      .single();

    if (error) {
      console.error(error);
      setErrorMsg('Error al actualizar el estado.');
    } else {
      setState(data);

      // Enviar broadcast refresh
      try {
        const existing = supabase.getChannels().find(c => c.topic === 'presentation_control');
        if (existing) {
          if (typeof existing.httpSend === 'function') {
            await existing.httpSend('refresh', { ts: new Date().toISOString() });
          } else {
            existing.send({ type: 'broadcast', event: 'refresh', payload: { ts: new Date().toISOString() } });
          }
        }
      } catch (bErr) {
        console.warn('[ControlPanel] No se pudo enviar broadcast de control', bErr);
      }
    }

    setLoadingAction(false);
  };

  // Función para presentar nominados (pasada a NomineeList)
  const presentNominee = async (nominee) => {
    if (!nominee?.video_url) {
      console.warn('No hay video para este nominada');
      return;
    }

    try {
      console.log('[ControlPanel] Enviando present_nominee:', nominee);
      const chan = supabase.channel('presentation_control');
      await chan.subscribe();

      const payload = { nominee };

      if (typeof chan.httpSend === 'function') {
        await chan.httpSend('present_nominee', payload);
      } else {
        await chan.send({ 
          type: 'broadcast', 
          event: 'present_nominee', 
          payload 
        });
      }

      await supabase.removeChannel(chan);
      console.log('[ControlPanel] Broadcast present_nominee enviado correctamente');
    } catch (e) {
      console.error('Error enviando present_nominee:', e);
    }
  };

  if (loadingState || !state) {
    return <Loader text="Cargando panel de control..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">Panel de control – Premios IEC</h1>
          <p className="text-slate-300 text-sm mt-1">Controla lo que se ve en la pantalla de proyección.</p>
          {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
        </div>
        {loadingAction && <span className="text-xs text-sky-300">Aplicando cambios...</span>}
      </header>
      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        <StateInfo state={state} />
        <CategoryControls categories={categories} state={state} updateState={updateState} />
        
        {state.current_category_id && (
          <>
            <NomineeList 
              state={state} 
              nominees={nomineesList} 
              presentNominee={presentNominee}
              updateState={updateState}
            />
            <RevealWinnerButton 
              state={state} 
              updateState={updateState} 
              drumrollSfx={drumrollSfx}
              winnerSfx={winnerSfx}
            />
          </>
        )}
                {/* Reset de votos - SIEMPRE visible */}
        <VoteResetter 
          state={state} 
          updateState={updateState}
          categories={categories}  // ✅ AGREGAR ESTA LÍNEA
        />
      </main>
    </div>
  );
};

export default ControlPanel;
