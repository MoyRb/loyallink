import type { ReactNode } from "react";

import { TopNav } from "@/components/layout/top-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <TopNav />
      {children}
    </div>
  );
}
