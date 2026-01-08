export declare function excludeFields<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function excludeFieldsFromArray<T extends Record<string, any>, K extends keyof T>(items: T[], keys: K[]): Omit<T, K>[];
export declare function excludeFieldsDeep<T extends Record<string, any>>(obj: T, keys: string[], nestedKeys?: string[]): any;
