import { useAuth } from '../contexts/AuthContext';

export interface Capabilities {
  isSuperAdmin: boolean;
  isOperator: boolean;
  roleLabel: string;
  canHammer: boolean;
  canSkip: boolean;
  canPauseResume: boolean;
  canUndoSale: boolean;
  canBidOnBehalf: boolean;
  canDirectAssign: boolean;
  canSwitchDrawMode: boolean;
  canRelaxBucketMinimum: boolean;
  canExportDatabase: boolean;
  canSnapshotJson: boolean;
  canManageFranchises: boolean;
  canEditPhones: boolean;
  canEditTournamentSettings: boolean;
  canPurgeTrash: boolean;
  canCreateEdition: boolean;
  canViewAuditLog: boolean;
}

export function useCapabilities(modeOverride?: 'SUPER_ADMIN' | 'OPERATOR'): Capabilities {
  const { userDoc } = useAuth();

  const isSuper = modeOverride
    ? modeOverride === 'SUPER_ADMIN'
    : userDoc?.role === 'SUPER_ADMIN';

  if (isSuper) {
    return {
      isSuperAdmin: true,
      isOperator: false,
      roleLabel: 'Super Admin',
      canHammer: true,
      canSkip: true,
      canPauseResume: true,
      canUndoSale: true,
      canBidOnBehalf: true,
      canDirectAssign: true,
      canSwitchDrawMode: true,
      canRelaxBucketMinimum: true,
      canExportDatabase: true,
      canSnapshotJson: true,
      canManageFranchises: true,
      canEditPhones: true,
      canEditTournamentSettings: true,
      canPurgeTrash: true,
      canCreateEdition: true,
      canViewAuditLog: true,
    };
  }

  // Operator role (restricted auction controls only)
  return {
    isSuperAdmin: false,
    isOperator: true,
    roleLabel: 'Floor Operator',
    canHammer: true,
    canSkip: true,
    canPauseResume: true,
    canUndoSale: true,
    canBidOnBehalf: true,
    canDirectAssign: true,
    canSwitchDrawMode: true,
    canRelaxBucketMinimum: false, // Forbidden for Operator
    canExportDatabase: true,
    canSnapshotJson: true,
    canManageFranchises: false, // Forbidden for Operator
    canEditPhones: false, // Forbidden for Operator
    canEditTournamentSettings: false, // Forbidden for Operator
    canPurgeTrash: false, // Forbidden for Operator
    canCreateEdition: false, // Forbidden for Operator
    canViewAuditLog: true,
  };
}
