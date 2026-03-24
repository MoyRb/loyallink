"use client";

interface DashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold">Ocurrió un error</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{error.message || "Intenta recargar la vista."}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Reintentar
      </button>
    </main>
  );
}
