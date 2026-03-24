"use server";

import { redirect } from "next/navigation";

import type { AuthActionState } from "@/app/acceso/state";
import { resolveRedirectByRole } from "@/lib/auth/redirect-by-role";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/domain";

function normalizeRole(value: FormDataEntryValue | null): UserRole {
  return value === "business_owner" ? "business_owner" : "customer";
}

export async function handleAuthAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = formData.get("mode");
  const role = normalizeRole(formData.get("role"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return {
      error: "Debes capturar correo y contraseña.",
      message: null,
    };
  }

  if (mode === "register" && password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
      message: null,
    };
  }

  const supabase = await getSupabaseServerClient();

  if (mode === "register") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
      },
    });

    if (error) {
      return {
        error: error.message,
        message: null,
      };
    }

    if (!data.user) {
      return {
        error: "No fue posible crear tu cuenta en este momento.",
        message: null,
      };
    }

    if (!data.session) {
      return {
        error: null,
        message:
          "Te enviamos un correo de confirmación. Verifícalo para continuar con el onboarding.",
      };
    }

    const context = await resolveRedirectByRole(data.user.id);
    redirect(context.destination);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: error?.message ?? "No fue posible iniciar sesión.",
      message: null,
    };
  }

  const context = await resolveRedirectByRole(data.user.id);
  redirect(context.destination);
}
