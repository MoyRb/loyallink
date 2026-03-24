import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function ScanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=business_owner");
  }

  if (user.role !== "business_owner") {
    redirect("/wallet");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dar puntos con QR</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Este módulo quedará listo después. Por ahora el acceso ya está protegido por autenticación y rol.
        </p>
      </header>

      <Card title="Siguiente etapa" action={<Badge tone="warning">Pendiente de implementación QR real</Badge>}>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-200">
          <li>Generar token temporal en backend para acumulación de puntos.</li>
          <li>Escanear QR y validar token contra Supabase con reglas de seguridad.</li>
          <li>Registrar transacción y actualizar cartera del cliente.</li>
        </ol>
      </Card>
    </main>
  );
}
