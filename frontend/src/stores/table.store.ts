import { create } from 'zustand';

// Filter object type that can contain multiple filter properties
export interface TableFilters {
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: boolean;
  filters: TableFilters;
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface TableActions<T = any> {
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setFilters: (filters: TableFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

const defaultState: TableState = {
  data: [],
  loading: false,
  error: false,
  filters: {},
  page: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
};

interface MultiTableStore {
  instances: Record<string, TableState>;
  setData: (key: string, data: any[]) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: boolean) => void;
  setFilters: (key: string, filters: TableFilters) => void;
  setPage: (key: string, page: number) => void;
  setLimit: (key: string, limit: number) => void;
  setTotalItems: (key: string, total: number) => void;
  initTable: (key: string, initialState?: Partial<TableState>) => void;
}

export const useTableStore = create<MultiTableStore>((set) => ({
  instances: {},

  initTable: (key, initialState = {}) => set((state) => {
    if (state.instances[key]) return state;
    return {
      instances: {
        ...state.instances,
        [key]: { ...defaultState, ...initialState }
      }
    };
  }),

  setData: (key, data) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], data }
    }
  })),

  setLoading: (key, loading) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], loading }
    }
  })),

  setError: (key, error) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], error }
    }
  })),

  setFilters: (key, filters) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], filters, page: 1 }
    }
  })),

  setPage: (key, page) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], page }
    }
  })),

  setLimit: (key, limit) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: { ...state.instances[key], limit, page: 1 }
    }
  })),

  setTotalItems: (key, total) => set((state) => ({
    instances: {
      ...state.instances,
      [key]: {
        ...state.instances[key],
        totalItems: total,
        totalPages: Math.ceil(total / (state.instances[key]?.limit || 10))
      }
    }
  })),
}));
