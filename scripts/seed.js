/**
 * ACC 2026 — Master Database Seeder Script
 * Populates 1 edition, 11 franchises, 20 players, 3 sales, 5 audit logs, and tournament settings.
 */

const fs = require('fs');
const path = require('path');

const EDITION_ID = 'acc-2026';

const SETTINGS = {
  editionId: EDITION_ID,
  tournamentName: 'Avanthi Cricket Carnival 2026',
  academicYear: 2026,
  initialPurse: 1000,
  squadTarget: 15,
  minBidIncrementUnder100: 10,
  minBidIncrement100to199: 20,
  minBidIncrement200Plus: 30,
  lotTimerInitialSeconds: 30,
  lotTimerResetSeconds: 20,
  bucketMinimums: {
    B1: 1,
    B2: 2,
    B3: 1,
    B4: 1,
    D5: 1,
    M6: 0
  }
};

const FRANCHISES = [
  { id: '1', name: 'Titans', shortName: 'TIT', coordinatorName: 'Dr. K. Srinivas', department: 'ECE', purseInitial: 1000, purseRemaining: 860, status: 'APPROVED', squad: { count: 2, auctionPurchases: 2, bucketCounts: { B1: 0, B2: 1, B3: 1, B4: 0, D5: 0 } } },
  { id: '2', name: 'Warriors', shortName: 'WAR', coordinatorName: 'Prof. M. R. Varma', department: 'CSE', purseInitial: 1000, purseRemaining: 920, status: 'APPROVED', squad: { count: 1, auctionPurchases: 1, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 1, D5: 0 } } },
  { id: '3', name: 'Strikers', shortName: 'STR', coordinatorName: 'Dr. P. Ramesh', department: 'MECH', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '4', name: 'Blasters', shortName: 'BLA', coordinatorName: 'Prof. S. Anjaneyulu', department: 'EEE', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '5', name: 'Super Kings', shortName: 'CSK', coordinatorName: 'Dr. G. Venkat', department: 'CIVIL', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '6', name: 'Royals', shortName: 'RR', coordinatorName: 'Prof. V. Sharma', department: 'IT', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '7', name: 'Challengers', shortName: 'RCB', coordinatorName: 'Dr. H. Prasad', department: 'CSE', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '8', name: 'Knights', shortName: 'KKR', coordinatorName: 'Prof. B. Krishna', department: 'ECE', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '9', name: 'Daredevils', shortName: 'DD', coordinatorName: 'Dr. C. Naidu', department: 'MECH', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '10', name: 'Sunrisers', shortName: 'SRH', coordinatorName: 'Prof. L. Murthy', department: 'EEE', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '11', name: 'Giants', shortName: 'GNT', coordinatorName: 'Dr. T. Reddy', department: 'CIVIL', purseInitial: 1000, purseRemaining: 1000, status: 'APPROVED', squad: { count: 0, auctionPurchases: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } }
];

const PLAYERS = [
  { id: 'p1', rollNumber: '25811A0403', name: 'Sai Teja', bucket: 'B2', playerType: 'ALL_ROUNDER', basePrice: 50, auctionStatus: 'SOLD' },
  { id: 'p2', rollNumber: '25815A0403', name: 'Karthik Varma', bucket: 'B3', playerType: 'BATTER', basePrice: 60, auctionStatus: 'SOLD' },
  { id: 'p3', rollNumber: '23811A4201', name: 'Dinesh Reddy', bucket: 'B4', playerType: 'BOWLER', basePrice: 40, auctionStatus: 'SOLD' },
  { id: 'p4', rollNumber: '26811A0501', name: 'Naveen Kumar', bucket: 'B1', playerType: 'BATTER', basePrice: 30, auctionStatus: 'AVAILABLE' },
  { id: 'p5', rollNumber: '24597-CM-015', name: 'Sravan Goud', bucket: 'D5', playerType: 'WK_BATTER', basePrice: 50, auctionStatus: 'AVAILABLE' },
  { id: 'p6', rollNumber: '26597-M-041', name: 'Ravi Teja', bucket: 'D5', playerType: 'BOWLER', basePrice: 30, auctionStatus: 'AVAILABLE' },
  { id: 'p7', rollNumber: '25811A0512', name: 'Vamsi Krishna', bucket: 'B2', playerType: 'ALL_ROUNDER', basePrice: 50, auctionStatus: 'AVAILABLE' },
  { id: 'p8', rollNumber: '25811A0321', name: 'Manish Paul', bucket: 'B2', playerType: 'BOWLER', basePrice: 40, auctionStatus: 'AVAILABLE' },
  { id: 'p9', rollNumber: '25815A0502', name: 'Tarun Rao', bucket: 'B3', playerType: 'BATTER', basePrice: 60, auctionStatus: 'AVAILABLE' },
  { id: 'p10', rollNumber: '23811A0445', name: 'Harish Babu', bucket: 'B4', playerType: 'ALL_ROUNDER', basePrice: 70, auctionStatus: 'AVAILABLE' },
  { id: 'p11', rollNumber: '26811A0410', name: 'Pawan Kalyan', bucket: 'B1', playerType: 'BOWLER', basePrice: 30, auctionStatus: 'AVAILABLE' },
  { id: 'p12', rollNumber: '26811A0215', name: 'Anil Kumar', bucket: 'B1', playerType: 'ALL_ROUNDER', basePrice: 40, auctionStatus: 'AVAILABLE' },
  { id: 'p13', rollNumber: '25815A0108', name: 'Bhanu Chander', bucket: 'B3', playerType: 'WK_BATTER', basePrice: 50, auctionStatus: 'AVAILABLE' },
  { id: 'p14', rollNumber: '23811A0599', name: 'Vikram Simha', bucket: 'B4', playerType: 'BATTER', basePrice: 60, auctionStatus: 'AVAILABLE' },
  { id: 'p15', rollNumber: '24597-EE-022', name: 'Mahesh Goud', bucket: 'D5', playerType: 'ALL_ROUNDER', basePrice: 40, auctionStatus: 'AVAILABLE' },
  { id: 'p16', rollNumber: '25811A1204', name: 'Siddharth Roy', bucket: 'B2', playerType: 'BATTER', basePrice: 50, auctionStatus: 'AVAILABLE' },
  { id: 'p17', rollNumber: '25815A0201', name: 'Ajay Varma', bucket: 'B3', playerType: 'BOWLER', basePrice: 40, auctionStatus: 'AVAILABLE' },
  { id: 'p18', rollNumber: '23811A0111', name: 'Ganesh Das', bucket: 'B4', playerType: 'BOWLER', basePrice: 50, auctionStatus: 'AVAILABLE' },
  { id: 'p19', rollNumber: '26811A0560', name: 'Nikhil Raj', bucket: 'B1', playerType: 'BATTER', basePrice: 30, auctionStatus: 'AVAILABLE' },
  { id: 'p20', rollNumber: '24597-M-008', name: 'Chaitanya Sri', bucket: 'D5', playerType: 'BATTER', basePrice: 40, auctionStatus: 'AVAILABLE' }
];

