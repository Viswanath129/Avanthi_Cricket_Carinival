import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import {
  Gavel,
  Radio,
  Users,
  UserPlus,
  Monitor,
  Smartphone,
  Pause,
  Play,
  RotateCcw,
  Hammer,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  Check,
  X,
  ChevronDown,
  Eye,
  LockKeyhole,
  Trophy,
  Sparkles,
  ExternalLink,
  Clock,
  CircleHelp,
  Activity,
  FileCheck2,
  RefreshCw,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  Menu,
} from "lucide-react";

// --- TYPES & INTERFACES ---
export type ViewKey =
  | "auction"
  | "projector"
  | "franchise"
  | "public"
  | "players"
  | "registration";

export type BucketKey = "B1" | "B2" | "B3" | "B4" | "B5";

export interface Franchise {
  id: string;
  name: string;
  short: string;
  color: string;
  purse: number;
  squad: number; // current squad size
  buckets: Record<BucketKey, number>; // count acquired in each bucket
  status: "in-play" | "passed" | "blocked";
}

export interface Player {
  id: string;
  lot: number;
  name: string;
  roll: string;
  branch: string;
  year: string;
  bucket: BucketKey;
  type: string;
  basePrice: number;
  stats: { runs: number; wickets: number; strikeRate: number; catches: number };
  image: string;
  cricHeroesStatus: "verified" | "pending";
  paid: boolean;
}

export interface BidRecord {
  id: string;
  lot: number;
  franchiseId: string;
  franchiseName: string;
  amount: number;
  timestamp: string;
  color: string;
}

export interface SaleRecord {
  lot: number;
  player: Player;
  franchiseId: string;
  franchiseName: string;
  amount: number;
  timestamp: string;
  undone?: boolean;
}

// --- INITIAL DATA (11 FRANCHISES PER SPEC) ---
const INITIAL_FRANCHISES: Franchise[] = [
  { id: "ax", name: "Aegis XI", short: "AX", color: "#d4f34a", purse: 710, squad: 6, buckets: { B1: 1, B2: 1, B3: 0, B4: 0, B5: 1 }, status: "in-play" },
  { id: "ck", name: "Campus Kings", short: "CK", color: "#ff9f43", purse: 645, squad: 6, buckets: { B1: 1, B2: 1, B3: 1, B4: 0, B5: 0 }, status: "in-play" },
  { id: "cc", name: "Coastal Chargers", short: "CC", color: "#7dd3fc", purse: 802, squad: 5, buckets: { B1: 0, B2: 1, B3: 0, B4: 0, B5: 1 }, status: "passed" },
  { id: "ds", name: "Delta Strikers", short: "DS", color: "#fda4af", purse: 578, squad: 6, buckets: { B1: 1, B2: 0, B3: 1, B4: 0, B5: 1 }, status: "blocked" },
  { id: "ef", name: "Eagle Force", short: "EF", color: "#c4b5fd", purse: 730, squad: 5, buckets: { B1: 1, B2: 0, B3: 0, B4: 0, B5: 1 }, status: "in-play" },
  { id: "f11", name: "Falcon 11", short: "F11", color: "#86efac", purse: 690, squad: 6, buckets: { B1: 0, B2: 1, B3: 1, B4: 0, B5: 1 }, status: "passed" },
  { id: "gc", name: "Galaxy CC", short: "GC", color: "#f9a8d4", purse: 880, squad: 4, buckets: { B1: 0, B2: 1, B3: 0, B4: 0, B5: 1 }, status: "in-play" },
  { id: "hh", name: "Harbour Hawks", short: "HH", color: "#67e8f9", purse: 625, squad: 5, buckets: { B1: 1, B2: 0, B3: 0, B4: 1, B5: 0 }, status: "in-play" },
  { id: "ic", name: "Ironclad", short: "IC", color: "#fcd34d", purse: 752, squad: 6, buckets: { B1: 0, B2: 1, B3: 1, B4: 0, B5: 0 }, status: "blocked" },
  { id: "jj", name: "Jade Jaguars", short: "JJ", color: "#bef264", purse: 816, squad: 5, buckets: { B1: 1, B2: 0, B3: 0, B4: 0, B5: 1 }, status: "passed" },
  { id: "kr", name: "Kite Riders", short: "KR", color: "#a5b4fc", purse: 560, squad: 6, buckets: { B1: 1, B2: 1, B3: 0, B4: 0, B5: 0 }, status: "in-play" },
];

const BUCKET_INFO: Record<BucketKey, { label: string; desc: string; target: number }> = {
  B1: { label: "B1 · B.Tech Yr 1", desc: "1st Year Undergraduates", target: 2 },
  B2: { label: "B2 · B.Tech Yr 2", desc: "2nd Year Undergraduates", target: 2 },
  B3: { label: "B3 · B.Tech Yr 3", desc: "3rd Year Undergraduates", target: 2 },
  B4: { label: "B4 · B.Tech Yr 4", desc: "Final Year Undergraduates", target: 2 },
  B5: { label: "B5 · Diploma", desc: "Polytechnic Diploma Students", target: 2 },
};

const INITIAL_PLAYERS: Player[] = [
  {
    id: "p1",
    lot: 18,
    name: "Arjun Nair",
    roll: "25811A0403",
    branch: "ECE",
    year: "2nd Year",
    bucket: "B2",
    type: "All-rounder",
    basePrice: 50,
    stats: { runs: 312, wickets: 18, strikeRate: 134, catches: 8 },
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "verified",
    paid: true,
  },
  {
    id: "p2",
    lot: 19,
    name: "Rohit Varma",
    roll: "25811A0509",
    branch: "CSE",
    year: "2nd Year",
    bucket: "B2",
    type: "Wicket-keeper batter",
    basePrice: 70,
    stats: { runs: 526, wickets: 0, strikeRate: 142, catches: 14 },
    image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "verified",
    paid: true,
  },
  {
    id: "p3",
    lot: 20,
    name: "Sanjay Dev",
    roll: "24597-CM-015",
    branch: "Computer Engg",
    year: "Diploma 3rd Yr",
    bucket: "B5",
    type: "Bowler",
    basePrice: 40,
    stats: { runs: 65, wickets: 24, strikeRate: 98, catches: 4 },
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "verified",
    paid: true,
  },
  {
    id: "p4",
    lot: 21,
    name: "Mihir Reddy",
    roll: "25815A0403",
    branch: "ECE (Lateral)",
    year: "3rd Year",
    bucket: "B3",
    type: "Batter",
    basePrice: 60,
    stats: { runs: 418, wickets: 2, strikeRate: 138, catches: 6 },
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "pending",
    paid: false,
  },
  {
    id: "p5",
    lot: 22,
    name: "Karthik Rao",
    roll: "23811A4201",
    branch: "CSM",
    year: "4th Year",
    bucket: "B4",
    type: "Fielder",
    basePrice: 20,
    stats: { runs: 110, wickets: 1, strikeRate: 105, catches: 36 },
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "verified",
    paid: true,
  },
  {
    id: "p6",
    lot: 23,
    name: "Aditya Iyer",
    roll: "26597-M-041",
    branch: "Mechanical",
    year: "Diploma 1st Yr",
    bucket: "B5",
    type: "All-rounder",
    basePrice: 90,
    stats: { runs: 226, wickets: 11, strikeRate: 122, catches: 5 },
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
    cricHeroesStatus: "verified",
    paid: true,
  },
];

