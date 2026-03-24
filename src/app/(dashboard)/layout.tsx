import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { TopNav } from "@/components/layout/top-nav";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso");
  }

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <TopNav />
      {children}
    </div>
  );
}
