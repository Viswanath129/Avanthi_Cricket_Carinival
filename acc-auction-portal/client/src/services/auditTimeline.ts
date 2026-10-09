type AuditRow = Record<string, any> & { id?: string };

export function auditTimestampValue(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value?.toMillis && typeof value.toMillis === 'function') return value.toMillis();
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000 + (typeof value.nanoseconds === 'number' ? Math.floor(value.nanoseconds / 1000000) : 0);
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

export function extractAuditTimestamp(row: any): number {
  if (!row) return 0;
  return auditTimestampValue(
    row.timestamp ?? row.createdAt ?? row.created_at ?? row.time ?? row.eventTime ?? row.date
  );
}

export function formatAuditTime(row: any): string {
  const ms = extractAuditTimestamp(row);
  if (!ms || ms <= 0 || isNaN(ms)) return 'now';
  const d = new Date(ms);
  if (isNaN(d.getTime())) return 'now';
  return d.toLocaleTimeString();
}

export function formatAuditAction(row: any): string {
  const act = row?.action || row?.event || row?.type || row?.name;
  return act ? String(act).trim() : 'ACTION';
}

export function formatAuditDetails(row: any): string {
  if (!row) return 'System event';
  if (row.details) return String(row.details);
  if (row.metadata?.details) return String(row.metadata.details);
  if (row.reason) return String(row.reason);
  const target = row.targetId || row.entityId || '';
  const type = row.targetType || row.entityType || '';
  if (target || type) {
    return `${type || 'SYSTEM'} ${target}`.trim();
  }
  return 'System event';
}

/** Read-compatible projection for the old singular collection and canonical plural collection. */
export function mergeAuditTimeline(...streams: AuditRow[][]): AuditRow[] {
  const unique = new Map<string, AuditRow>();
  for (const row of streams.flat()) {
    if (!row) continue;
    const stamp = extractAuditTimestamp(row);
    const action = formatAuditAction(row);
    const target = row.targetId || row.entityId || '';
    const actor = row.actorUid || row.actor || '';
    const fingerprint = [action, target, actor, stamp].join('|');
    if (!unique.has(fingerprint)) {
      unique.set(fingerprint, row);
    }
  }
  return Array.from(unique.values()).sort((a, b) => extractAuditTimestamp(b) - extractAuditTimestamp(a));
}

