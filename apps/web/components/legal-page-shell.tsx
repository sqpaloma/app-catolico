import Image from "next/image";
import type { ReactNode } from "react";

const LEGAL_EMAIL = "suporte@safecatholic.app";
const SITE_URL = "https://www.safecatholic.app";

export function LegalPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-warm-100">
      <nav className="fixed top-0 z-50 w-full border-b border-warm-300/50 bg-warm-100/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-600">
              <Image
                src="/logo.png"
                alt="Safe"
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            </div>
            <span className="text-xl font-bold tracking-wider text-burgundy-600">
              SAFE
            </span>
          </a>
          <a
            href="/"
            className="text-sm font-medium text-burgundy-600 transition-colors hover:text-burgundy-700"
          >
            Voltar ao início
          </a>
        </div>
      </nav>

      <div
        className="pt-24"
        style={{
          background:
            "linear-gradient(180deg, #8B1A1A 0%, #A52422 40%, #b5726a 75%, #f5f0eb 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-white/70">{subtitle}</p>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-3xl px-6 pb-20">
        <article className="rounded-2xl border border-warm-300/50 bg-white p-8 shadow-lg sm:p-12">
          {children}
        </article>
      </div>

      <footer className="border-t border-warm-300/50 bg-warm-100 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center text-xs text-gray-400 sm:flex-row sm:justify-between">
          <div className="flex gap-4">
            <a href="/privacidade" className="hover:text-burgundy-600">
              Privacidade
            </a>
            <a href="/termos" className="hover:text-burgundy-600">
              Termos
            </a>
            <a href="/suporte" className="hover:text-burgundy-600">
              Suporte
            </a>
          </div>
          <span>
            Contato: {LEGAL_EMAIL} · {SITE_URL}
          </span>
        </div>
      </footer>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export { LEGAL_EMAIL, SITE_URL };
