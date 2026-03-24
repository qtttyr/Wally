import { useEffect, useCallback, useRef } from 'react';
import { useExpensesStore } from '../store/expensesStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const useExpenses = () => {
  const { expenses, isLoading, error, fetchExpenses, addExpense, updateExpense, deleteExpense, clearError } = useExpensesStore();
  const { session, isLoading: isAuthLoading } = useAuthStore();
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadExpenses = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentSession = session;
    
    if (!currentSession?.user) {
      return;
    }
    
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      await fetchExpenses();
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('useExpenses: failed to load expenses', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchExpenses]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        hasFetchedRef.current = false;
        await loadExpenses();
      } else if (event === 'SIGNED_OUT') {
        hasFetchedRef.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadExpenses]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!session?.user) {
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    loadExpenses();
  }, [session, isAuthLoading, loadExpenses]);

  return {
    expenses,
    isLoading: isLoading || isAuthLoading,
    error,
    refreshExpenses: loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearError,
  };
};
