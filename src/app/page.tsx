import Link from "next/link";

import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";

const quickLinks = [
  {
    title: "Customer Wallet",
    description: "View loyalty cards, balances, and history.",
    href: "/wallet",
  },
  {
    title: "Business Profile",
    description: "Create your business and upload a logo.",
    href: "/business",
  },
  {
    title: "Earn via QR",
    description: "Customer scan and claim flow UI.",
    href: "/scan",
  },
  {
    title: "Redeem via QR",
    description: "Generate and verify redemption QR.",
    href: "/redeem",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-zinc-900 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">MVP foundation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{siteConfig.name}</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-200 sm:text-base">
          A mobile-first loyalty platform for customers and businesses. This starter ships with
          clean architecture, placeholder flows, and Supabase-ready boundaries.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/wallet" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900">
            Open wallet demo
          </Link>
          <Link
            href="/business"
            className="rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white"
          >
            Open business demo
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Card key={item.href} title={item.title} description={item.description}>
            <Link href={item.href} className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100">
              Explore flow
            </Link>
          </Card>
        ))}
      </section>
    </main>
  );
}
