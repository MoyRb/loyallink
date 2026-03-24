import type { LoyaltyCard, PointsTransaction } from "@/lib/types/domain";

export const mockCards: LoyaltyCard[] = [
  {
    businessId: "cafe-sol",
    businessName: "Cafe Sol",
    pointsBalance: 140,
    tier: "Gold",
  },
  {
    businessId: "roots-fitness",
    businessName: "Roots Fitness",
    pointsBalance: 62,
    tier: "Silver",
  },
  {
    businessId: "luna-bookshop",
    businessName: "Luna Bookshop",
    pointsBalance: 24,
    tier: "Bronze",
  },
];

export const mockTransactions: PointsTransaction[] = [
  {
    id: "tx_1",
    businessId: "cafe-sol",
    businessName: "Cafe Sol",
    type: "earn",
    points: 15,
    createdAt: "2026-03-24T10:30:00.000Z",
    source: "qr_claim",
  },
  {
    id: "tx_2",
    businessId: "roots-fitness",
    businessName: "Roots Fitness",
    type: "redeem",
    points: 20,
    createdAt: "2026-03-23T17:10:00.000Z",
    source: "qr_redeem",
  },
  {
    id: "tx_3",
    businessId: "luna-bookshop",
    businessName: "Luna Bookshop",
    type: "earn",
    points: 10,
    createdAt: "2026-03-22T13:45:00.000Z",
    source: "qr_claim",
  },
];
