import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AiInsight {
  id: string;
  type: 'warning' | 'tip' | 'success';
  message: string;
  category?: string;
}

export const useAiInsights = () => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Call our FastAPI backend using the auth session token
        const response = await fetch('http://localhost:8000/api/v1/ai/insights', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        } else {
          console.error("Failed to fetch AI insights");
        }
      } catch (err) {
        console.error("AI Insights error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return { insights, isLoading };
};
