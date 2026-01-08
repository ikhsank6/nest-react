"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateErrorId = generateErrorId;
const crypto_1 = require("crypto");
function generateErrorId() {
    return (0, crypto_1.randomBytes)(6).toString('hex').substring(0, 11);
}
//# sourceMappingURL=error-id.util.js.map