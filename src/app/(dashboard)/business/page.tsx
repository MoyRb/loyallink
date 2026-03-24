import { Card } from "@/components/ui/card";

export default function BusinessPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Perfil del negocio</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Personaliza tu negocio para comenzar a dar puntos y validar canjes por QR.
        </p>
      </header>

      <Card title="Crear o actualizar negocio" description="Configura la información principal y tu logotipo">
        <form className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Nombre del negocio
            <input className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950" placeholder="Café Sol MX" />
          </label>
          <label className="grid gap-1 text-sm">
            Identificador (slug)
            <input className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-zinc-950" placeholder="cafe-sol" />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            Logotipo
            <input type="file" className="rounded-xl border border-dashed border-black/20 p-3 text-sm dark:border-white/20" />
          </label>
          <button
            type="button"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Guardar perfil
          </button>
        </form>
      </Card>
    </main>
  );
}
