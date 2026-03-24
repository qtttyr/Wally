import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  next_payment_date: string;
  category_id: string;
  is_active: boolean;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_payment_date', { ascending: true });

      if (!error && data) {
        setSubscriptions(data as Subscription[]);
      }
      setIsLoading(false);
    };

    fetchSubscriptions();
  }, []);

  return { subscriptions, isLoading };
};
