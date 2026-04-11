import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safe — Um espaço seguro para sua alma",
  description:
    "Um espaço sagrado e anônimo para partilhar o peso da sua alma e encontrar orientação espiritual baseada na fé católica.",
  keywords: [
    "direção espiritual",
    "católico",
    "anônimo",
    "fé",
    "orientação espiritual",
    "safe",
  ],
  openGraph: {
    title: "Safe — Um espaço seguro para sua alma",
    description:
      "Compartilhe o que está no seu coração de forma anônima e receba orientação espiritual.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Xanh+Mono:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
