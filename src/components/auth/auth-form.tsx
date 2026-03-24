"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { handleAuthAction } from "@/app/acceso/actions";
import { initialAuthActionState, type AuthActionState } from "@/app/acceso/state";
import type { UserRole } from "@/lib/types/domain";
import { cn } from "@/lib/utils/cn";

type AuthMode = "login" | "register";

interface AuthFormProps {
  defaultRole: UserRole;
}

function RoleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
          : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-200",
      )}
    >
      {label}
    </button>
  );
}

export function AuthForm({ defaultRole }: AuthFormProps) {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [mode, setMode] = useState<AuthMode>("login");
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    handleAuthAction,
    initialAuthActionState,
  );

  const formTitle = useMemo(
    () =>
      mode === "login"
        ? role === "business_owner"
          ? "Entrar como negocio"
          : "Entrar como cliente"
        : role === "business_owner"
          ? "Crear cuenta de negocio"
          : "Crear cuenta de cliente",
    [mode, role],
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="role" value={role} />

      <div className="grid gap-2">
        <p className="text-sm font-medium">Selecciona tu tipo de acceso</p>
        <div className="grid grid-cols-2 gap-2">
          <RoleButton active={role === "business_owner"} label="Tengo un negocio" onClick={() => setRole("business_owner")} />
          <RoleButton active={role === "customer"} label="Soy cliente" onClick={() => setRole("customer")} />
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">{formTitle}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {mode === "login"
            ? "Inicia sesión para continuar donde te quedaste."
            : "Regístrate para iniciar tu onboarding en LoyalLink."}
        </p>

        <div className="mt-4 grid gap-3">
          {mode === "register" ? (
            <label className="grid gap-1 text-sm">
              Nombre visible
              <input
                name="full_name"
                placeholder={role === "business_owner" ? "Ej. Laura de Café Sol" : "Ej. Sofía Torres"}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
              />
            </label>
          ) : null}

          <label className="grid gap-1 text-sm">
            Correo electrónico
            <input
              required
              type="email"
              name="email"
              placeholder="tu-correo@ejemplo.com"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Contraseña
            <input
              required
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950"
            />
          </label>
        </div>

        {state.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}
        {state.message ? <p className="mt-3 text-sm text-emerald-600">{state.message}</p> : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            className="w-full sm:w-auto"
          >
            {mode === "login" ? "Quiero registrarme" : "Ya tengo cuenta"}
          </Button>
        </div>
      </div>
    </form>
  );
}
