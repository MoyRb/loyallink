import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ScanPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Acumular puntos (reclamo con QR)</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          El cliente nunca confía en el valor del QR. El servidor valida tokens de corta duración.
        </p>
      </header>

      <Card title="Flujo de escaneo (demo)" action={<Badge tone="warning">Token de servidor obligatorio</Badge>}>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-700 dark:text-zinc-200">
          <li>El negocio genera un token temporal ligado al comercio y a la regla de puntos.</li>
          <li>El cliente escanea el QR y envía el token a un endpoint seguro de reclamo.</li>
          <li>El servidor valida el token, registra la transacción y suma los puntos.</li>
        </ol>
      </Card>
    </main>
  );
}
