"use client";

import { useActionState } from "react";

import {
  customerOnboardingInitialState,
  saveCustomerProfile,
  type CustomerOnboardingState,
} from "@/app/onboarding/customer/actions";
import { Button } from "@/components/ui/button";

interface CustomerOnboardingFormProps {
  defaultName: string;
}

export function CustomerOnboardingForm({ defaultName }: CustomerOnboardingFormProps) {
  const [state, action, pending] = useActionState<CustomerOnboardingState, FormData>(
    saveCustomerProfile,
    customerOnboardingInitialState,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="grid gap-1 text-sm">
        Nombre visible
        <input
          required
          name="full_name"
          defaultValue={defaultName}
          placeholder="Ej. Sofía Torres"
          className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
        />
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Guardando..." : "Guardar perfil y continuar"}
      </Button>
    </form>
  );
}
