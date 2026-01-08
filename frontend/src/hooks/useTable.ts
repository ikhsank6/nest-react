import { useEffect, useCallback } from 'react';
import { useTableStore, type TableState } from '@/stores/table.store';

export function useTable<T>(key: string, fetchFn: (page: number, limit: number, search: string) => Promise<any>) {
  const store = useTableStore();
  
  // Initialize table if it doesn't exist
  useEffect(() => {
    store.initTable(key);
  }, [key]);

  const state = store.instances[key] as TableState<T> || {
    data: [],
    loading: true,
    error: false,
    search: '',
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  };

  const loadData = useCallback(async () => {
    store.setLoading(key, true);
    store.setError(key, false);
    try {
      const response = await fetchFn(state.page, state.limit, state.search);
      store.setData(key, response.data);
      if (response.meta?.page) {
        store.setTotalItems(key, response.meta.page.total);
      }
    } catch (err) {
      store.setError(key, true);
      store.setData(key, []);
    } finally {
      store.setLoading(key, false);
    }
  }, [key, state.page, state.limit, state.search, fetchFn]);

  // Handle changes that should trigger a reload
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  return {
    ...state,
    setPage: (page: number) => store.setPage(key, page),
    setLimit: (limit: number) => store.setLimit(key, limit),
    setSearch: (search: string) => store.setSearch(key, search),
    refresh: loadData,
  };
}
