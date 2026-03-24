import Link from "next/link";

import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";

const quickLinks = [
  {
    title: "Mi cartera",
    description: "Consulta tus tarjetas, saldos de puntos e historial de movimientos.",
    href: "/wallet",
  },
  {
    title: "Perfil del negocio",
    description: "Configura tu negocio, tu marca y tus reglas de fidelización.",
    href: "/business",
  },
  {
    title: "Dar puntos con QR",
    description: "Otorga puntos al instante desde caja con un QR seguro.",
    href: "/scan",
  },
  {
    title: "Canjear con QR",
    description: "Valida recompensas y canjes de forma rápida y confiable.",
    href: "/redeem",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-zinc-900 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Base MVP</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{siteConfig.name}</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-200 sm:text-base">
          Conecta negocios y clientes con una plataforma de fidelización en la que cada compra suma
          puntos y cada recompensa se valida por QR.
          Esta base ya incluye arquitectura limpia y flujos listos para integrarse con Supabase.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/wallet" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900">
            Ir a Mi cartera
          </Link>
          <Link
            href="/business"
            className="rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white"
          >
            Ir a Perfil del negocio
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Card key={item.href} title={item.title} description={item.description}>
            <Link href={item.href} className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100">
              Abrir sección
            </Link>
          </Card>
        ))}
      </section>
    </main>
  );
}
