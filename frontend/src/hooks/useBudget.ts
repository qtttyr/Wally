import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export const useBudget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setBudgets(data as Budget[]);
      }
      setIsLoading(false);
    };

    fetchBudgets();
  }, []);

  return { budgets, isLoading };
};
