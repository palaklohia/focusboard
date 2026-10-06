import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from './api';

export function useApiData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const run = useCallback(
    async (mode: 'silent' | 'refresh' | 'retry') => {
      const id = ++requestId.current;
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'retry') {
        setLoading(true);
        setError('');
      }
      try {
        const result = await api<T>(path);
        if (id !== requestId.current) return; // a newer request replaced this one
        setData(result);
        setError('');
      } catch (e) {
        if (id !== requestId.current) return;
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [path],
  );

  // Runs when the screen is focused and again whenever `path` changes
  useFocusEffect(
    useCallback(() => {
      run('silent');
    }, [run]),
  );

  return {
    data,
    loading,
    refreshing,
    error,
    retry: () => run('retry'),
    refresh: () => run('refresh'),
    reload: () => run('silent'),
  };
}