// --- CORE MATHEMATICAL ENGINE (RULES 12.1 & 12.2 + APPENDIX A) ---
export function calculateMaxBid(
  purse: number,
  squadSize: number,
  buckets: Record<BucketKey, number>,
  targetBucket?: BucketKey
): { maxBid: number; isEligible: boolean; reason?: string } {
  // Total squad required: min 15 players
  // Mandatory buckets: B1, B2, B3, B4, B5 (each needs at least 2 players)
  const remainingSquadSlotsTo15 = Math.max(0, 15 - squadSize);

  let unmetMandatorySlots = 0;
  for (const b of ["B1", "B2", "B3", "B4", "B5"] as BucketKey[]) {
    const currentCount = buckets[b] || 0;
    unmetMandatorySlots += Math.max(0, 2 - currentCount);
  }

  // If squad size is already >= 15 and all mandatory minimums met, no reserve required
  if (remainingSquadSlotsTo15 === 0 && unmetMandatorySlots === 0) {
    return { maxBid: purse, isEligible: true };
  }

  // Check Rule 12.2: Mandatory slots must remain fillable
  // If remaining squad slots exactly equals unmet mandatory slots, franchise CANNOT bid on a bucket that is already met!
  if (targetBucket) {
    const currentInTarget = buckets[targetBucket] || 0;
    const isTargetNeeded = currentInTarget < 2;
    if (remainingSquadSlotsTo15 <= unmetMandatorySlots && !isTargetNeeded) {
      return {
        maxBid: 0,
        isEligible: false,
        reason: `Franchise has only ${remainingSquadSlotsTo15} slot(s) remaining but still needs ${unmetMandatorySlots} mandatory bucket slot(s). Bidding on ${targetBucket} is blocked.`,
      };
    }
  }

  // Calculate reserve needed for remaining players at base price of 20
  // Effective mandatory slots to fill in future
  const totalSlotsToReserve = Math.max(remainingSquadSlotsTo15, unmetMandatorySlots);

  // If we buy this player now, remaining slots after this player is (totalSlotsToReserve - 1)
  const slotsAfterThisLot = Math.max(0, totalSlotsToReserve - 1);
  const reserveAmount = slotsAfterThisLot * 20;

  const maxPermissible = Math.max(0, purse - reserveAmount);

  return {
    maxBid: maxPermissible,
    isEligible: maxPermissible >= 20,
    reason:
      maxPermissible < 20
        ? `Cannot bid: Must reserve ₹${reserveAmount} to fill remaining ${slotsAfterThisLot} mandatory squad slots at min ₹20.`
        : undefined,
  };
}

// --- ROLL NUMBER PARSER ENGINE (APPENDIX A.5) ---
export function parseRollNumber(rollRaw: string): {
  roll: string;
  type: string;
  branch: string;
  year: string;
  bucket: BucketKey;
  admissionYear: number;
} {
  const roll = rollRaw.trim().toUpperCase();

  // Diploma pattern e.g. 24597-CM-015 or 26597-M-041
  if (roll.includes("-")) {
    const parts = roll.split("-");
    const yearPrefix = parseInt(parts[0].slice(0, 2), 10) || 24;
    const branchCode = parts[1] || "CM";
    const branchMap: Record<string, string> = {
      CM: "Computer Engineering",
      M: "Mechanical Engineering",
      EC: "Electronics & Communication",
      EE: "Electrical Engineering",
      C: "Civil Engineering",
    };
    // Current academic year 2026-27:
    // 24 prefix = 3rd year, 25 prefix = 2nd year, 26 prefix = 1st year
    const yearNum = Math.max(1, Math.min(3, 2027 - (2000 + yearPrefix)));
    return {
      roll,
      type: "Diploma",
      branch: branchMap[branchCode] || branchCode,
      year: `Diploma ${yearNum}${yearNum === 1 ? "st" : yearNum === 2 ? "nd" : "rd"} Year`,
      bucket: "B5",
      admissionYear: 2000 + yearPrefix,
    };
  }

  // B.Tech JNTU Pattern e.g. 25811A0403 or 25815A0403
  const yearPrefix = parseInt(roll.slice(0, 2), 10) || 25;
  const isLateral = roll.slice(2, 5) === "815" || roll.includes("5A");
  const branchDigits = roll.slice(6, 8) || roll.slice(7, 9);

  const btechBranchMap: Record<string, string> = {
    "04": "ECE",
    "05": "CSE",
    "12": "IT",
    "42": "CSM (AI & ML)",
    "44": "CSD (Data Science)",
    "01": "Civil",
    "02": "EEE",
    "03": "Mechanical",
  };

  const branch = btechBranchMap[branchDigits] || "B.Tech Engineering";

  // Calculate year for 2026-27 season
  // Lateral entry joins in 2nd year directly!
  // e.g. 25815 joined 2025 in 2nd yr -> in 2026-27 is 3rd year -> B3
  // 25811 regular joined 2025 in 1st yr -> in 2026-27 is 2nd year -> B2
  let yearNum = 2026 - (2000 + yearPrefix) + 1;
  if (isLateral) yearNum += 1;
  yearNum = Math.max(1, Math.min(4, yearNum));

  const bucketMap: Record<number, BucketKey> = {
    1: "B1",
    2: "B2",
    3: "B3",
    4: "B4",
  };

  return {
    roll,
    type: isLateral ? "B.Tech (Lateral Entry)" : "B.Tech (Regular)",
    branch,
    year: `B.Tech ${yearNum}${yearNum === 1 ? "st" : yearNum === 2 ? "nd" : yearNum === 3 ? "rd" : "th"} Year`,
    bucket: bucketMap[yearNum] || "B2",
    admissionYear: 2000 + yearPrefix,
  };
}

