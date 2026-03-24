import type { UserRole } from "@/lib/types/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RedirectContext {
  role: UserRole;
  destination: string;
}

export async function resolveRedirectByRole(userId: string): Promise<RedirectContext> {
  const supabase = await getSupabaseServerClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", userId)
    .maybeSingle();

  const profile = profileData as { role: UserRole; full_name: string | null } | null;

  if (profileError || !profile) {
    return {
      role: "customer",
      destination: "/onboarding/customer",
    };
  }

  if (profile.role === "business_owner") {
    const { count, error: businessCountError } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);

    if (businessCountError || !count) {
      return {
        role: "business_owner",
        destination: "/onboarding/business",
      };
    }

    return {
      role: "business_owner",
      destination: "/business",
    };
  }

  if (!profile.full_name?.trim()) {
    return {
      role: "customer",
      destination: "/onboarding/customer",
    };
  }

  return {
    role: "customer",
    destination: "/wallet",
  };
}
