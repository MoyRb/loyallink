"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import type { BusinessOnboardingState } from "@/app/onboarding/business/state";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUSINESS_LOGOS_BUCKET = "business-logos";
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;

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

function sanitizeFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = (dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const extension = dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "png";

  return `${baseName || "logo"}.${extension}`;
}

function getUploadErrorMessage(error: ErrorWithMessage) {
  const statusCode = error.statusCode ?? "N/A";
  const errorCode = error.code ?? "storage_error";
  const details = error.details ? ` Detalles: ${error.details}` : "";
  return `No se pudo subir el logo (${statusCode} - ${errorCode}): ${error.message ?? "Error desconocido"}.${details}`;
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
      if (logo.size > MAX_LOGO_SIZE_BYTES) {
        return { error: "El logo debe pesar máximo 2 MB." };
      }

      if (!ALLOWED_LOGO_TYPES.includes(logo.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
        return { error: "Formato inválido. Usa PNG, JPG, WEBP o SVG." };
      }

      const safeFileName = sanitizeFileName(logo.name);
      const path = `${user.id}/${randomUUID()}-${safeFileName}`;
      const { url: supabaseUrl } = getSupabasePublicEnv();

      console.info("[onboarding/business] iniciando upload de logo", {
        userId: user.id,
        supabaseUrl,
        bucket: BUSINESS_LOGOS_BUCKET,
        path,
      });

      const { error: uploadError } = await supabase.storage.from(BUSINESS_LOGOS_BUCKET).upload(path, logo, {
        upsert: false,
        contentType: logo.type,
      });

      if (uploadError) {
        const uploadErrorDetails = uploadError as unknown as ErrorWithMessage;
        const detailedMessage = getUploadErrorMessage(uploadErrorDetails);
        console.error("[onboarding/business] logo upload failed", {
          userId: user.id,
          supabaseUrl,
          bucket: BUSINESS_LOGOS_BUCKET,
          path,
          error: uploadError,
        });
        return { error: detailedMessage };
      }

      const { data: publicUrlData } = supabase.storage.from(BUSINESS_LOGOS_BUCKET).getPublicUrl(path);
      logoUrl = publicUrlData.publicUrl;
      console.info("[onboarding/business] logo uploaded successfully", {
        userId: user.id,
        supabaseUrl,
        bucket: BUSINESS_LOGOS_BUCKET,
        path,
      });
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
