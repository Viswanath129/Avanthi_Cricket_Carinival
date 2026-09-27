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
exports.createEdition = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.createEdition = (0, https_1.onCall)({ maxInstances: 2 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { name, academicYear, currentAcademicStartYear } = request.data;
    if (!name || !academicYear) {
        throw new https_1.HttpsError('invalid-argument', 'name and academicYear are required.');
    }
    const editionRef = auth_1.db.collection('editions').doc();
    await editionRef.set({
        name: name || 'ACC 2026',
        academicYear: academicYear || '2026-27',
        status: 'DRAFT',
        registrationStart: null,
        registrationEnd: null,
        auctionStart: null,
        currentAcademicStartYear: currentAcademicStartYear || 2026,
        bucketMinimums: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Create auction state sub-document
    await editionRef.collection('auction').doc('state').set({
        editionId: editionRef.id,
        status: 'NOT_STARTED',
        currentRound: 1,
        currentBucketIndex: 0,
        currentLotId: null,
        mode: 'GUEST',
        totalLotsProcessed: 0,
        franchiseStatuses: {},
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, editionId: editionRef.id };
});
//# sourceMappingURL=createEdition.js.map