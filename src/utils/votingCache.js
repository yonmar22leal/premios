// src/utils/votingCache.js
import { supabase } from '../services/supabase.js';

const VOTED_KEY = 'iec_voted1';

export const getUserId = () => {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

// ✅ COMPROBAR EN LA TABLA, NO EN iec_voted1
export const hasVotedCategory = async (categoryId) => {
  const userId = getUserId();

  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('category_id', categoryId)
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error comprobando voto:', error);
    return false;
  }

  return data && data.length > 0;
};

export const markCategoryVoted = async (categoryId, nomineeId) => {
  const userId = getUserId();

  const { error } = await supabase.from('votes').insert({
    category_id: categoryId,
    nominee_id: nomineeId,
    user_id: userId,
  });

  if (error) {
    console.error('Error insertando voto:', error);
    return false;
  }

  // cache local opcional
  const raw = localStorage.getItem(VOTED_KEY);
  const list = raw ? JSON.parse(raw) : [];
  if (!list.includes(categoryId)) {
    list.push(categoryId);
    localStorage.setItem(VOTED_KEY, JSON.stringify(list));
  }

  return true;
};

export const resetCategoryVoted = (categoryId) => {
  const raw = localStorage.getItem(VOTED_KEY);
  if (!raw) return;
  const list = JSON.parse(raw);
  const filtered = list.filter((id) => String(id) !== String(categoryId));
  localStorage.setItem(VOTED_KEY, JSON.stringify(filtered));
};

export const resetAllVoted = () => {
  localStorage.removeItem(VOTED_KEY);
};
