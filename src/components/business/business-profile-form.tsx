"use client";

import Image from "next/image";
import { useActionState } from "react";

import { updateBusinessProfile } from "@/app/(dashboard)/business/actions";
import { getBusinessProfileUpdateInitialState, type BusinessProfileUpdateState } from "@/app/(dashboard)/business/state";
import { Button } from "@/components/ui/button";

interface BusinessProfileFormProps {
  initialName: string;
  initialSlug: string;
  initialDescription: string | null;
  initialPrimaryColor: string | null;
  initialLogoUrl: string | null;
}

export function BusinessProfileForm({
  initialName,
  initialSlug,
  initialDescription,
  initialPrimaryColor,
  initialLogoUrl,
}: BusinessProfileFormProps) {
  const [state, action, pending] = useActionState<BusinessProfileUpdateState, FormData>(
    updateBusinessProfile,
    getBusinessProfileUpdateInitialState(initialLogoUrl),
  );
  const previewUrl = state.logoUrl ?? initialLogoUrl;

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Nombre
        <input
          required
          name="name"
          defaultValue={initialName}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Slug
        <input
          required
          name="slug"
          defaultValue={initialSlug}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Descripción (opcional)
        <textarea
          name="description"
          rows={3}
          defaultValue={initialDescription ?? ""}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Color principal (opcional)
        <input
          name="primary_color"
          defaultValue={initialPrimaryColor ?? ""}
          placeholder="#14532d"
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <div className="grid gap-2">
        <p className="text-sm">Logo actual</p>
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Logo actual del negocio"
            width={80}
            height={80}
            className="h-20 w-20 rounded-xl border border-black/10 object-contain p-2 dark:border-white/20"
            unoptimized
          />
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Aún no has subido un logo.</p>
        )}
      </div>

      <label className="grid gap-1 text-sm">
        Subir o reemplazar logo
        <input
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="rounded-xl border border-dashed border-black/20 p-3 text-sm dark:border-white/20"
        />
        <span className="text-xs text-black/60 dark:text-white/60">Formatos: PNG, JPG, WEBP o SVG. Máximo 2 MB.</span>
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Guardando cambios..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
