import { redirect } from "next/navigation";

import { CustomerOnboardingForm } from "@/components/onboarding/customer-onboarding-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function CustomerOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=customer");
  }

  if (user.role !== "customer") {
    redirect("/business");
  }

  if (user.fullName?.trim()) {
    redirect("/wallet");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-8 sm:px-6">
      <Card
        title="Completa tu perfil de cliente"
        description="Necesitamos tu nombre visible para mostrarlo en tu cartera y en tus interacciones de lealtad."
      >
        <CustomerOnboardingForm defaultName={user.fullName ?? ""} />
      </Card>
    </main>
  );
}
