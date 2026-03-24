import type { ReactNode } from "react";

import { TopNav } from "@/components/layout/top-nav";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
        </header>
        {children}
      </main>
    </>
  );
}
