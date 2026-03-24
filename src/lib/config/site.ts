export const siteConfig = {
  name: "LoyalLink",
  description:
    "Plataforma de fidelización con puntos y QR para clientes y negocios.",
  navItems: [
    { label: "Billetera", href: "/wallet" },
    { label: "Negocio", href: "/business" },
    { label: "Escanear", href: "/scan" },
    { label: "Canjear", href: "/redeem" },
  ],
} as const;
