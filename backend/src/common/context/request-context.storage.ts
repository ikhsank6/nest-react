import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId?: number;
  userName?: string;
  userEmail?: string;
}

export const contextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return contextStorage.getStore();
}
