import * as admin from 'firebase-admin';
import { db, type CallerInfo } from './auth';

export interface AuditEventInput {
  actor: CallerInfo;
  action: string;
  targetType: string;
  targetId: string;
  result?: 'SUCCESS' | 'REJECTED' | 'FAILED';
  editionId?: string | null;
  metadata?: Record<string, unknown>;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  requestId?: string | null;
  transaction?: FirebaseFirestore.Transaction;
}

/** The only server-side audit writer. Legacy fields remain as read-compatible aliases. */
export async function writeAuditEvent(input: AuditEventInput): Promise<void> {
  const ref = input.requestId
    ? db.collection('auditLogs').doc(input.requestId)
    : db.collection('auditLogs').doc();
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
  if (input.transaction) input.transaction.create(ref, data);
  else await ref.create(data);
}
