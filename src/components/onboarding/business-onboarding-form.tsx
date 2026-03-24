"use client";

import { useEffect } from "react";
import { useActionState } from "react";

import { saveBusinessProfile } from "@/app/onboarding/business/actions";
import {
  businessOnboardingInitialState,
  type BusinessOnboardingState,
} from "@/app/onboarding/business/state";
import { Button } from "@/components/ui/button";

export function BusinessOnboardingForm() {
  const [state, action, pending] = useActionState<BusinessOnboardingState, FormData>(
    saveBusinessProfile,
    businessOnboardingInitialState,
  );

  useEffect(() => {
    if (state.error) {
      console.error("[onboarding/business] submit error", state.error);
    }
  }, [state.error]);

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Nombre del negocio
        <input
          required
          name="name"
          placeholder="Ej. Café Sol MX"
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Descripción (opcional)
        <textarea
          name="description"
          placeholder="Cuéntales a tus clientes qué hace especial a tu negocio"
          rows={3}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Color principal (opcional)
        <input
          name="primary_color"
          placeholder="#14532d"
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Logo (opcional)
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

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Guardando perfil..." : "Guardar negocio y continuar"}
      </Button>
    </form>
  );
}
