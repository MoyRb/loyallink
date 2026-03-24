import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ScanPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Earn Points (QR Claim)</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Client never trusts QR value. Server validates short-lived tokens.
        </p>
      </header>

      <Card title="Scan flow placeholder" action={<Badge tone="warning">Server token required</Badge>}>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-200">
          <li>Business generates a short-lived token bound to business + points rule.</li>
          <li>Customer scans QR and sends token to secure claim endpoint.</li>
          <li>Server validates token, records transaction, then increments points.</li>
        </ol>
      </Card>
    </main>
  );
}
