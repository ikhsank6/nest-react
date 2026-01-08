"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeFields = excludeFields;
exports.excludeFieldsFromArray = excludeFieldsFromArray;
exports.excludeFieldsDeep = excludeFieldsDeep;
function excludeFields(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
}
function excludeFieldsFromArray(items, keys) {
    return items.map((item) => excludeFields(item, keys));
}
function excludeFieldsDeep(obj, keys, nestedKeys = []) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    nestedKeys.forEach((nestedKey) => {
        if (result[nestedKey]) {
            if (Array.isArray(result[nestedKey])) {
                result[nestedKey] = result[nestedKey].map((item) => excludeFieldsDeep(item, keys, nestedKeys));
            }
            else if (typeof result[nestedKey] === 'object') {
                result[nestedKey] = excludeFieldsDeep(result[nestedKey], keys, nestedKeys);
            }
        }
    });
    return result;
}
//# sourceMappingURL=sanitize.util.js.map