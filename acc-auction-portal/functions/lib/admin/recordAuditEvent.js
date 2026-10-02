"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditEvent = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const audit_1 = require("../utils/audit");
const ALLOWED_ACTIONS = new Set([
    'ADMIN_PROFILE_UPDATED', 'PLAYER_APPROVED', 'PLAYER_CHANGES_REQUESTED', 'PLAYER_REJECTED',
    'PLAYER_PROFILE_UPDATED',
    'PLAYER_BLOCKED', 'PLAYER_UNBLOCKED',
    'USER_DISABLED', 'USER_RESTORED',
    'USER_PERMANENTLY_DELETED', 'ADMIN_CREATED', 'ADMIN_ROLE_CHANGE', 'ACCOUNT_BLOCK',
    'ACCOUNT_UNBLOCK', 'FRANCHISE_APPROVED', 'TEAM_LEAD_ASSIGNED', 'SETTINGS_SAVED',
    'ROUND_2_RECALL', 'REFERENCE_CONFIRMED', 'PAUSE_RESUME', 'SWITCH_DRAW_MODE',
    'GUEST_DRAW', 'AUTO_DRAW', 'DATABASE_EXPORT', 'EXPORT_CSV', 'SNAPSHOT_JSON',
    'BUCKET_RELAXED', 'DIRECT_ASSIGN', 'BID_ON_BEHALF', 'BID_PLACED', 'SKIP', 'HAMMER', 'PAUSE', 'RESUME',
    'USER_STATUS_TOGGLED', 'EXPORT_SNAPSHOT',
]);
/** Compatibility entry point for legacy admin screens; identity and time are server-derived. */
exports.recordAuditEvent = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
    const { action, targetType, targetId, editionId, details, requestId } = request.data || {};
    if (typeof action !== 'string' || !ALLOWED_ACTIONS.has(action) ||
        typeof targetType !== 'string' || typeof targetId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Unsupported audit event.');
    }
    if (['DATABASE_EXPORT', 'USER_DISABLED', 'USER_RESTORED', 'USER_PERMANENTLY_DELETED', 'USER_STATUS_TOGGLED', 'ADMIN_ROLE_CHANGE', 'ACCOUNT_BLOCK', 'ACCOUNT_UNBLOCK'].includes(action) && caller.role !== 'SUPER_ADMIN') {
        await (0, audit_1.writeAuditEvent)({ actor: caller, action: 'AUDIT_EVENT_REJECTED', targetType, targetId,
            result: 'REJECTED', editionId: typeof editionId === 'string' ? editionId : null,
            metadata: { attemptedAction: action } });
        throw new https_1.HttpsError('permission-denied', 'Super Admin is required for this governance audit action.');
    }
    await (0, audit_1.writeAuditEvent)({
        actor: caller, action, targetType, targetId,
        editionId: typeof editionId === 'string' ? editionId : null,
        requestId: typeof requestId === 'string' ? requestId : null,
        metadata: { details: typeof details === 'string' ? details.slice(0, 1000) : '' },
    });
    return { success: true };
});
//# sourceMappingURL=recordAuditEvent.js.map