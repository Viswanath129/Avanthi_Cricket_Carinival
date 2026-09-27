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
exports.aggregateLiveUsers = void 0;
const database_1 = require("firebase-functions/v2/database");
const admin = __importStar(require("firebase-admin"));
exports.aggregateLiveUsers = (0, database_1.onValueWritten)({
    ref: '/presence/{userKey}/{connId}',
    instance: 'studio-6471864054-30ce7-default-rtdb',
}, async (event) => {
    // If admin is not initialized, initialize it
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    const db = admin.database();
    const presenceSnap = await db.ref('/presence').once('value');
    const presenceData = presenceSnap.val() || {};
    let uniqueUsers = 0;
    let totalConnections = 0;
    const activeFranchises = new Set();
    let activeTeamLeads = 0;
    let activePlayers = 0;
    let publicViewers = 0;
    for (const [userKey, connections] of Object.entries(presenceData)) {
        if (connections && typeof connections === 'object') {
            const connEntries = Object.values(connections);
            if (connEntries.length > 0) {
                uniqueUsers++;
                totalConnections += connEntries.length;
                // Check role/metadata of the user from any of their active connections
                const sampleConn = connEntries[0];
                if (sampleConn) {
                    if (sampleConn.type === 'PUBLIC' || userKey.startsWith('pub_')) {
                        publicViewers++;
                    }
                    else {
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
});
//# sourceMappingURL=aggregateLiveUsers.js.map