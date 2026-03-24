export const siteConfig = {
  name: "LoyalLink",
  description:
    "Plataforma de fidelización con puntos y QR para clientes y negocios.",
  navItems: [
    { label: "Mi cartera", href: "/wallet" },
    { label: "Perfil del negocio", href: "/business" },
    { label: "Dar puntos con QR", href: "/scan" },
    { label: "Canjear con QR", href: "/redeem" },
  ],
} as const;
