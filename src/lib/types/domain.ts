export type UserRole = "business_owner" | "customer";

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  pointsPerVisit?: number;
}

export interface LoyaltyCard {
  businessId: string;
  businessName: string;
  pointsBalance: number;
  tier: "Bronze" | "Silver" | "Gold";
}

export type PointsTransactionType = "earn" | "redeem";

export interface PointsTransaction {
  id: string;
  businessId: string;
  businessName: string;
  type: PointsTransactionType;
  points: number;
  createdAt: string;
  source: "qr_claim" | "qr_redeem";
}
