import { useRef, useCallback } from 'react';

/**
 * Hook to prevent duplicate API requests.
 * Useful in React StrictMode which causes double renders.
 * Can be used for form submissions, data fetching, or any async operation.
 * 
 * @example
 * // For form submission
 * const { withRequestGuard } = useRequestGuard();
 * const onSubmit = withRequestGuard(async (data) => {
 *   await api.post('/users', data);
 * });
 * 
 * @example
 * // For data fetching
 * const { withRequestGuard } = useRequestGuard();
 * const fetchUsers = withRequestGuard(async (page, limit) => {
 *   return await api.get(`/users?page=${page}&limit=${limit}`);
 * });
 */
export function useRequestGuard() {
    const isRequesting = useRef(false);

    const withRequestGuard = useCallback(<T extends (...args: any[]) => any>(
        fn: T
    ): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
        return (...args: Parameters<T>) => {
            if (isRequesting.current) {
                return undefined;
            }

            isRequesting.current = true;

            try {
                const result = fn(...args);

                if (result instanceof Promise) {
                    return result.finally(() => {
                        isRequesting.current = false;
                    }) as ReturnType<T>;
                } else {
                    isRequesting.current = false;
                    return result;
                }
            } catch (error) {
                isRequesting.current = false;
                throw error;
            }
        };
    }, []);

    return {
        isRequesting: isRequesting.current,
        withRequestGuard,
    };
}
