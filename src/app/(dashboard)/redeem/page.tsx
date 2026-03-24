import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function RedeemPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Redeem Points (QR Verify)</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Customer-generated QR is only a token request; server computes redemption.
        </p>
      </header>

      <Card title="Redeem flow placeholder" action={<Badge tone="warning">Audit trail required</Badge>}>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-200">
          <li>Customer generates redeem QR from server-issued, short-lived token.</li>
          <li>Business scans and sends token to secure verification endpoint.</li>
          <li>Server checks balance, applies redemption, logs transaction atomically.</li>
        </ol>
      </Card>
    </main>
  );
}
