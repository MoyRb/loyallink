"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import type { BusinessProfileUpdateState } from "@/app/(dashboard)/business/state";

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

interface OwnedBusiness {
  id: string;
  logo_url: string | null;
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

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
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

function getUploadErrorMessage(error: ErrorWithMessage) {
  const statusCode = error.statusCode ?? "N/A";
  const errorCode = error.code ?? "storage_error";
  const details = error.details ? ` Detalles: ${error.details}` : "";
  return `No se pudo subir el logo (${statusCode} - ${errorCode}): ${error.message ?? "Error desconocido"}.${details}`;
}

type BusinessesTable = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      order: (column: string, options: { ascending: boolean }) => {
        limit: (amount: number) => { maybeSingle: () => Promise<{ data: OwnedBusiness | null; error: { message: string } | null }> };
      };
    };
  };
  update: (values: {
    name: string;
    slug: string;
    description: string | null;
    primary_color: string | null;
    logo_url: string | null;
  }) => {
    eq: (column: string, value: string) => { eq: (column: string, value: string) => Promise<{ error: { message: string } | null }> };
  };
};

export async function updateBusinessProfile(
  _state: BusinessProfileUpdateState,
  formData: FormData,
): Promise<BusinessProfileUpdateState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "Tu sesión expiró. Inicia sesión nuevamente.", success: null, logoUrl: null };
    }

    if (user.role !== "business_owner") {
      return { error: "Solo los negocios pueden actualizar este perfil.", success: null, logoUrl: null };
    }

    const supabase = await getSupabaseServerClient();
    const businessesTable = supabase.from("businesses" as never) as unknown as BusinessesTable;

    const { data: business, error: businessError } = await businessesTable
      .select("id,logo_url")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (businessError) {
      return {
        error: `No se pudo cargar tu negocio actual: ${businessError.message}`,
        success: null,
        logoUrl: null,
      };
    }

    if (!business) {
      return { error: "No encontramos un negocio para tu usuario.", success: null, logoUrl: null };
    }

    const name = String(formData.get("name") ?? "").trim();
    const rawSlug = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const primaryColor = String(formData.get("primary_color") ?? "").trim();
    const logo = formData.get("logo");

    if (!name) {
      return { error: "El nombre del negocio es obligatorio.", success: null, logoUrl: business.logo_url };
    }

    const slug = slugify(rawSlug);
    if (!slug) {
      return { error: "El slug es obligatorio y solo admite letras, números y guiones.", success: null, logoUrl: business.logo_url };
    }

    const { data: conflictingSlug, error: slugError } = await businessesTable.select("id").eq("slug", slug).maybeSingle();

    if (slugError) {
      return { error: `No se pudo validar el slug: ${slugError.message}`, success: null, logoUrl: business.logo_url };
    }

    if (conflictingSlug && conflictingSlug.id !== business.id) {
      return { error: "Ese slug ya está en uso. Elige uno diferente.", success: null, logoUrl: business.logo_url };
    }

    let logoUrl = business.logo_url;

    if (logo instanceof File && logo.size > 0) {
      if (logo.size > MAX_LOGO_SIZE_BYTES) {
        return { error: "El logo debe pesar máximo 2 MB.", success: null, logoUrl };
      }

      if (!ALLOWED_LOGO_TYPES.includes(logo.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
        return { error: "Formato inválido. Usa PNG, JPG, WEBP o SVG.", success: null, logoUrl };
      }

      const safeFileName = sanitizeFileName(logo.name);
      const path = `${user.id}/${randomUUID()}-${safeFileName}`;
      const { url: supabaseUrl } = getSupabasePublicEnv();

      console.info("[dashboard/business] iniciando upload de logo", {
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
        console.error("[dashboard/business] logo upload failed", {
          userId: user.id,
          supabaseUrl,
          bucket: BUSINESS_LOGOS_BUCKET,
          path,
          error: uploadError,
        });
        return { error: detailedMessage, success: null, logoUrl };
      }

      const { data: publicUrlData } = supabase.storage.from(BUSINESS_LOGOS_BUCKET).getPublicUrl(path);
      logoUrl = publicUrlData.publicUrl;
      console.info("[dashboard/business] logo subido correctamente", {
        userId: user.id,
        supabaseUrl,
        bucket: BUSINESS_LOGOS_BUCKET,
        path,
      });
    }

    const { error: updateError } = await businessesTable
      .update({
        name,
        slug,
        description: description || null,
        primary_color: primaryColor || null,
        logo_url: logoUrl,
      })
      .eq("id", business.id)
      .eq("owner_id", user.id);

    if (updateError) {
      return { error: `No se pudo guardar tu perfil: ${updateError.message}`, success: null, logoUrl: business.logo_url };
    }

    revalidatePath("/business");

    return {
      error: null,
      success: "Perfil del negocio actualizado correctamente.",
      logoUrl,
    };
  } catch (error) {
    const detailedMessage = getErrorMessage(error, "Ocurrió un error inesperado al actualizar el perfil del negocio.");
    return { error: detailedMessage, success: null, logoUrl: null };
  }
}
