import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { verifyCaller } from '../utils/auth';
import { writeAuditEvent } from '../utils/audit';

const ALLOWED_ACTIONS = new Set([
  'ADMIN_PROFILE_UPDATED', 'PLAYER_APPROVED', 'PLAYER_CHANGES_REQUESTED', 'PLAYER_REJECTED',
  'PLAYER_BLOCKED', 'PLAYER_UNBLOCKED', 'PLAYER_ARCHIVED', 'PLAYER_RESTORED',
  'PLAYER_DELETE_REJECTED', 'PLAYER_PERMANENTLY_DELETED', 'USER_DISABLED', 'USER_RESTORED',
  'USER_PERMANENTLY_DELETED', 'ADMIN_CREATED', 'ADMIN_ROLE_CHANGE', 'ACCOUNT_BLOCK',
  'ACCOUNT_UNBLOCK', 'FRANCHISE_APPROVED', 'TEAM_LEAD_ASSIGNED', 'SETTINGS_SAVED',
  'ROUND_2_RECALL', 'REFERENCE_CONFIRMED', 'PAUSE_RESUME', 'SWITCH_DRAW_MODE',
  'GUEST_DRAW', 'AUTO_DRAW', 'DATABASE_EXPORT', 'EXPORT_CSV', 'SNAPSHOT_JSON',
  'BUCKET_RELAXED', 'DIRECT_ASSIGN', 'BID_ON_BEHALF', 'SKIP', 'HAMMER', 'PAUSE', 'RESUME',
]);

/** Compatibility entry point for legacy admin screens; identity and time are server-derived. */
export const recordAuditEvent = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  const { action, targetType, targetId, editionId, details, requestId } = request.data || {};
  if (typeof action !== 'string' || !ALLOWED_ACTIONS.has(action) ||
      typeof targetType !== 'string' || typeof targetId !== 'string') {
    throw new HttpsError('invalid-argument', 'Unsupported audit event.');
  }
  await writeAuditEvent({
    actor: caller, action, targetType, targetId,
    editionId: typeof editionId === 'string' ? editionId : null,
    requestId: typeof requestId === 'string' ? requestId : null,
    metadata: { details: typeof details === 'string' ? details.slice(0, 1000) : '' },
  });
  return { success: true };
});
