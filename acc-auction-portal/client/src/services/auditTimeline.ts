type AuditRow = Record<string, any> & { id?: string };

export function auditTimestampValue(value: any): number {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  if (typeof value === 'number') return value;
  return Date.parse(value || '') || 0;
}

/** Read-compatible projection for the old singular collection and canonical plural collection. */
export function mergeAuditTimeline(...streams: AuditRow[][]): AuditRow[] {
  const unique = new Map<string, AuditRow>();
  for (const row of streams.flat()) {
    const stamp = auditTimestampValue(row.timestamp);
    const fingerprint = [row.action, row.targetId || row.entityId, row.actorUid || row.actor, stamp].join('|');
    if (!unique.has(fingerprint)) unique.set(fingerprint, row);
  }
  return Array.from(unique.values()).sort((a, b) => auditTimestampValue(b.timestamp) - auditTimestampValue(a.timestamp));
}