const SALES = [
  { id: 's1', lotId: 'lot-1', playerId: 'p1', playerName: 'Sai Teja', franchiseId: '1', franchiseName: 'Titans', price: 90, status: 'SOLD', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 's2', lotId: 'lot-2', playerId: 'p2', playerName: 'Karthik Varma', franchiseId: '1', franchiseName: 'Titans', price: 50, status: 'SOLD', createdAt: new Date(Date.now() - 3000000).toISOString() },
  { id: 's3', lotId: 'lot-3', playerId: 'p3', playerName: 'Dinesh Reddy', franchiseId: '2', franchiseName: 'Warriors', price: 80, status: 'SOLD', createdAt: new Date(Date.now() - 2400000).toISOString() }
];

const AUDIT_LOGS = [
  { id: 'a1', actor: 'SUPER_ADMIN', action: 'CREATE_EDITION', entity: 'EDITION', entityId: 'acc-2026', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a2', actor: 'SUPER_ADMIN', action: 'APPROVE_FRANCHISE', entity: 'FRANCHISE', entityId: '1', timestamp: new Date(Date.now() - 5400000).toISOString() },
  { id: 'a3', actor: 'OPERATOR', action: 'HAMMER_LOT', entity: 'LOT', entityId: 'lot-1', details: 'Sold to Titans @ 90', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a4', actor: 'OPERATOR', action: 'HAMMER_LOT', entity: 'LOT', entityId: 'lot-2', details: 'Sold to Titans @ 50', timestamp: new Date(Date.now() - 3000000).toISOString() },
  { id: 'a5', actor: 'OPERATOR', action: 'HAMMER_LOT', entity: 'LOT', entityId: 'lot-3', details: 'Sold to Warriors @ 80', timestamp: new Date(Date.now() - 2400000).toISOString() }
];

function seed() {
  console.log('====================================================');
  console.log('ACC 2026 — MASTER SEED GENERATOR');
  console.log('====================================================');

  const seedPayload = {
    edition: SETTINGS,
    franchises: FRANCHISES,
    players: PLAYERS,
    sales: SALES,
    auditLogs: AUDIT_LOGS,
    generatedAt: new Date().toISOString()
  };

  const seedDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }

  const seedPath = path.join(seedDir, 'seed-data.json');
  fs.writeFileSync(seedPath, JSON.stringify(seedPayload, null, 2), 'utf8');

  console.log(`[PASS] 1 Edition created: ${SETTINGS.editionId}`);
  console.log(`[PASS] 11 Franchises seeded: ${FRANCHISES.map(f => f.name).join(', ')}`);
  console.log(`[PASS] 20 Demo Players seeded across B1, B2, B3, B4, D5`);
  console.log(`[PASS] 3 Demo Sales generated: ${SALES.length} committed acquisitions`);
  console.log(`[PASS] 5 Audit Log entries recorded`);
  console.log(`[PASS] Settings configured with official bucket minimums & increments`);
  console.log(`[PASS] Seed output written to: ${seedPath}`);
  console.log('====================================================');
  console.log('SEED DATA DEPLOYMENT READY');
  console.log('====================================================');
}

seed();
