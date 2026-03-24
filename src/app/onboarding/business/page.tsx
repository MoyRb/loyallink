import { redirect } from "next/navigation";

import { BusinessOnboardingForm } from "@/components/onboarding/business-onboarding-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOwnerBusinesses } from "@/lib/supabase/queries";

export default async function BusinessOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceso?rol=business_owner");
  }

  if (user.role !== "business_owner") {
    redirect("/wallet");
  }

  let businesses;
  try {
    businesses = await getOwnerBusinesses(user.id);
  } catch (error) {
    console.error("[onboarding/business/page] failed to load owner businesses", {
      userId: user.id,
      error,
    });

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-8 sm:px-6">
        <Card
          title="No pudimos cargar tu onboarding"
          description="Ocurrió un error al consultar tu negocio actual. Recarga la página y vuelve a intentarlo."
        />
      </main>
    );
  }

  if (businesses.length > 0) {
    redirect("/business");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-8 sm:px-6">
      <Card
        title="Configura tu negocio"
        description="Este onboarding crea tu perfil comercial y lo deja listo para los módulos de puntos y QR."
      >
        <BusinessOnboardingForm />
      </Card>
    </main>
  );
}
