import { useEffect, useCallback, useRef } from 'react';
import { useTableStore, type TableState, type TableFilters } from '@/stores/table.store';

export function useTable<T>(key: string, fetchFn: (page: number, limit: number, filters: TableFilters) => Promise<any>) {
  const store = useTableStore();

  // Use refs to track request state and prevent duplicate calls
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchParamsRef = useRef<string>('');

  // Initialize table if it doesn't exist
  useEffect(() => {
    store.initTable(key);
  }, [key]);

  const state = store.instances[key] as TableState<T> || {
    data: [],
    loading: true,
    error: false,
    filters: {},
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  };

  // Serialize filters to string for comparison only
  const filtersKey = JSON.stringify(state.filters);

  const loadData = useCallback(async () => {
    // Create a unique key for these params to detect duplicate calls
    const fetchKey = `${key}-${state.page}-${state.limit}-${filtersKey}`;

    // Skip if already loading with same params
    if (isLoadingRef.current && lastFetchParamsRef.current === fetchKey) {
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastFetchParamsRef.current = fetchKey;
    isLoadingRef.current = true;

    store.setLoading(key, true);
    store.setError(key, false);

    try {
      // Pass filters as object directly
      const response = await fetchFn(state.page, state.limit, state.filters);

      // Only update if this is still the current request
      if (lastFetchParamsRef.current === fetchKey) {
        store.setData(key, response.data);
        if (response.meta?.page) {
          store.setTotalItems(key, response.meta.page.total);
        }
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err?.name === 'AbortError') {
        return;
      }
      store.setError(key, true);
      store.setData(key, []);
    } finally {
      isLoadingRef.current = false;
      store.setLoading(key, false);
    }
  }, [key, state.page, state.limit, filtersKey, fetchFn, store]);

  // Debounced data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [state.page, state.limit, filtersKey, key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper to update filters (merge with existing filters)
  const setFilters = useCallback((newFilters: Partial<TableFilters>) => {
    const mergedFilters = { ...state.filters, ...newFilters };
    // Remove undefined/null values
    Object.keys(mergedFilters).forEach(k => {
      if (mergedFilters[k] === undefined || mergedFilters[k] === null || mergedFilters[k] === '') {
        delete mergedFilters[k];
      }
    });
    store.setFilters(key, mergedFilters);
  }, [key, state.filters, store]);

  return {
    ...state,
    setPage: (page: number) => store.setPage(key, page),
    setLimit: (limit: number) => store.setLimit(key, limit),
    setFilters,
    setData: (data: T[]) => store.setData(key, data),
    refresh: loadData,
  };
}


