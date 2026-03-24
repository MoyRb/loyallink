import { Card } from "@/components/ui/card";
import { mockCards, mockTransactions } from "@/features/loyalty/mock-data";

const transactionSourceLabels: Record<string, string> = {
  qr_claim: "QR de acumulación",
  qr_redeem: "QR de canje",
};
const tierLabels: Record<string, string> = {
  Gold: "Oro",
  Silver: "Plata",
  Bronze: "Bronce",
};

export default function WalletPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mi cartera</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Revisa tus tarjetas por negocio, tus puntos acumulados y cada movimiento registrado.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCards.map((card) => (
          <Card
            key={card.businessId}
            title={card.businessName}
            description={`Nivel: ${tierLabels[card.tier] ?? card.tier}`}
            className="bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
          >
            <p className="text-3xl font-semibold tracking-tight">{card.pointsBalance} pts</p>
          </Card>
        ))}
      </section>

      <section className="mt-6">
        <Card title="Actividad reciente" description="Cada movimiento de puntos queda registrado de forma segura.">
          <ul className="space-y-3">
            {mockTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{tx.businessName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {new Date(tx.createdAt).toLocaleString("es-MX")} ·{" "}
                    {transactionSourceLabels[tx.source] ?? tx.source}
                  </p>
                </div>
                <p className={tx.type === "earn" ? "text-emerald-600" : "text-amber-600"}>
                  {tx.type === "earn" ? "+" : "-"}
                  {tx.points} pts
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </main>
  );
}
