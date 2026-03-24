import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOwnerBusinesses, type OwnerBusiness } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function BusinessPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=business_owner");
  }

  if (user.role !== "business_owner") {
    redirect("/wallet");
  }

  const businesses: OwnerBusiness[] = await getOwnerBusinesses(user.id);

  if (businesses.length === 0) {
    redirect("/onboarding/business");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard del negocio</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Aquí puedes revisar y ajustar la configuración de tu perfil comercial.
        </p>
      </header>

      <Card title="Negocios vinculados" description="Datos cargados desde Supabase para el owner autenticado.">
        <ul className="space-y-2 text-sm">
          {businesses.map((business) => (
            <li key={business.id} className="flex items-center justify-between rounded-lg border border-black/10 p-3 dark:border-white/10">
              <div>
                <p className="font-medium">{business.name}</p>
                <p className="text-zinc-500 dark:text-zinc-400">/{business.slug}</p>
                {business.description ? <p className="text-zinc-500 dark:text-zinc-400">{business.description}</p> : null}
              </div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{business.primary_color ?? "Sin color"}</p>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