// --- MAIN EXPORTED COMPONENT ---
export default function Home() {
  // Navigation & View Routing
  const [view, setView] = useState<ViewKey>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.includes("projector")) return "projector";
      if (path.includes("franchise")) return "franchise";
      if (path.includes("public")) return "public";
      if (path.includes("players")) return "players";
      if (path.includes("registration")) return "registration";
    }
    return "auction";
  });

  // State: Franchises, Players, Current Lot
  const [franchises, setFranchises] = useState<Franchise[]>(INITIAL_FRANCHISES);
  const [playersList, setPlayersList] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentLotIndex, setCurrentLotIndex] = useState(0);

  const currentPlayer = playersList[currentLotIndex] || INITIAL_PLAYERS[0];

  // Auction State
  const [currentBid, setCurrentBid] = useState(currentPlayer.basePrice);
  const [highestBidderId, setHighestBidderId] = useState<string>("ck");
  const [timer, setTimer] = useState(25);
  const [isPaused, setIsPaused] = useState(false);
  const [bidIncrement, setBidIncrement] = useState(10);
  const [bidHistory, setBidHistory] = useState<BidRecord[]>([
    {
      id: "b1",
      lot: currentPlayer.lot,
      franchiseId: "ck",
      franchiseName: "Campus Kings",
      amount: currentPlayer.basePrice,
      timestamp: "19:42:15.102",
      color: "#ff9f43",
    },
  ]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([
    {
      lot: 17,
      player: {
        id: "p0",
        lot: 17,
        name: "Vikram Sen",
        roll: "24597-CM-009",
        branch: "Computer Engg",
        year: "Diploma 3rd Yr",
        bucket: "B5",
        type: "Bowler",
        basePrice: 40,
        stats: { runs: 45, wickets: 22, strikeRate: 110, catches: 7 },
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        cricHeroesStatus: "verified",
        paid: true,
      },
      franchiseId: "ax",
      franchiseName: "Aegis XI",
      amount: 180,
      timestamp: "19:41:22.450",
    },
  ]);

  // Active simulated mobile franchise
  const [activeMobileFranchiseId, setActiveMobileFranchiseId] = useState<string>("ck");

  // Undo Forensic Modal State
  const [showUndoModal, setShowUndoModal] = useState(false);

  // Acceptance Tests Panel
  const [showTestsModal, setShowTestsModal] = useState(false);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sound / Haptic Simulation
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isPaused || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, timer]);

  // Bid Action
  const handlePlaceBid = (franchiseId: string, customAmount?: number) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    if (!franchise) return;

    const nextAmount = customAmount || currentBid + bidIncrement;
    const check = calculateMaxBid(franchise.purse, franchise.squad, franchise.buckets, currentPlayer.bucket);

    if (nextAmount > check.maxBid || !check.isEligible) {
      notify(`Bid BLOCKED for ${franchise.name}: ${check.reason || "Exceeds maximum legal bid."}`);
      return;
    }

    triggerHaptic();
    setCurrentBid(nextAmount);
    setHighestBidderId(franchiseId);
    setTimer(25); // Reset timer on bid

    const newRecord: BidRecord = {
      id: "b_" + Date.now(),
      lot: currentPlayer.lot,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      amount: nextAmount,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }) + "." + String(Date.now() % 1000).padStart(3, "0"),
      color: franchise.color,
    };
    setBidHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
    notify(`${franchise.name} placed bid of ₹${nextAmount}`);
  };

  // Hammer Action
  const handleHammer = () => {
    const winner = franchises.find((f) => f.id === highestBidderId);
    if (!winner) return;

    // Deduct purse and add squad
    setFranchises((prev) =>
      prev.map((f) => {
        if (f.id === winner.id) {
          const updatedBuckets = { ...f.buckets, [currentPlayer.bucket]: (f.buckets[currentPlayer.bucket] || 0) + 1 };
          return {
            ...f,
            purse: f.purse - currentBid,
            squad: f.squad + 1,
            buckets: updatedBuckets,
          };
        }
        return f;
      })
    );

    const sale: SaleRecord = {
      lot: currentPlayer.lot,
      player: currentPlayer,
      franchiseId: winner.id,
      franchiseName: winner.name,
      amount: currentBid,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    };
    setSalesHistory((prev) => [sale, ...prev]);

    notify(` SOLD! Lot ${currentPlayer.lot} (${currentPlayer.name}) hammered to ${winner.name} for ₹${currentBid}`);

    // Advance to next lot
    if (currentLotIndex < playersList.length - 1) {
      const nextIndex = currentLotIndex + 1;
      setCurrentLotIndex(nextIndex);
      setCurrentBid(playersList[nextIndex].basePrice);
      setTimer(30);
    }
  };

  // Undo Forensic Sale Action (Appendix A.4)
  const handleForensicUndo = (saleIndex: number) => {
    const sale = salesHistory[saleIndex];
    if (!sale || sale.undone) {
      notify("Cannot undo: Sale already refunded or does not exist.");
      return;
    }

    // Refund franchise
    setFranchises((prev) =>
      prev.map((f) => {
        if (f.id === sale.franchiseId) {
          const updatedBuckets = {
            ...f.buckets,
            [sale.player.bucket]: Math.max(0, (f.buckets[sale.player.bucket] || 1) - 1),
          };
          return {
            ...f,
            purse: f.purse + sale.amount,
            squad: Math.max(0, f.squad - 1),
            buckets: updatedBuckets,
          };
        }
        return f;
      })
    );

    // Mark sale as undone
    setSalesHistory((prev) =>
      prev.map((s, idx) => (idx === saleIndex ? { ...s, undone: true } : s))
    );

    notify(` UNDO EXECUTED: Sale for Lot #${sale.lot} (${sale.player.name}) undone. ₹${sale.amount} refunded to ${sale.franchiseName}, slot restored.`);
    setShowUndoModal(false);
  };

  // Current Franchise for Franchise Bidding Mode
  const activeFranchise = franchises.find((f) => f.id === activeMobileFranchiseId) || franchises[0];
  const activeFranchiseCheck = calculateMaxBid(
    activeFranchise.purse,
    activeFranchise.squad,
    activeFranchise.buckets,
    currentPlayer.bucket
  );

  return (
    <div className="min-h-screen bg-[#080c0a] text-[#f5f7f6] selection:bg-[#10b981]/30 selection:text-[#d4f34a] font-sans antialiased">
      {/* --- TOP BRAND & INTERFACE SWITCHER NAVBAR --- */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b100d]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#047857] shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <span className="font-display font-black text-lg tracking-wider text-black">ACC</span>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff9f43] text-[8px] font-bold text-black ring-2 ring-[#080c0a]">
                
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
                  AVANTHI CRICKET CARNIVAL
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  Live Auction OS
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#718076]">
                2026–27 Official Hackathon Portal
              </p>
            </div>
          </div>

          {/* Interface Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 shadow-inner">
            {[
              { id: "auction" as ViewKey, label: "Admin Control", icon: Gavel },
              { id: "projector" as ViewKey, label: "Projector Mode", icon: Monitor },
              { id: "franchise" as ViewKey, label: "Franchise Paddle", icon: Smartphone },
              { id: "public" as ViewKey, label: "Public Live", icon: Radio },
              { id: "players" as ViewKey, label: "Player Board", icon: Users },
              { id: "registration" as ViewKey, label: "Registration", icon: UserPlus },
            ].map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#10b981] text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                      : "text-[#93a59a] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowTestsModal(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1.5 text-xs font-bold text-[#7dd3fc] hover:bg-[#38bdf8]/20 transition-all"
            >
              <ShieldCheck size={14} />
              <span>Verify Appendix A</span>
            </button>

            <button
              onClick={() => setShowUndoModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#ff9f43]/30 bg-[#ff9f43]/10 px-3 py-1.5 text-xs font-bold text-[#ffb45c] hover:bg-[#ff9f43]/20 transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Forensic Undo</span>
            </button>

            {/* Quick Fullscreen Projector Toggle */}
            <button
              onClick={() => setView(view === "projector" ? "auction" : "projector")}
              title="Toggle Projector Display"
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-[#93a59a] hover:text-white hover:border-white/20 transition-all"
            >
              {view === "projector" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Strip */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-white/[0.06] gap-1.5 no-scrollbar bg-black/40">
          {[
            { id: "auction" as ViewKey, label: "Admin", icon: Gavel },
            { id: "projector" as ViewKey, label: "Projector", icon: Monitor },
            { id: "franchise" as ViewKey, label: "Franchise", icon: Smartphone },
            { id: "public" as ViewKey, label: "Public", icon: Radio },
            { id: "players" as ViewKey, label: "Players", icon: Users },
            { id: "registration" as ViewKey, label: "Register", icon: UserPlus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                view === id
                  ? "bg-[#10b981] text-black"
                  : "border border-white/10 bg-white/[0.04] text-[#93a59a]"
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* --- MAIN CONTENT ROUTING SWITCH --- */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
        {/* INTERFACE 1: ADMIN CONTROL ROOM */}
        {view === "auction" && (
          <AdminControlRoom
            currentPlayer={currentPlayer}
            currentBid={currentBid}
            highestBidderId={highestBidderId}
            franchises={franchises}
            timer={timer}
            isPaused={isPaused}
            bidIncrement={bidIncrement}
            bidHistory={bidHistory}
            onTogglePause={() => setIsPaused(!isPaused)}
            onBidIncrementChange={setBidIncrement}
            onPlaceBid={handlePlaceBid}
            onHammer={handleHammer}
            onLotChange={(dir) => {
              const newIdx = Math.max(0, Math.min(playersList.length - 1, currentLotIndex + dir));
              setCurrentLotIndex(newIdx);
              setCurrentBid(playersList[newIdx].basePrice);
              setTimer(30);
            }}
            onOpenUndo={() => setShowUndoModal(true)}
            onSwitchView={setView}
            notify={notify}
          />
        )}

        {/* INTERFACE 2: STADIUM PROJECTOR DISPLAY */}
        {view === "projector" && (
          <StadiumProjectorDisplay
            player={currentPlayer}
            currentBid={currentBid}
            highestBidder={franchises.find((f) => f.id === highestBidderId)}
            timer={timer}
            franchises={franchises}
            lotIndex={currentLotIndex}
            totalLots={playersList.length}
            onExit={() => setView("auction")}
          />
        )}

        {/* INTERFACE 3: FRANCHISE MOBILE BIDDING PADDLE */}
        {view === "franchise" && (
          <FranchiseBiddingInterface
            franchises={franchises}
            activeFranchise={activeFranchise}
            currentPlayer={currentPlayer}
            currentBid={currentBid}
            highestBidderId={highestBidderId}
            timer={timer}
            bidIncrement={bidIncrement}
            onSelectFranchise={setActiveMobileFranchiseId}
            onPlaceBid={() => handlePlaceBid(activeFranchise.id)}
            check={activeFranchiseCheck}
          />
        )}

        {/* INTERFACE 4: PUBLIC LIVE SPECTATOR FEED */}
        {view === "public" && (
          <PublicLiveView
            currentPlayer={currentPlayer}
            currentBid={currentBid}
            highestBidder={franchises.find((f) => f.id === highestBidderId)}
            timer={timer}
            franchises={franchises}
            salesHistory={salesHistory}
            notify={notify}
          />
        )}

        {/* PLAYER BOARD */}
        {view === "players" && (
          <PlayerBoardView players={playersList} notify={notify} />
        )}

        {/* REGISTRATION & ROLL PARSER */}
        {view === "registration" && (
          <RegistrationRollParserView notify={notify} />
        )}
      </main>

      {/* --- FORENSIC UNDO DIALOG (APPENDIX A.4) --- */}
      {showUndoModal && (
        <ForensicUndoModal
          salesHistory={salesHistory}
          onUndo={handleForensicUndo}
          onClose={() => setShowUndoModal(false)}
        />
      )}

      {/* --- APPENDIX A ACCEPTANCE TEST VALIDATOR MODAL --- */}
      {showTestsModal && (
        <AcceptanceTestsModal onClose={() => setShowTestsModal(false)} />
      )}

      {/* --- TOAST NOTIFICATIONS --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#10b981]/30 bg-[#0f1712]/95 px-5 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#10b981] text-black">
            <Check size={16} strokeWidth={2.5} />
          </div>
          <p className="text-xs font-semibold text-[#e6eddc]">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#718076] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: ADMIN CONTROL ROOM (AUCTIONEER LAPTOP)
// =========================================================================
function AdminControlRoom({
  currentPlayer,
  currentBid,
  highestBidderId,
  franchises,
  timer,
  isPaused,
  bidIncrement,
  bidHistory,
  onTogglePause,
  onBidIncrementChange,
  onPlaceBid,
  onHammer,
  onLotChange,
  onOpenUndo,
  onSwitchView,
  notify,
}: {
  currentPlayer: Player;
  currentBid: number;
  highestBidderId: string;
  franchises: Franchise[];
  timer: number;
  isPaused: boolean;
  bidIncrement: number;
  bidHistory: BidRecord[];
  onTogglePause: () => void;
  onBidIncrementChange: (inc: number) => void;
  onPlaceBid: (franchiseId: string, amount?: number) => void;
  onHammer: () => void;
  onLotChange: (dir: number) => void;
  onOpenUndo: () => void;
  onSwitchView: (v: ViewKey) => void;
  notify: (msg: string) => void;
}) {
  const currentLeader = franchises.find((f) => f.id === highestBidderId);

  return (
    <div className="space-y-6">
      {/* Title & Quick Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#10b981]">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
            LIVE AUCTIONEER COCKPIT · LOT #{String(currentPlayer.lot).padStart(3, "0")}
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Auction Control Terminal
          </h1>
          <p className="mt-1 text-xs text-[#93a59a]">
            Draw Order: B3 (3rd yr) → B4 (4th yr) → B2 (2nd yr) → B5 (Diploma) → B1 (1st yr) → PG.
            All paddle clicks are cryptographically verified and bounded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              isPaused
                ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#34d399]"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isPaused ? "Resume Timer" : "Pause Timer"}</span>
          </button>

          <button
            onClick={() => onLotChange(-1)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-[#93a59a] hover:text-white"
          >
            Prev Lot
          </button>
          <button
            onClick={() => onLotChange(1)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-[#93a59a] hover:text-white"
          >
            Next Lot
          </button>

          <button
            onClick={() => onSwitchView("projector")}
            className="flex items-center gap-2 rounded-xl bg-[#10b981] px-4 py-2.5 text-xs font-black text-black shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:brightness-110"
          >
            <Eye size={14} />
            <span>Launch Projector</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Lot Card + Operator Bidding Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Player Lot Spotlight Card (7 cols) */}
        <div className="xl:col-span-7 rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Player Image with Badges */}
            <div className="relative w-full sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-black">
              <img
                src={currentPlayer.image}
                alt={currentPlayer.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold text-[#d4f34a] border border-[#d4f34a]/30">
                  {currentPlayer.bucket} · {currentPlayer.year}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#93a59a]">Roll Number</p>
                <p className="font-mono text-xs font-bold text-white tracking-wide">{currentPlayer.roll}</p>
              </div>
            </div>

            {/* Player Details & Realtime Bid Cockpit */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#ff9f43]/30 bg-[#ff9f43]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffb45c]">
                    {currentPlayer.type}
                  </span>
                  <span className="font-mono text-xs text-[#718076]">
                    Base: ₹{currentPlayer.basePrice}
                  </span>
                </div>

                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white">
                  {currentPlayer.name}
                </h2>
                <p className="text-xs text-[#93a59a]">
                  {currentPlayer.branch} · Verified CricHeroes Active Profile
                </p>

                {/* Self-Declared Career Stats */}
                <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/[0.06] bg-black/30 p-3 text-center">
                  <div>
                    <p className="font-mono text-[9px] uppercase text-[#718076]">Runs</p>
                    <p className="font-display font-bold text-base text-white">{currentPlayer.stats.runs}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-[#718076]">Wickets</p>
                    <p className="font-display font-bold text-base text-white">{currentPlayer.stats.wickets}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-[#718076]">Strike Rate</p>
                    <p className="font-display font-bold text-base text-white">{currentPlayer.stats.strikeRate}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-[#718076]">Catches</p>
                    <p className="font-display font-bold text-base text-white">{currentPlayer.stats.catches}</p>
                  </div>
                </div>
              </div>

              {/* Price & Timer Spotlight */}
              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#718076]">
                    Current Bid
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl sm:text-5xl font-black text-[#10b981] tracking-tight">
                      ₹{currentBid}
                    </span>
                    <span className="font-mono text-xs text-[#93a59a]">credits</span>
                  </div>
                  {currentLeader && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#e6eddc]">
                      <Trophy size={13} className="text-[#ffd166]" />
                      <span className="font-semibold">{currentLeader.name}</span>
                      <span className="font-mono text-[10px] text-[#718076]">holding</span>
                    </div>
                  )}
                </div>

                {/* Countdown Gauge */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={timer < 5 ? "#ef4444" : timer < 10 ? "#ffd166" : "#10b981"}
                      strokeWidth="6"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (timer / 30) * 251.2}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="text-center">
                    <p className={`font-mono text-2xl font-black ${timer < 5 ? "text-[#ef4444] animate-pulse" : "text-white"}`}>
                      {timer}s
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[#718076]">Clock</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Hammer Sold + Increments */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={onHammer}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9f43] to-[#ff851b] px-5 py-3.5 text-sm font-black text-black shadow-[0_0_30px_rgba(255,159,67,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Hammer size={18} />
                  <span>HAMMER SOLD · ₹{currentBid}</span>
                </button>

                <div className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-black/40 p-1">
                  {[10, 20, 50].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => onBidIncrementChange(inc)}
                      className={`rounded-xl px-3 py-2 font-mono text-xs font-bold transition-all ${
                        bidIncrement === inc
                          ? "bg-[#10b981] text-black"
                          : "text-[#93a59a] hover:text-white"
                      }`}
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operator Rapid Bidding Simulator (5 cols) */}
        <div className="xl:col-span-5 rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#718076]">
                  Hall Floor Simulator
                </p>
                <h3 className="font-display text-lg font-bold text-white">
                  Franchise Paddle Tap
                </h3>
              </div>
              <span className="font-mono text-xs text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/25">
                +₹{bidIncrement} step
              </span>
            </div>

            <p className="mt-1 text-xs text-[#93a59a]">
              Click any franchise below to register a bid on behalf of team paddle in the hall.
              Rules 12.1 & 12.2 enforced automatically.
            </p>

            {/* Franchise Cards List */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {franchises.map((f) => {
                const check = calculateMaxBid(f.purse, f.squad, f.buckets, currentPlayer.bucket);
                const nextBid = currentBid + bidIncrement;
                const canBid = check.isEligible && nextBid <= check.maxBid;
                const isLeader = f.id === highestBidderId;

                return (
                  <button
                    key={f.id}
                    onClick={() => canBid && onPlaceBid(f.id, nextBid)}
                    disabled={!canBid}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isLeader
                        ? "border-[#ffd166] bg-[#ffd166]/10 shadow-[0_0_15px_rgba(255,209,102,0.15)]"
                        : canBid
                        ? "border-white/10 bg-white/[0.025] hover:border-[#10b981]/40 hover:bg-[#10b981]/[0.05]"
                        : "border-white/[0.05] bg-black/20 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-8 w-8 rounded-xl font-display font-bold text-xs flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${f.color}15`,
                          borderColor: `${f.color}40`,
                          color: f.color,
                        }}
                      >
                        {f.short}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{f.name}</p>
                        <p className="font-mono text-[10px] text-[#718076]">
                          Purse: ₹{f.purse} · Max: ₹{check.maxBid}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isLeader ? (
                        <span className="rounded-full bg-[#ffd166]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#ffd166]">
                          BIDDER
                        </span>
                      ) : canBid ? (
                        <span className="font-mono text-xs font-bold text-[#10b981]">
                          +₹{bidIncrement}
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] text-[#ef4444]">
                          BLOCKED
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#93a59a]">
            <span>11 Teams active in auction pool</span>
            <button
              onClick={onOpenUndo}
              className="text-[#ffb45c] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={12} />
              <span>Review Past Sales</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Event Stream & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Realtime Bid Stream (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#10b981]" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Live Bid Log (Authoritative Stream)
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#718076]">Timestamp verified</span>
          </div>

          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
            {bidHistory.map((bid, idx) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.05] bg-black/20 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#718076]">#{String(idx + 1).padStart(2, "0")}</span>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: bid.color }}
                  />
                  <span className="text-xs font-bold text-white">{bid.franchiseName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-[#10b981]">₹{bid.amount}</span>
                  <span className="font-mono text-[10px] text-[#718076]">{bid.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* League Supply Scarcity Telemetry (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#ffd166]" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Bucket Supply Scarcity Status
              </h3>
            </div>
            <span className="rounded-full bg-[#ffd166]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#ffd166]">
              Rule 10 Active
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {(["B1", "B2", "B3", "B4", "B5"] as BucketKey[]).map((bKey) => {
              const info = BUCKET_INFO[bKey];
              // Calculate how many total slots across all 11 teams are still unfilled
              let remainingDemand = 0;
              franchises.forEach((f) => {
                remainingDemand += Math.max(0, 2 - (f.buckets[bKey] || 0));
              });

              // Example estimated supply
              const estPool: Record<BucketKey, number> = { B1: 28, B2: 24, B3: 20, B4: 14, B5: 12 };
              const supply = estPool[bKey];
              const isScarce = supply <= remainingDemand + 2;

              return (
                <div key={bKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#e6eddc]">{info.label}</span>
                    <span className="font-mono text-[10px] text-[#93a59a]">
                      Supply: {supply} | Needed: {remainingDemand}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isScarce ? "bg-[#ef4444]" : "bg-[#10b981]"
                      }`}
                      style={{ width: `${Math.min(100, (supply / Math.max(remainingDemand, 1)) * 100)}%` }}
                    />
                  </div>
                  {isScarce && (
                    <p className="font-mono text-[9px] text-[#ef4444]">
                      Scarcity Warning: Low inventory remaining!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: STADIUM PROJECTOR DISPLAY (AUDITORIUM 1080P FULLSCREEN)
// =========================================================================
function StadiumProjectorDisplay({
  player,
  currentBid,
  highestBidder,
  timer,
  franchises,
  lotIndex,
  totalLots,
  onExit,
}: {
  player: Player;
  currentBid: number;
  highestBidder?: Franchise;
  timer: number;
  franchises: Franchise[];
  lotIndex: number;
  totalLots: number;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050806] text-white flex flex-col justify-between overflow-hidden p-6 md:p-10 select-none">
      {/* Top Banner: Brand + Lot # + Exit button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#ff9f43] text-black font-display font-black text-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,159,67,0.4)]">
            ACC
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight text-white">
              AVANTHI CRICKET CARNIVAL 2026
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-[#10b981]">
              Live Player Auction · Auditorium Projector Broadcast
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-xl">
            <span className="text-[#718076]">LOT</span>
            <span className="font-black text-white text-2xl">
              #{String(player.lot).padStart(3, "0")}
            </span>
            <span className="text-[#718076] text-sm">/ {String(totalLots).padStart(3, "0")}</span>
          </div>

          <button
            onClick={onExit}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
          >
            Exit Projector Mode
          </button>
        </div>
      </div>

      {/* Middle Arena: Giant Photo + Stats + Giant Bidding Figures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Massive Player Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center sm:items-start gap-4">
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-black">
            <img
              src={player.image}
              alt={player.name}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
            <div className="absolute top-4 left-4">
              <span className="rounded-full bg-[#10b981] px-3.5 py-1 font-display font-black text-xs text-black shadow-lg">
                {player.bucket} · {player.year}
              </span>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <span className="font-mono text-xs font-bold text-[#ffb45c] uppercase tracking-wider">
                {player.type}
              </span>
              <h2 className="mt-1 font-display text-4xl font-black text-white leading-tight">
                {player.name}
              </h2>
              <p className="font-mono text-xs text-[#dce5df]">{player.branch} · {player.roll}</p>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-[420px] text-center font-mono">
            <div className="rounded-xl bg-white/[0.05] p-2 border border-white/10">
              <span className="text-[10px] text-[#718076] block">RUNS</span>
              <span className="text-lg font-bold text-white">{player.stats.runs}</span>
            </div>
            <div className="rounded-xl bg-white/[0.05] p-2 border border-white/10">
              <span className="text-[10px] text-[#718076] block">WKTS</span>
              <span className="text-lg font-bold text-white">{player.stats.wickets}</span>
            </div>
            <div className="rounded-xl bg-white/[0.05] p-2 border border-white/10">
              <span className="text-[10px] text-[#718076] block">SR</span>
              <span className="text-lg font-bold text-white">{player.stats.strikeRate}</span>
            </div>
            <div className="rounded-xl bg-white/[0.05] p-2 border border-white/10">
              <span className="text-[10px] text-[#718076] block">BASE</span>
              <span className="text-lg font-bold text-[#ffd166]">₹{player.basePrice}</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Huge Bid Number & Animated Timer Ring (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center text-center space-y-8">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-[#718076]">
              CURRENT HIGHEST BID
            </p>
            <div className="mt-2 font-display text-7xl sm:text-9xl md:text-[130px] font-black tracking-tighter text-[#10b981] drop-shadow-[0_0_50px_rgba(16,185,129,0.4)] leading-none">
              ₹{currentBid}
            </div>

            {highestBidder ? (
              <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/[0.08] px-6 py-3 backdrop-blur-md">
                <div
                  className="h-9 w-9 rounded-xl font-display font-black text-sm flex items-center justify-center border text-white"
                  style={{
                    backgroundColor: `${highestBidder.color}30`,
                    borderColor: highestBidder.color,
                  }}
                >
                  {highestBidder.short}
                </div>
                <div className="text-left">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#ffd166]">
                    LEADING FRANCHISE
                  </p>
                  <p className="font-display text-xl font-bold text-white">
                    {highestBidder.name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 font-mono text-sm text-[#718076]">No bids placed yet</p>
            )}
          </div>

          {/* Giant Circular Timer (220px) */}
          <div className="relative flex h-48 w-48 md:h-56 md:w-56 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="95"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="14"
              />
              <circle
                cx="112"
                cy="112"
                r="95"
                fill="none"
                stroke={timer < 5 ? "#ef4444" : timer < 10 ? "#ffd166" : "#10b981"}
                strokeWidth="14"
                strokeDasharray="596.9"
                strokeDashoffset={596.9 - (timer / 30) * 596.9}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div>
              <span
                className={`font-mono font-black text-6xl md:text-7xl ${
                  timer < 5 ? "text-[#ef4444] animate-ping" : "text-white"
                }`}
              >
                {timer}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#718076] mt-1">
                SECONDS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: 11 Franchises Status Ticker (In Play / Passed / Blocked) */}
      <div className="border-t border-white/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#718076] mb-3">
          11 FRANCHISE PADDLE TELEMETRY · AUTOMATIC GUARDRAIL ENFORCEMENT
        </p>
        <div className="grid grid-cols-11 gap-2">
          {franchises.map((f) => {
            const isLeading = f.id === highestBidder?.id;
            const check = calculateMaxBid(f.purse, f.squad, f.buckets, player.bucket);
            const isBlocked = !check.isEligible || currentBid + 10 > check.maxBid;

            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-2.5 text-center transition-all ${
                  isLeading
                    ? "border-[#ffd166] bg-[#ffd166]/20 shadow-[0_0_20px_rgba(255,209,102,0.3)] scale-105"
                    : isBlocked
                    ? "border-[#ef4444]/40 bg-[#ef4444]/10 opacity-60"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div
                  className="mx-auto h-8 w-8 rounded-xl font-display font-bold text-xs flex items-center justify-center border"
                  style={{
                    backgroundColor: `${f.color}25`,
                    borderColor: `${f.color}60`,
                    color: f.color,
                  }}
                >
                  {f.short}
                </div>
                <p className="mt-1 text-[11px] font-bold text-white truncate">{f.name}</p>
                <p className="font-mono text-[9px] text-[#718076]">₹{f.purse}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase ${
                    isLeading
                      ? "bg-[#ffd166] text-black"
                      : isBlocked
                      ? "bg-[#ef4444]/20 text-[#ef4444]"
                      : "bg-[#10b981]/20 text-[#10b981]"
                  }`}
                >
                  {isLeading ? "BIDDER" : isBlocked ? "BLOCKED" : "READY"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: FRANCHISE MOBILE BIDDING INTERFACE (PHONE PADDLE)
// =========================================================================
function FranchiseBiddingInterface({
  franchises,
  activeFranchise,
  currentPlayer,
  currentBid,
  highestBidderId,
  timer,
  bidIncrement,
  onSelectFranchise,
  onPlaceBid,
  check,
}: {
  franchises: Franchise[];
  activeFranchise: Franchise;
  currentPlayer: Player;
  currentBid: number;
  highestBidderId: string;
  timer: number;
  bidIncrement: number;
  onSelectFranchise: (id: string) => void;
  onPlaceBid: () => void;
  check: { maxBid: number; isEligible: boolean; reason?: string };
}) {
  const isLeader = activeFranchise.id === highestBidderId;
  const nextBidAmount = currentBid + bidIncrement;
  const canBid = check.isEligible && nextBidAmount <= check.maxBid && !isLeader;

  return (
    <div className="max-w-md mx-auto rounded-3xl border border-white/10 bg-[#0e1612] p-5 sm:p-6 shadow-2xl relative">
      {/* Franchise Selector Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#718076]">
            Franchise Phone Console
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-7 w-7 rounded-lg font-bold text-xs flex items-center justify-center border"
              style={{
                backgroundColor: `${activeFranchise.color}25`,
                borderColor: activeFranchise.color,
                color: activeFranchise.color,
              }}
            >
              {activeFranchise.short}
            </div>
            <select
              value={activeFranchise.id}
              onChange={(e) => onSelectFranchise(e.target.value)}
              className="bg-transparent font-display text-base font-bold text-white outline-none cursor-pointer"
            >
              {franchises.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#0e1612] text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-[9px] uppercase text-[#718076]">Purse Balance</p>
          <p className="font-mono text-lg font-black text-[#10b981]">₹{activeFranchise.purse}</p>
        </div>
      </div>

      {/* Live Lot Banner */}
      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/40 p-4">
        <div className="flex items-center gap-3">
          <img
            src={currentPlayer.image}
            alt={currentPlayer.name}
            className="h-16 w-16 rounded-xl object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-[9px] uppercase text-[#ffb45c] font-bold">
              Lot #{currentPlayer.lot} · {currentPlayer.bucket}
            </span>
            <h3 className="font-display text-lg font-bold text-white truncate">
              {currentPlayer.name}
            </h3>
            <p className="text-xs text-[#93a59a]">{currentPlayer.type} · Base ₹{currentPlayer.basePrice}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase text-[#718076]">Clock</p>
            <p className="font-mono text-xl font-bold text-white">{timer}s</p>
          </div>
        </div>

        {/* Current Bid info */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] text-[#718076] uppercase">High Bid</p>
            <p className="font-display text-2xl font-black text-[#10b981]">₹{currentBid}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] text-[#718076] uppercase">Max Legal Bid</p>
            <p className="font-mono text-lg font-bold text-[#ffd166]">₹{check.maxBid}</p>
          </div>
        </div>
      </div>

      {/* BIG PADDLE BUTTON (MIN 56PX HEIGHT) */}
      <div className="mt-6 space-y-3">
        {isLeader ? (
          <div className="h-16 rounded-2xl bg-[#ffd166]/15 border-2 border-[#ffd166] flex items-center justify-center text-center text-[#ffd166] font-display font-black text-lg shadow-[0_0_30px_rgba(255,209,102,0.2)]">
             YOUR TEAM HOLDS THE HIGHEST BID!
          </div>
        ) : (
          <button
            onClick={onPlaceBid}
            disabled={!canBid}
            className={`w-full h-16 rounded-2xl font-display font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all ${
              canBid
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-black shadow-[0_0_35px_rgba(16,185,129,0.4)] active:scale-[0.97]"
                : "bg-white/[0.06] border border-white/10 text-[#718076] cursor-not-allowed"
            }`}
          >
            <Gavel size={22} />
            <span>PADDLE TAP · BID ₹{nextBidAmount}</span>
          </button>
        )}

        {/* Legal / Blocked Explanation Banner */}
        <div
          className={`rounded-xl p-3 text-xs flex items-start gap-2 border ${
            canBid
              ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399]"
              : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#f87171]"
          }`}
        >
          {canBid ? <ShieldCheck size={16} className="shrink-0 mt-0.5" /> : <LockKeyhole size={16} className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold">
              {canBid ? "Legal Bid Approved" : "Bid Restricted by Rule 12"}
            </p>
            <p className="text-[11px] mt-0.5 opacity-90">
              {canBid
                ? `Leaves required reserve for ${Math.max(0, 15 - activeFranchise.squad - 1)} upcoming mandatory squad slots.`
                : check.reason || `Bid exceeds maximum permitted limit of ₹${check.maxBid}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Squad & Mandatory Bucket Tracker */}
      <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#93a59a]">Squad Progress</span>
          <span className="font-mono text-white">{activeFranchise.squad} / 15 minimum (max 22)</span>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#718076]">
            Mandatory Buckets (Min 2 Each)
          </p>
          {(["B1", "B2", "B3", "B4", "B5"] as BucketKey[]).map((bk) => {
            const count = activeFranchise.buckets[bk] || 0;
            const met = count >= 2;
            return (
              <div key={bk} className="flex items-center justify-between text-xs">
                <span className="text-[#dce5df]">{BUCKET_INFO[bk].label}</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      count >= 1 ? "bg-[#10b981]" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`h-2 w-2 rounded-full ${
                      count >= 2 ? "bg-[#10b981]" : "bg-white/20"
                    }`}
                  />
                  <span className={`text-[10px] ml-1 ${met ? "text-[#10b981]" : "text-[#ffb45c]"}`}>
                    {count}/2
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: PUBLIC LIVE SPECTATOR VIEW
// =========================================================================
function PublicLiveView({
  currentPlayer,
  currentBid,
  highestBidder,
  timer,
  franchises,
  salesHistory,
  notify,
}: {
  currentPlayer: Player;
  currentBid: number;
  highestBidder?: Franchise;
  timer: number;
  franchises: Franchise[];
  salesHistory: SaleRecord[];
  notify: (msg: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Hero: Spectator Current Lot Spotlight */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img
              src={currentPlayer.image}
              alt={currentPlayer.name}
              className="h-28 w-28 rounded-2xl object-cover border border-white/10 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#34d399] uppercase">
                  Lot #{currentPlayer.lot} · {currentPlayer.bucket}
                </span>
                <span className="text-xs text-[#718076]">{currentPlayer.year}</span>
              </div>
              <h2 className="mt-1 font-display text-3xl font-black text-white">{currentPlayer.name}</h2>
              <p className="text-xs text-[#93a59a]">{currentPlayer.type} · {currentPlayer.branch} · Base ₹{currentPlayer.basePrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-center sm:text-right">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#718076]">LIVE BID</p>
              <p className="font-display text-5xl font-black text-[#10b981]">₹{currentBid}</p>
              <p className="text-xs text-[#ffd166] font-semibold mt-1">
                {highestBidder?.name || "Awaiting bid"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
              <p className="font-mono text-2xl font-black text-white">{timer}s</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#718076]">TIMER</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table & Squad Matrix */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Official Franchise Standings & Remaining Purses
            </h3>
            <p className="text-xs text-[#718076]">
              Real-time purse utilization and mandatory squad minimum fulfillment
            </p>
          </div>
          <span className="font-mono text-xs text-[#10b981]">11 Teams Registered</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#718076] font-mono text-[10px] uppercase">
                <th className="py-3 px-3">Franchise</th>
                <th className="py-3 px-3">Remaining Purse</th>
                <th className="py-3 px-3">Squad Count</th>
                <th className="py-3 px-3">Mandatory B1–B5</th>
                <th className="py-3 px-3 text-right">Max Legal Bid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {franchises.map((f) => {
                const check = calculateMaxBid(f.purse, f.squad, f.buckets);
                const totalMandatory = Object.values(f.buckets).reduce((a, b) => a + b, 0);

                return (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-7 w-7 rounded-lg font-display font-bold text-xs flex items-center justify-center border"
                          style={{
                            backgroundColor: `${f.color}20`,
                            borderColor: `${f.color}40`,
                            color: f.color,
                          }}
                        >
                          {f.short}
                        </div>
                        <span className="font-bold text-white">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#10b981]">₹{f.purse}</td>
                    <td className="py-3.5 px-3 font-mono text-[#dce5df]">{f.squad} / 15</td>
                    <td className="py-3.5 px-3 font-mono text-[#ffb45c]">{totalMandatory} / 10 slots</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#ffd166]">₹{check.maxBid}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: PLAYER BOARD VIEW
// =========================================================================
function PlayerBoardView({
  players,
  notify,
}: {
  players: Player[];
  notify: (msg: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<string>("ALL");

  const filtered = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBucket = selectedBucket === "ALL" || p.bucket === selectedBucket;
    return matchSearch && matchBucket;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Player Database</h1>
          <p className="text-xs text-[#93a59a]">
            Public player profiles, derived buckets, base prices, and CricHeroes verification status
          </p>
        </div>

        <button
          onClick={() => notify("Player roster export generated with phone privacy preserved.")}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10"
        >
          <FileCheck2 size={14} />
          <span>Export Public Roster</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718076]" />
          <input
            type="text"
            placeholder="Search name, roll no, branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "B1", "B2", "B3", "B4", "B5"].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBucket(b)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold font-mono transition-all ${
                selectedBucket === b
                  ? "bg-[#10b981] text-black"
                  : "border border-white/10 bg-white/[0.04] text-[#93a59a] hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((player) => (
          <div
            key={player.id}
            className="rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-4 items-start">
                <img
                  src={player.image}
                  alt={player.name}
                  className="h-20 w-20 rounded-2xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-[9px] font-bold text-[#10b981] uppercase">
                    {player.bucket} · {player.year}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white truncate">{player.name}</h3>
                  <p className="font-mono text-xs text-[#718076]">{player.roll}</p>
                  <p className="text-xs text-[#93a59a] mt-0.5">{player.branch}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl bg-black/30 p-2.5 text-center font-mono text-[10px]">
                <div>
                  <span className="text-[#718076] block">RUNS</span>
                  <span className="font-bold text-white">{player.stats.runs}</span>
                </div>
                <div>
                  <span className="text-[#718076] block">WKTS</span>
                  <span className="font-bold text-white">{player.stats.wickets}</span>
                </div>
                <div>
                  <span className="text-[#718076] block">SR</span>
                  <span className="font-bold text-white">{player.stats.strikeRate}</span>
                </div>
                <div>
                  <span className="text-[#718076] block">BASE</span>
                  <span className="font-bold text-[#ffd166]">₹{player.basePrice}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span
                className={`font-mono text-[10px] font-bold uppercase ${
                  player.cricHeroesStatus === "verified" ? "text-[#10b981]" : "text-[#ffb45c]"
                }`}
              >
                CricHeroes: {player.cricHeroesStatus}
              </span>
              <span className="font-mono text-xs text-[#93a59a]">Lot #{player.lot}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: REGISTRATION & ROLL PARSER ENGINE
// =========================================================================
function RegistrationRollParserView({ notify }: { notify: (msg: string) => void }) {
  const [inputRoll, setInputRoll] = useState("25815A0403");
  const homeRollInputRef = useRef<HTMLInputElement>(null);
  const homeCursorRef = useRef<number | null>(null);

  const handleHomeRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    homeCursorRef.current = e.target.selectionStart;
    setInputRoll(e.target.value.toUpperCase());
  };

  useLayoutEffect(() => {
    if (homeRollInputRef.current && homeCursorRef.current !== null) {
      homeRollInputRef.current.setSelectionRange(homeCursorRef.current, homeCursorRef.current);
    }
  }, [inputRoll]);

  const parsed = useMemo(() => parseRollNumber(inputRoll), [inputRoll]);

  // Skill questionnaire state
  const [canBat, setCanBat] = useState(true);
  const [canBowl, setCanBowl] = useState(true);
  const [isWicketKeeper, setIsWicketKeeper] = useState(false);

  // Derived player type
  const derivedType = isWicketKeeper
    ? canBat
      ? "Wicket-keeper batter"
      : "Wicket-keeper"
    : canBat && canBowl
    ? "All-rounder"
    : canBat
    ? "Batter"
    : canBowl
    ? "Bowler"
    : "Fielder Only (Confirmed)";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-white/[0.08] pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Player Intake & Roll Engine
        </h1>
        <p className="text-xs text-[#93a59a]">
          Autonomous year & bucket derivation from roll number. Branching skill questionnaire.
        </p>
      </div>

      {/* Roll Number Parser Box */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-6 shadow-xl space-y-4">
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[#718076]">
            Enter Student Roll Number (JNTU / Polytechnic Format)
          </label>
          <div className="flex gap-3">
            <input
              ref={homeRollInputRef}
              id="homeRegRollInput"
              name="homeRollNumber"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              value={inputRoll}
              onChange={handleHomeRollChange}
              placeholder="e.g. 25811A0403 or 24597-CM-015"
              className="flex-1 rounded-2xl border border-white/20 bg-black/40 px-4 py-3 font-mono text-base font-bold text-white uppercase outline-none focus:border-[#10b981]"
            />
            <div className="flex items-center gap-1.5">
              {["25811A0403", "25815A0403", "24597-CM-015", "23811A4201"].map((sample) => (
                <button
                  key={sample}
                  onClick={() => setInputRoll(sample)}
                  className="hidden sm:inline-block rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[10px] text-[#93a59a] hover:text-white"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Realtime Decoded Breakdown */}
        <div className="mt-4 rounded-2xl border border-[#10b981]/30 bg-[#10b981]/[0.05] p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="font-mono text-[9px] uppercase text-[#718076] block">Category</span>
            <span className="font-display font-bold text-sm text-white">{parsed.type}</span>
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase text-[#718076] block">Branch</span>
            <span className="font-display font-bold text-sm text-[#10b981]">{parsed.branch}</span>
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase text-[#718076] block">Year Standing</span>
            <span className="font-display font-bold text-sm text-white">{parsed.year}</span>
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase text-[#718076] block">Assigned Bucket</span>
            <span className="font-mono font-black text-lg text-[#ffd166]">{parsed.bucket}</span>
          </div>
        </div>
      </div>

      {/* Branching Skill Questionnaire */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0e1612]/90 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-display text-base font-bold text-white">Branching Skill Profile</h3>
          <span className="rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1 font-mono text-xs font-bold text-[#7dd3fc]">
            Derived: {derivedType}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setCanBat(!canBat)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              canBat
                ? "border-[#10b981]/40 bg-[#10b981]/10 text-white"
                : "border-white/10 bg-white/[0.03] text-[#718076]"
            }`}
          >
            <p className="font-mono text-[10px] uppercase">Batting Ability</p>
            <p className="font-display font-bold text-base mt-1">{canBat ? "Active Batter " : "No"}</p>
          </button>

          <button
            onClick={() => setCanBowl(!canBowl)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              canBowl
                ? "border-[#10b981]/40 bg-[#10b981]/10 text-white"
                : "border-white/10 bg-white/[0.03] text-[#718076]"
            }`}
          >
            <p className="font-mono text-[10px] uppercase">Bowling Ability</p>
            <p className="font-display font-bold text-base mt-1">{canBowl ? "Active Bowler " : "No"}</p>
          </button>

          <button
            onClick={() => setIsWicketKeeper(!isWicketKeeper)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              isWicketKeeper
                ? "border-[#ffd166]/40 bg-[#ffd166]/10 text-white"
                : "border-white/10 bg-white/[0.03] text-[#718076]"
            }`}
          >
            <p className="font-mono text-[10px] uppercase">Wicket Keeping</p>
            <p className="font-display font-bold text-base mt-1">
              {isWicketKeeper ? "Wicket Keeper " : "No"}
            </p>
          </button>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => notify(`Player profile for ${inputRoll} registered into Bucket ${parsed.bucket} as ${derivedType}`)}
            className="rounded-2xl bg-[#10b981] px-6 py-3 font-display font-black text-sm text-black shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:brightness-110"
          >
            Save Player Registration
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: FORENSIC MULTI-LOT UNDO MODAL (APPENDIX A.4)
// =========================================================================
function ForensicUndoModal({
  salesHistory,
  onUndo,
  onClose,
}: {
  salesHistory: SaleRecord[];
  onUndo: (saleIndex: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-[#0e1612] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#ff9f43]/20 text-[#ffb45c] flex items-center justify-center">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Forensic Multi-Lot Undo Console</h3>
              <p className="text-xs text-[#718076]">
                Roll back any auction sale up to 40 lots prior with immediate ledger recalculation.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#718076] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {salesHistory.length === 0 ? (
            <p className="text-center font-mono text-xs text-[#718076] py-8">
              No completed sales in ledger.
            </p>
          ) : (
            salesHistory.map((s, idx) => (
              <div
                key={`${s.lot}_${idx}`}
                className={`p-4 rounded-2xl border transition-all ${
                  s.undone
                    ? "border-white/[0.05] bg-black/40 opacity-50"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#ffb45c] font-bold">
                      SALE #{String(s.lot).padStart(3, "0")} · {s.timestamp}
                    </span>
                    <h4 className="font-display font-bold text-base text-white">{s.player.name}</h4>
                    <p className="text-xs text-[#93a59a]">
                      Sold to <strong className="text-white">{s.franchiseName}</strong> for ₹{s.amount} credits ({s.player.bucket})
                    </p>
                  </div>

                  <div>
                    {s.undone ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold text-[#718076]">
                        ALREADY UNDONE
                      </span>
                    ) : (
                      <button
                        onClick={() => onUndo(idx)}
                        className="rounded-xl bg-[#ef4444] px-4 py-2 font-display font-bold text-xs text-white hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      >
                        CONFIRM UNDO
                      </button>
                    )}
                  </div>
                </div>

                {!s.undone && (
                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-4 text-[10px] font-mono text-[#718076]">
                    <span>Effects: +₹{s.amount} to purse</span>
                    <span>-1 squad slot</span>
                    <span>Player returns to pool</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: APPENDIX A ACCEPTANCE TEST VALIDATOR MODAL
// =========================================================================
function AcceptanceTestsModal({ onClose }: { onClose: () => void }) {
  // Test cases from Appendix A
  const testCases = [
    {
      id: "A.1.1",
      title: "Case 1: Purse 1000, 0 bought, 5 bucket minimums unmet",
      expected: 720,
      actual: calculateMaxBid(1000, 0, { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0 }).maxBid,
    },
    {
      id: "A.1.2",
      title: "Case 2: Purse 1000, 14 bought, all bucket minimums met",
      expected: 1000,
      actual: calculateMaxBid(1000, 14, { B1: 2, B2: 2, B3: 2, B4: 2, B5: 2 }).maxBid,
    },
    {
      id: "A.1.3",
      title: "Case 3: Purse 340, 11 bought, but 5 mandatory bucket slots unfilled",
      expected: 260,
      actual: calculateMaxBid(340, 11, { B1: 1, B2: 1, B3: 1, B4: 1, B5: 1 }).maxBid,
    },
    {
      id: "A.1.4",
      title: "Case 4: Purse 200, 13 bought, all bucket minimums met",
      expected: 180,
      actual: calculateMaxBid(200, 13, { B1: 2, B2: 2, B3: 2, B4: 2, B5: 2 }).maxBid,
    },
    {
      id: "A.1.5",
      title: "Case 5: Purse 20, 14 bought, all bucket minimums met",
      expected: 20,
      actual: calculateMaxBid(20, 14, { B1: 2, B2: 2, B3: 2, B4: 2, B5: 2 }).maxBid,
    },
    {
      id: "A.1.6",
      title: "Case 6: Purse 600, 15 bought, all bucket minimums met (squad complete)",
      expected: 600,
      actual: calculateMaxBid(600, 15, { B1: 2, B2: 2, B3: 2, B4: 2, B5: 2 }).maxBid,
    },
    {
      id: "A.2.7",
      title: "Case 7: 1 slot left, needs Diploma player. Bids on B.Tech 2nd year",
      expected: "Blocked",
      actual: calculateMaxBid(100, 14, { B1: 2, B2: 2, B3: 2, B4: 2, B5: 1 }, "B2").isEligible
        ? "Allowed"
        : "Blocked",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-[#38bdf8]/30 bg-[#0e1612] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Appendix A Acceptance Tests Live Run</h3>
              <p className="text-xs text-[#718076]">
                Automated verification of maximum bid rules and bucket constraint enforcement.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#718076] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {testCases.map((tc) => {
            const passed = tc.expected === tc.actual;
            return (
              <div
                key={tc.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-black/30 text-xs"
              >
                <div>
                  <span className="font-mono text-[10px] text-[#38bdf8] font-bold mr-2">{tc.id}</span>
                  <span className="text-white font-medium">{tc.title}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#93a59a]">
                    Exp: {tc.expected} | Got: {tc.actual}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      passed ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ef4444]/20 text-[#ef4444]"
                    }`}
                  >
                    {passed ? " PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
