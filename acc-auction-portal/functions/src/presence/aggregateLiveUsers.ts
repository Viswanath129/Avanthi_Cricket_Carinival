import { onValueWritten } from 'firebase-functions/v2/database';
import * as admin from 'firebase-admin';

export const aggregateLiveUsers = onValueWritten(
  {
    ref: '/presence/{userKey}/{connId}',
    instance: 'studio-6471864054-30ce7-default-rtdb',
  },
  async (event) => {
    // If admin is not initialized, initialize it
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.database();
    const presenceSnap = await db.ref('/presence').once('value');
    const presenceData = presenceSnap.val() || {};

    let uniqueUsers = 0;
    let totalConnections = 0;
    const activeFranchises = new Set<string>();
    let activeTeamLeads = 0;
    let activePlayers = 0;
    let publicViewers = 0;

    for (const [userKey, connections] of Object.entries(presenceData)) {
      if (connections && typeof connections === 'object') {
        const connEntries = Object.values(connections as Record<string, any>);
        if (connEntries.length > 0) {
          uniqueUsers++;
          totalConnections += connEntries.length;

          // Check role/metadata of the user from any of their active connections
          const sampleConn = connEntries[0];
          if (sampleConn) {
            if (sampleConn.type === 'PUBLIC' || userKey.startsWith('pub_')) {
              publicViewers++;
            } else {
              if (sampleConn.role === 'PLAYER') {
                activePlayers++;
              }
              if (sampleConn.identityType === 'TEAM_LEADER') {
                activeTeamLeads++;
              }
              if (sampleConn.franchiseId) {
                activeFranchises.add(String(sampleConn.franchiseId));
              }
            }
          }
        }
      }
    }

    await db.ref('/publicStats/liveUsers').set({
      count: Math.max(1, uniqueUsers),
      connectionsCount: totalConnections,
      activeFranchisesCount: activeFranchises.size,
      activeTeamLeadsCount: activeTeamLeads,
      activePlayersCount: activePlayers,
      publicViewersCount: publicViewers,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });
  }
);
