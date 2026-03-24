import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { resolveRedirectByRole } from "@/lib/auth/redirect-by-role";
import type { UserRole } from "@/lib/types/domain";

interface AccessPageProps {
  searchParams: Promise<{
    rol?: string;
  }>;
}

function getRoleFromSearchParams(rol?: string): UserRole {
  return rol === "business_owner" ? "business_owner" : "customer";
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const user = await getCurrentUser();

  if (user) {
    const context = await resolveRedirectByRole(user.id);
    redirect(context.destination);
  }

  const params = await searchParams;
  const defaultRole = getRoleFromSearchParams(params.rol);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-8 sm:px-6">
      <Card
        title="Bienvenido a LoyalLink"
        description="Accede con tu rol para empezar tu onboarding y usar tu panel correspondiente."
      >
        <AuthForm defaultRole={defaultRole} />
      </Card>
    </main>
  );
}
