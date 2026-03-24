import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { UserRole } from "@/lib/types/domain";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("id,email,full_name,role").eq("id", user.id).maybeSingle();

  const profile = data as Database["public"]["Tables"]["profiles"]["Row"] | null;

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
});
