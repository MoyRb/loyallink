import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCustomerWalletData } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

const transactionSourceLabels: Record<string, string> = {
  qr_claim: "QR de acumulación",
  qr_redeem: "QR de canje",
};

function getTierLabel(pointsBalance: number) {
  if (pointsBalance >= 100) return "Oro";
  if (pointsBalance >= 50) return "Plata";
  return "Bronce";
}

export default async function WalletPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=customer");
  }

  if (user.role !== "customer") {
    redirect("/business");
  }

  if (!user.fullName?.trim()) {
    redirect("/onboarding/customer");
  }

  const data = await getCustomerWalletData(user.id);
  const cards = data.cards;
  const transactions = data.transactions;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mi cartera</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Revisa tus tarjetas por negocio, tus puntos acumulados y cada movimiento registrado.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            title={card.businessName}
            description={`Nivel: ${getTierLabel(card.balance)}${card.cardLabel ? ` · ${card.cardLabel}` : ""}`}
            className="bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
          >
            <p className="text-3xl font-semibold tracking-tight">{card.balance} pts</p>
          </Card>
        ))}
      </section>

      <section className="mt-6">
        <Card title="Actividad reciente" description="Cada movimiento de puntos queda registrado de forma segura.">
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{tx.businessName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {new Date(tx.createdAt).toLocaleString("es-MX")} · {transactionSourceLabels[tx.source] ?? tx.source}
                  </p>
                </div>
                <p className={tx.type === "earn" ? "text-emerald-600" : "text-amber-600"}>
                  {tx.type === "earn" ? "+" : "-"}
                  {tx.points} pts
                </p>
              </li>
            ))}
            {transactions.length === 0 ? (
              <li className="text-sm text-zinc-500 dark:text-zinc-400">Aún no tienes movimientos registrados.</li>
            ) : null}
          </ul>
        </Card>
      </section>
    </main>
  );
}
