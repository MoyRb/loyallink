export interface ScanOperation {
  id: string;
  token: string;
  points: number;
  status: "pending" | "used" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
}

export interface ScanOperationState {
  error: string | null;
  success: string | null;
  operation: ScanOperation | null;
}

export interface ScanDashboardData {
  business: {
    id: string;
    name: string;
  };
  activeOperation: ScanOperation | null;
  recentTransactions: Array<{
    id: string;
    points: number;
    type: "earn" | "redeem";
    source: string;
    createdAt: string;
    customerName: string;
  }>;
}

export const QR_TTL_SECONDS = 90;
export const MIN_POINTS = 1;
export const MAX_POINTS = 10000;
