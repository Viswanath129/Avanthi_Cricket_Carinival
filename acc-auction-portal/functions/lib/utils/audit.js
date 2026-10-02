"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditEvent = writeAuditEvent;
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("./auth");
/** The only server-side audit writer. Legacy fields remain as read-compatible aliases. */
async function writeAuditEvent(input) {
    const ref = input.requestId
        ? auth_1.db.collection('auditLogs').doc(input.requestId)
        : auth_1.db.collection('auditLogs').doc();
    const data = {
        actorUid: input.actor.uid,
        actorRole: input.actor.role,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        entityType: input.targetType,
        entityId: input.targetId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        result: input.result || 'SUCCESS',
        editionId: input.editionId || null,
        metadata: input.metadata || {},
        before: input.before ?? null,
        after: input.after ?? null,
        beforeState: input.before ?? null,
        afterState: input.after ?? null,
        reason: input.reason || null,
        requestId: input.requestId || null,
    };
    if (input.transaction)
        input.transaction.create(ref, data);
    else
        await ref.create(data);
}
//# sourceMappingURL=audit.js.map