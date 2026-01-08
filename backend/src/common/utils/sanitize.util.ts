/**
 * Sanitization utilities for API responses
 * These helpers remove sensitive/internal fields from objects before sending to clients
 */

/**
 * Exclude specific fields from an object
 * @param obj - The object to sanitize
 * @param keys - Array of keys to exclude
 * @returns A new object without the specified keys
 */
export function excludeFields<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Exclude fields from multiple objects in an array
 * @param items - Array of objects to sanitize
 * @param keys - Array of keys to exclude from each object
 * @returns Array of sanitized objects
 */
export function excludeFieldsFromArray<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  keys: K[]
): Omit<T, K>[] {
  return items.map((item) => excludeFields(item, keys));
}

/**
 * Recursively exclude fields from nested objects
 * Useful for hierarchical data like menus with children
 * @param obj - The object to sanitize
 * @param keys - Array of keys to exclude
 * @param nestedKeys - Array of keys that contain nested objects/arrays to also sanitize
 * @returns A sanitized object with nested objects also processed
 */
export function excludeFieldsDeep<T extends Record<string, any>>(
  obj: T,
  keys: string[],
  nestedKeys: string[] = []
): any {
  const result: any = { ...obj };
  
  // Remove specified keys
  keys.forEach((key) => delete result[key]);
  
  // Process nested objects/arrays
  nestedKeys.forEach((nestedKey) => {
    if (result[nestedKey]) {
      if (Array.isArray(result[nestedKey])) {
        result[nestedKey] = result[nestedKey].map((item: any) =>
          excludeFieldsDeep(item, keys, nestedKeys)
        );
      } else if (typeof result[nestedKey] === 'object') {
        result[nestedKey] = excludeFieldsDeep(result[nestedKey], keys, nestedKeys);
      }
    }
  });
  
  return result;
}
