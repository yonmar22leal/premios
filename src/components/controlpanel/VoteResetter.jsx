// src/components/ControlPanel/VoteResetter.jsx
import { supabase } from '../../services/supabase.js';

const VoteResetter = ({ state, categories }) => {
  const { current_category_id } = state || {};

  // 🗑️ Borrar votos de la categoría actual
  const resetCategoryVotes = async () => {
    if (!current_category_id) {
      alert('Selecciona una categoría primero');
      return;
    }

    const currentCat = categories?.find(
      c => String(c.id) === String(current_category_id)
    );

    const catName =
      currentCat?.name ||
      currentCat?.nombre ||
      `Categoría ${current_category_id}`;

    const confirm1 = window.confirm(
      `⚠️ ¿Seguro que quieres ELIMINAR TODOS los votos de la categoría "${catName}"?\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    if (!confirm1) return;

    try {
      // Debug: ver votos antes
      const { data: before, error: beforeError } = await supabase
        .from('votes')
        .select('id, category_id, nominee_id')
        .eq('category_id', current_category_id);

      console.log('[VoteResetter] Votos ANTES de borrar categoría:', before, beforeError);

      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('category_id', current_category_id);

      if (deleteError) {
        console.error('[VoteResetter] Error DELETE categoría:', deleteError);
        alert('❌ Error al eliminar votos de la categoría.');
        return;
      }

      const { data: after, error: afterError } = await supabase
        .from('votes')
        .select('id')
        .eq('category_id', current_category_id);

      console.log('[VoteResetter] Votos DESPUÉS de borrar categoría:', after, afterError);

      alert('✅ Votos de la categoría eliminados correctamente.');
    } catch (err) {
      console.error('[VoteResetter] Excepción reseteando votos categoría:', err);
      alert('❌ Error inesperado al eliminar votos.');
    }
  };

  // 💥 Borrar TODOS los votos
  const resetAllVotes = async () => {
    const confirm1 = window.confirm(
      '🚨 ¡ATENCIÓN! Esto ELIMINARÁ TODOS LOS VOTOS de TODAS las categorías.\n\n' +
      'La acción es PERMANENTE e IRREVERSIBLE.\n\n' +
      '¿Quieres continuar?'
    );
    if (!confirm1) return;

    const text = window.prompt(
      '🔴 CONFIRMACIÓN FINAL\n\n' +
      'Escribe exactamente: SI\n\n' +
      'para confirmar el borrado TOTAL de votos.'
    );

    if (text !== 'SI') {
      alert('❌ Operación cancelada.');
      return;
    }

    try {
      const { data: before, error: beforeError } = await supabase
        .from('votes')
        .select('id');

      console.log('[VoteResetter] Votos TOTALES ANTES:', before?.length, beforeError);

      // IMPORTANTE: usar WHERE para cumplir la restricción "DELETE requires a WHERE clause"
      const { error: deleteAllError } = await supabase
        .from('votes')
        .delete()
        .neq('id', -1); // id nunca será -1, así que borra todas las filas

      if (deleteAllError) {
        console.error('[VoteResetter] Error DELETE total:', deleteAllError);
        alert('❌ Error al eliminar todos los votos.');
        return;
      }

      const { data: after, error: afterError } = await supabase
        .from('votes')
        .select('id');

      console.log('[VoteResetter] Votos TOTALES DESPUÉS:', after?.length, afterError);

      alert('🗑️ TODOS los votos han sido eliminados correctamente.');
    } catch (err) {
      console.error('[VoteResetter] Excepción reseteando TODOS los votos:', err);
      alert('❌ Error inesperado al eliminar todos los votos.');
    }
  };

  return (
    <section className="bg-gradient-to-r from-red-900/80 to-rose-900/80 border-2 border-red-500/50 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-red-300 flex items-center gap-2">
        🗑️ Resetear Votos
      </h2>

      <div className="space-y-4">
        {/* Botón: borrar votos de categoría actual */}
        <div className="flex gap-3">
          <button
            onClick={resetCategoryVotes}
            disabled={!current_category_id}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg border-2 transition-all flex items-center justify-center gap-2 ${
              current_category_id
                ? 'bg-red-600/80 hover:bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30 hover:scale-105 hover:shadow-xl'
                : 'bg-red-900/50 border-red-800/50 text-red-400/70 cursor-not-allowed'
            }`}
          >
            🗑️ Borrar votos de categoría actual
          </button>
          {current_category_id && (
            <span className="px-3 py-2 bg-red-500/20 border border-red-400/50 rounded-lg text-sm font-mono text-red-200">
              Cat #{current_category_id}
            </span>
          )}
        </div>

        {/* Botón: borrar TODOS los votos */}
        <div className="pt-4 border-t border-red-500/30">
          <button
            onClick={resetAllVotes}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-rose-600 to-red-600 text-white border-2 border-rose-500 shadow-2xl shadow-rose-500/40 hover:from-rose-500 hover:to-red-500 hover:shadow-3xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            💥 ELIMINAR TODOS LOS VOTOS
          </button>
          <p className="text-xs text-red-300/80 mt-2 text-center font-mono">
            ⚠️ Acción IRREVERSIBLE - Usa con precaución
          </p>
        </div>
      </div>
    </section>
  );
};

export default VoteResetter;
