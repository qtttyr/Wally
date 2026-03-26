import { useEffect, useRef } from 'react';
import { useExpensesStore } from '../store/expensesStore';
import { supabase } from '../lib/supabase';

export const useExpenses = () => {
  const { expenses, isLoading, error, fetchExpenses, addExpense, updateExpense, deleteExpense, clearError } = useExpensesStore();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    const initExpenses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchExpenses();
        loaded.current = true;
      }
    };

    initExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    isLoading,
    error,
    refreshExpenses: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearError,
  };
};
