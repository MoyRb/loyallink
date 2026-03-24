import { getSupabaseServerClient } from "@/lib/supabase/server";

import type { ScanDashboardData, ScanOperation } from "@/app/(dashboard)/scan/types";

interface BusinessLookup {
  id: string;
  name: string;
}

interface RecentTransaction {
  id: string;
  points: number;
  created_at: string;
  type: "earn" | "redeem";
  source: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface QrOperationLookup {
  id: string;
  token: string;
  points: number;
  type: "earn" | "redeem";
  status: "pending" | "used" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
}

interface SupabaseMutationError {
  message: string;
}

type QrOperationsTable = {
  update: (values: { status: "expired" }) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        lt: (column: string, value: string) => Promise<{ error: SupabaseMutationError | null }>;
      };
    };
  };
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options: { ascending: boolean }) => {
          limit: (value: number) => { maybeSingle: () => Promise<{ data: QrOperationLookup | null; error: SupabaseMutationError | null }> };
        };
      };
    };
  };
};

function mapOperation(operation: QrOperationLookup | null): ScanOperation | null {
  if (!operation) {
    return null;
  }

  return {
    id: operation.id,
    token: operation.token,
    points: operation.points,
    status: operation.status,
    expiresAt: operation.expires_at,
    createdAt: operation.created_at,
  };
}

export async function getOwnedBusiness(ownerId: string, businessId?: string) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("businesses")
    .select("id,name")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (businessId) {
    query = supabase.from("businesses").select("id,name").eq("owner_id", ownerId).eq("id", businessId).limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return null;
  }

  return (data as BusinessLookup | null) ?? null;
}

export async function expireOldPendingOperations(businessId: string) {
  const supabase = await getSupabaseServerClient();
  const qrOperations = supabase.from("qr_operations" as never) as unknown as QrOperationsTable;

  await qrOperations
    .update({ status: "expired" })
    .eq("business_id", businessId)
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());
}

export async function getScanDashboardData(ownerId: string): Promise<ScanDashboardData | null> {
  const business = await getOwnedBusiness(ownerId);

  if (!business) {
    return null;
  }

  await expireOldPendingOperations(business.id);

  const supabase = await getSupabaseServerClient();
  const qrOperations = supabase.from("qr_operations" as never) as unknown as QrOperationsTable;

  const [{ data: operationData }, { data: transactionData }] = await Promise.all([
    qrOperations
      .select("id,token,points,type,status,expires_at,created_at")
      .eq("business_id", business.id)
      .eq("type", "earn")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("point_transactions")
      .select("id,points,type,source,created_at,profiles!inner(full_name,email)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const typedOperation = (operationData as QrOperationLookup | null) ?? null;

  const typedTransactions =
    ((transactionData ?? []) as unknown as Array<
      Omit<RecentTransaction, "profiles"> & {
        profiles: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }> | null;
      }
    >).map((item) => {
      const customer = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      return {
        id: item.id,
        points: item.points,
        type: item.type,
        source: item.source,
        createdAt: item.created_at,
        customerName: customer?.full_name?.trim() || customer?.email || "Cliente sin nombre",
      };
    });

  return {
    business: {
      id: business.id,
      name: business.name,
    },
    activeOperation: mapOperation(typedOperation),
    recentTransactions: typedTransactions,
  };
}
