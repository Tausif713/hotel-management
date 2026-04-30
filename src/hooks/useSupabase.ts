import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseData<T>(
  tableName: string,
  storageKey: string,
  selectQuery: string = '*',
  orderColumn?: string,
  orderOptions?: { ascending: boolean }
) {
  const [data, setData] = useState<T[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(tableName).select(selectQuery);
        
        if (orderColumn) {
          query = query.order(orderColumn, orderOptions || { ascending: true });
        }

        const { data: result, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (result) {
          setData(result as T[]);
          localStorage.setItem(storageKey, JSON.stringify(result));
        }
      } catch (err) {
        setError(err);
        console.error(`Error fetching ${tableName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to changes
    const subscription = supabase.channel(`${tableName}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tableName, storageKey, selectQuery, orderColumn, orderOptions]);

  return { data, setData, loading, error };
}
