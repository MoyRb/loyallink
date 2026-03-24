import { getSupabaseServerClient } from "@/lib/supabase/server";

interface LoyaltyCardQueryRow {
  id: string;
  business_id: string;
  card_label: string | null;
  businesses: {
    id: string;
    name: string;
    slug: string;
  };
}

interface WalletQueryRow {
  business_id: string;
  balance: number;
}

interface TransactionQueryRow {
  id: string;
  business_id: string;
  type: "earn" | "redeem";
  points: number;
  source: string;
  created_at: string;
  businesses: {
    name: string;
  };
}

export interface OwnerBusiness {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  primary_color: string | null;
}

export async function getCustomerWalletData(customerId: string) {
  const supabase = await getSupabaseServerClient();

  const { data: cardsData, error: cardsError } = await supabase
    .from("loyalty_cards")
    .select("id,business_id,card_label,businesses!inner(id,name,slug)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (cardsError) {
    throw cardsError;
  }

  const { data: walletsData, error: walletsError } = await supabase
    .from("point_wallets")
    .select("business_id,balance")
    .eq("customer_id", customerId);

  if (walletsError) {
    throw walletsError;
  }

  const { data: transactionsData, error: transactionsError } = await supabase
    .from("point_transactions")
    .select("id,business_id,type,points,source,created_at,businesses!inner(name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (transactionsError) {
    throw transactionsError;
  }

  const cards = (cardsData ?? []) as unknown as LoyaltyCardQueryRow[];
  const wallets = (walletsData ?? []) as WalletQueryRow[];
  const transactions = (transactionsData ?? []) as unknown as TransactionQueryRow[];

  const walletByBusinessId = new Map(wallets.map((wallet) => [wallet.business_id, wallet.balance]));

  return {
    cards: cards.map((card) => ({
      id: card.id,
      businessId: card.business_id,
      businessName: card.businesses.name,
      cardLabel: card.card_label,
      balance: walletByBusinessId.get(card.business_id) ?? 0,
    })),
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      businessId: transaction.business_id,
      businessName: transaction.businesses.name,
      type: transaction.type,
      points: transaction.points,
      source: transaction.source,
      createdAt: transaction.created_at,
    })),
  };
}

export async function getOwnerBusinesses(ownerId: string): Promise<OwnerBusiness[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,slug,logo_url,description,primary_color")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OwnerBusiness[];
}
