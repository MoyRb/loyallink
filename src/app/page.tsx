import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { resolveRedirectByRole } from "@/lib/auth/redirect-by-role";
import { siteConfig } from "@/lib/config/site";

const accessCards = [
  {
    title: "Registrarme como negocio",
    description: "Administra tu programa de lealtad, personaliza marca y prepara el flujo de QR.",
    href: "/acceso?rol=business_owner",
    cta: "Entrar como negocio",
  },
  {
    title: "Soy cliente",
    description: "Consulta tu cartera de puntos y mantén tus recompensas siempre a la mano.",
    href: "/acceso?rol=customer",
    cta: "Entrar como cliente",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    const context = await resolveRedirectByRole(user.id);
    redirect(context.destination);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-zinc-900 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">LoyalLink</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Fidelización simple para México</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-200 sm:text-base">
          Conecta negocios y clientes con una experiencia rápida de autenticación y onboarding.
          Elige cómo quieres entrar para configurar tu cuenta en minutos.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {accessCards.map((item) => (
          <Card key={item.href} title={item.title} description={item.description}>
            <Link href={item.href} className="text-sm font-semibold text-zinc-900 underline dark:text-zinc-100">
              {item.cta}
            </Link>
          </Card>
        ))}
      </section>

      <p className="mt-6 text-center text-xs text-zinc-500">{siteConfig.name} · diseño mobile-first</p>
    </main>
  );
}
