"use server";

import { redirect } from "next/navigation";

import type { CustomerOnboardingState } from "@/app/onboarding/customer/state";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function saveCustomerProfile(
  _state: CustomerOnboardingState,
  formData: FormData,
): Promise<CustomerOnboardingState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Tu sesión expiró. Inicia sesión nuevamente." };
  }

  if (user.role !== "customer") {
    return { error: "Solo los clientes pueden completar este onboarding." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) {
    return { error: "El nombre visible es obligatorio." };
  }

  const supabase = await getSupabaseServerClient();
  type ProfilesTable = {
    update: (values: { full_name: string }) => { eq: (column: string, value: string) => Promise<{ error: { message: string } | null }> };
  };

  const profilesTable = supabase.from("profiles" as never) as unknown as ProfilesTable;
  const { error } = await profilesTable.update({ full_name: fullName }).eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar tu perfil. Inténtalo de nuevo." };
  }

  redirect("/wallet");
}
