export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          owner_id: string;
          primary_color: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          owner_id: string;
          primary_color?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          owner_id?: string;
          primary_color?: string | null;
          slug?: string;
        };
      };
      loyalty_cards: {
        Row: {
          business_id: string;
          card_label: string | null;
          created_at: string;
          customer_id: string;
          id: string;
        };
        Insert: {
          business_id: string;
          card_label?: string | null;
          created_at?: string;
          customer_id: string;
          id?: string;
        };
        Update: {
          business_id?: string;
          card_label?: string | null;
          created_at?: string;
          customer_id?: string;
          id?: string;
        };
      };
      point_transactions: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          customer_id: string;
          id: string;
          points: number;
          qr_operation_id: string | null;
          source: string;
          type: "earn" | "redeem";
        };
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          customer_id: string;
          id?: string;
          points: number;
          qr_operation_id?: string | null;
          source: string;
          type: "earn" | "redeem";
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string;
          id?: string;
          points?: number;
          qr_operation_id?: string | null;
          source?: string;
          type?: "earn" | "redeem";
        };
      };
      point_wallets: {
        Row: {
          balance: number;
          business_id: string;
          customer_id: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          balance?: number;
          business_id: string;
          customer_id: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          business_id?: string;
          customer_id?: string;
          id?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: "business_owner" | "customer";
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: "business_owner" | "customer";
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: "business_owner" | "customer";
        };
      };
      qr_operations: {
        Row: {
          business_id: string;
          claimed_at: string | null;
          claimed_by: string | null;
          created_at: string;
          created_by: string;
          expires_at: string;
          id: string;
          points: number;
          status: "pending" | "used" | "expired" | "cancelled";
          token: string;
          type: "earn" | "redeem";
        };
        Insert: {
          business_id: string;
          claimed_at?: string | null;
          claimed_by?: string | null;
          created_at?: string;
          created_by: string;
          expires_at: string;
          id?: string;
          points: number;
          status?: "pending" | "used" | "expired" | "cancelled";
          token: string;
          type: "earn" | "redeem";
        };
        Update: {
          business_id?: string;
          claimed_at?: string | null;
          claimed_by?: string | null;
          created_at?: string;
          created_by?: string;
          expires_at?: string;
          id?: string;
          points?: number;
          status?: "pending" | "used" | "expired" | "cancelled";
          token?: string;
          type?: "earn" | "redeem";
        };
      };
    };
  };
};
