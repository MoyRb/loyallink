import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function RedeemPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Canjear puntos (verificación QR)</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          El QR generado por el cliente solo solicita un token; el servidor calcula el canje.
        </p>
      </header>

      <Card title="Flujo de canje (demo)" action={<Badge tone="warning">Bitácora de auditoría obligatoria</Badge>}>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-200">
          <li>El cliente genera un QR de canje con un token temporal emitido por el servidor.</li>
          <li>El negocio escanea y envía el token a un endpoint seguro de verificación.</li>
          <li>El servidor valida el saldo, aplica el canje y registra la operación de forma atómica.</li>
        </ol>
      </Card>
    </main>
  );
}
