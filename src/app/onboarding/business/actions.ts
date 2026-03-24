"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import type { BusinessOnboardingState } from "@/app/onboarding/business/state";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data } = await supabase
    .from("businesses")
    .select("slug")
    .ilike("slug", `${baseSlug}%`)
    .limit(50);

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

  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 2 * 1024 * 1024) {
      return { error: "El logo debe pesar máximo 2 MB." };
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(logo.type)) {
      return { error: "El logo debe ser PNG, JPG o WEBP." };
    }

    const extension = logo.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${user.id}/${randomUUID()}.${extension}`;

    const supabase = await getSupabaseServerClient();
    const { error: uploadError } = await supabase.storage.from("business-logos").upload(path, logo, {
      upsert: false,
      contentType: logo.type,
    });

    if (uploadError) {
      return { error: "No se pudo subir el logo. Inténtalo de nuevo." };
    }

    const { data: publicUrlData } = supabase.storage.from("business-logos").getPublicUrl(path);
    logoUrl = publicUrlData.publicUrl;
  }

  const baseSlug = slugify(name) || `negocio-${Date.now()}`;
  const supabase = await getSupabaseServerClient();

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
    return { error: "No se pudo verificar tu negocio actual." };
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
    insert: (values: typeof payload) => Promise<{ error: { message: string } | null }>
  };

  const businessesTable = supabase.from("businesses" as never) as unknown as BusinessesTable;

  const { error } = existingBusiness
    ? await businessesTable.update(payload).eq("id", existingBusiness.id)
    : await businessesTable.insert(payload);

  if (error) {
    return { error: "No se pudo guardar el perfil del negocio." };
  }

  redirect("/business");
}
