"use server";

import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { expireOldPendingOperations, getOwnedBusiness } from "@/app/(dashboard)/scan/data";
import { MAX_POINTS, MIN_POINTS, QR_TTL_SECONDS, type ScanOperationState } from "@/app/(dashboard)/scan/types";

interface QrOperationLookup {
  id: string;
  token: string;
  points: number;
  status: "pending" | "used" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
}

interface SupabaseMutationError {
  message: string;
}

type QrOperationsTable = {
  insert: (values: {
    business_id: string;
    type: "earn";
    points: number;
    token: string;
    status: "pending";
    expires_at: string;
    created_by: string;
  }) => { select: (columns: string) => { single: () => Promise<{ data: QrOperationLookup | null; error: SupabaseMutationError | null }> } };
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { id: string; status: "pending" | "used" | "expired" | "cancelled"; type: "earn" | "redeem"; expires_at: string } | null;
          error: SupabaseMutationError | null;
        }>;
      };
    };
  };
  update: (values: { status: "expired" }) => { eq: (column: string, value: string) => Promise<{ error: SupabaseMutationError | null }> };
};

function normalizePoints(rawValue: FormDataEntryValue | null) {
  const points = Number.parseInt(String(rawValue ?? ""), 10);
  if (!Number.isFinite(points)) {
    return null;
  }
  return points;
}

function mapOperation(operation: QrOperationLookup | null): ScanOperationState["operation"] {
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

export async function createEarnQrOperation(
  _state: ScanOperationState,
  formData: FormData,
): Promise<ScanOperationState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Tu sesión expiró. Vuelve a iniciar sesión.", success: null, operation: null };
  }

  if (user.role !== "business_owner") {
    return { error: "Solo un negocio puede generar QR de acumulación.", success: null, operation: null };
  }

  const businessId = String(formData.get("business_id") ?? "").trim();
  const points = normalizePoints(formData.get("points"));

  if (!businessId) {
    return { error: "No encontramos tu negocio. Recarga la pantalla.", success: null, operation: null };
  }

  if (!points || points < MIN_POINTS || points > MAX_POINTS) {
    return {
      error: `Captura un número de puntos válido entre ${MIN_POINTS} y ${MAX_POINTS}.`,
      success: null,
      operation: null,
    };
  }

  const business = await getOwnedBusiness(user.id, businessId);

  if (!business) {
    return { error: "No tienes permisos para operar este negocio.", success: null, operation: null };
  }

  await expireOldPendingOperations(business.id);

  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000).toISOString();

  const supabase = await getSupabaseServerClient();
  const qrOperations = supabase.from("qr_operations" as never) as unknown as QrOperationsTable;

  const { data, error } = await qrOperations
    .insert({
      business_id: business.id,
      type: "earn",
      points,
      token,
      status: "pending",
      expires_at: expiresAt,
      created_by: user.id,
    })
    .select("id,token,points,status,expires_at,created_at")
    .single();

  if (error || !data) {
    return { error: "No pudimos crear el QR temporal. Inténtalo de nuevo.", success: null, operation: null };
  }

  return {
    error: null,
    success: `QR generado para ${points} puntos. Vigencia: ${QR_TTL_SECONDS} segundos.`,
    operation: mapOperation(data),
  };
}

export async function validateEarnQrTokenForClaim(token: string) {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return { valid: false as const, reason: "missing_token" as const };
  }

  const supabase = await getSupabaseServerClient();
  const qrOperations = supabase.from("qr_operations" as never) as unknown as QrOperationsTable;

  const { data, error } = await qrOperations
    .select("id,status,type,expires_at")
    .eq("token", normalizedToken)
    .eq("type", "earn")
    .maybeSingle();

  if (error || !data) {
    return { valid: false as const, reason: "not_found" as const };
  }

  if (data.status !== "pending") {
    return { valid: false as const, reason: data.status };
  }

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await qrOperations.update({ status: "expired" }).eq("id", data.id);
    return { valid: false as const, reason: "expired" as const };
  }

  return { valid: true as const, operationId: data.id };
}
