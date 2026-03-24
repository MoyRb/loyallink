"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import type { BusinessOnboardingState } from "@/app/onboarding/business/state";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface ErrorWithMessage {
  message?: string;
  code?: string;
  statusCode?: string | number;
  details?: string;
  error_description?: string;
  cause?: unknown;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as ErrorWithMessage;
    return (
      maybeError.message ||
      maybeError.details ||
      maybeError.error_description ||
      (typeof maybeError.cause === "string" ? maybeError.cause : "") ||
      fallback
    );
  }

  return fallback;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
}

async function ensureUniqueSlug(baseSlug: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("slug")
    .ilike("slug", `${baseSlug}%`)
    .limit(50);

  if (error) {
    throw new Error(`No se pudo validar el slug: ${error.message}`);
  }

  const existing = new Set(((data ?? []) as { slug: string }[]).map((item) => item.slug));

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (suffix < 9999) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function saveBusinessProfile(
  _state: BusinessOnboardingState,
  formData: FormData,
): Promise<BusinessOnboardingState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "Tu sesión expiró. Inicia sesión nuevamente." };
    }

    if (user.role !== "business_owner") {
      return { error: "Solo los negocios pueden completar este onboarding." };
    }

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const primaryColor = String(formData.get("primary_color") ?? "").trim();
    const logo = formData.get("logo");

    if (!name) {
      return { error: "El nombre del negocio es obligatorio." };
    }

    let logoUrl: string | null = null;
    const supabase = await getSupabaseServerClient();

    if (logo instanceof File && logo.size > 0) {
      if (logo.size > 2 * 1024 * 1024) {
        return { error: "El logo debe pesar máximo 2 MB." };
      }

      if (!["image/png", "image/jpeg", "image/webp"].includes(logo.type)) {
        return { error: "El logo debe ser PNG, JPG o WEBP." };
      }

      const { error: bucketError } = await supabase.storage.getBucket("business-logos");
      if (bucketError) {
        const detailedMessage = `No se encontró el bucket "business-logos": ${bucketError.message}`;
        console.error("[onboarding/business] bucket validation failed", {
          userId: user.id,
          error: bucketError,
        });
        return { error: detailedMessage };
      }

      const extension = logo.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("business-logos").upload(path, logo, {
        upsert: false,
        contentType: logo.type,
      });

      if (uploadError) {
        const detailedMessage = `Error al subir el logo a Supabase Storage: ${uploadError.message}`;
        console.error("[onboarding/business] logo upload failed", {
          userId: user.id,
          path,
          error: uploadError,
        });
        return { error: detailedMessage };
      }

      const { data: publicUrlData } = supabase.storage.from("business-logos").getPublicUrl(path);
      logoUrl = publicUrlData.publicUrl;
    }

    const baseSlug = slugify(name) || `negocio-${Date.now()}`;

    const { data: existingBusinessData, error: existingBusinessError } = await supabase
      .from("businesses")
      .select("id,slug,logo_url")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const existingBusiness = existingBusinessData as
      | { id: string; slug: string; logo_url: string | null }
      | null;

    if (existingBusinessError) {
      const detailedMessage = `Error consultando negocios actuales: ${existingBusinessError.message}`;
      console.error("[onboarding/business] existing business lookup failed", {
        userId: user.id,
        error: existingBusinessError,
      });
      return { error: detailedMessage };
    }

    const slug = existingBusiness ? existingBusiness.slug : await ensureUniqueSlug(baseSlug);

    const payload = {
      owner_id: user.id,
      name,
      slug,
      description: description || null,
      primary_color: primaryColor || null,
      logo_url: logoUrl ?? existingBusiness?.logo_url ?? null,
    };

    type BusinessesTable = {
      update: (values: typeof payload) => { eq: (column: string, value: string) => Promise<{ error: { message: string } | null }> };
      insert: (values: typeof payload) => Promise<{ error: { message: string } | null }>;
    };

    const businessesTable = supabase.from("businesses" as never) as unknown as BusinessesTable;

    const { error } = existingBusiness
      ? await businessesTable.update(payload).eq("id", existingBusiness.id)
      : await businessesTable.insert(payload);

    if (error) {
      const detailedMessage = `Error guardando en businesses: ${error.message}`;
      console.error("[onboarding/business] business upsert failed", {
        userId: user.id,
        payload,
        error,
      });
      return { error: detailedMessage };
    }

    redirect("/business");
  } catch (error) {
    const detailedMessage = getErrorMessage(error, "Ocurrió un error inesperado al guardar tu negocio.");
    console.error("[onboarding/business] unhandled onboarding error", error);
    return { error: detailedMessage };
  }
}
