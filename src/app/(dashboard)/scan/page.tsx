import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { EarnQrMvp } from "@/components/scan/earn-qr-mvp";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getScanDashboardData } from "@/app/(dashboard)/scan/data";

export const dynamic = "force-dynamic";

const sourceLabels: Record<string, string> = {
  qr_claim: "QR de acumulación",
  qr_redeem: "QR de canje",
};

export default async function ScanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=business_owner");
  }

  if (user.role !== "business_owner") {
    redirect("/wallet");
  }

  const dashboardData = await getScanDashboardData(user.id);

  if (!dashboardData) {
    redirect("/onboarding/business");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dar puntos con QR</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Modo caja: genera un QR temporal para sumar puntos al cliente de forma rápida y segura.
        </p>
      </header>

      <EarnQrMvp
        businessId={dashboardData.business.id}
        businessName={dashboardData.business.name}
        initialOperation={dashboardData.activeOperation}
      />

      <section className="mt-4">
        <Card
          title="Transacciones recientes"
          description="Vista rápida de los últimos movimientos registrados en tu negocio."
        >
          <ul className="space-y-2">
            {dashboardData.recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm dark:border-white/10"
              >
                <div>
                  <p className="font-medium">{tx.customerName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {new Date(tx.createdAt).toLocaleString("es-MX")} · {sourceLabels[tx.source] ?? tx.source}
                  </p>
                </div>
                <p className={tx.type === "earn" ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
                  {tx.type === "earn" ? "+" : "-"}
                  {tx.points} pts
                </p>
              </li>
            ))}
            {dashboardData.recentTransactions.length === 0 ? (
              <li className="rounded-xl border border-dashed border-black/20 p-3 text-sm text-zinc-500 dark:border-white/20 dark:text-zinc-300">
                Todavía no hay transacciones para este negocio.
              </li>
            ) : null}
          </ul>
        </Card>
      </section>
    </main>
  );
}
