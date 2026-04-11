import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Suporte — SAFE",
  description:
    "Central de suporte do aplicativo SAFE. Tire dúvidas, reporte problemas e entre em contato.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-warm-100">
      {/* Navbar */}
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

      {/* Header */}
      <div
        className="pt-24"
        style={{
          background:
            "linear-gradient(180deg, #8B1A1A 0%, #A52422 40%, #b5726a 75%, #f5f0eb 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Suporte
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Estamos aqui para ajudar você
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto -mt-6 max-w-3xl px-6 pb-20">
        <article className="rounded-2xl border border-warm-300/50 bg-white p-8 shadow-lg sm:p-12">
          <p className="leading-relaxed text-gray-600">
            Se você tiver dúvidas, sugestões ou precisar de ajuda com o
            aplicativo <strong className="text-gray-900">SAFE</strong>, estamos à
            disposição. Confira abaixo as formas de entrar em contato e as
            perguntas mais frequentes.
          </p>

          <Section title="Entre em contato">
            <p>
              A maneira mais rápida de obter ajuda é enviando um e-mail para
              nossa equipe de suporte:
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-warm-300/50 bg-warm-100 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">E-mail</p>
                <a
                  href="mailto:suporte@appsafe.com.br"
                  className="text-sm text-burgundy-600 underline-offset-2 hover:underline"
                >
                  suporte@appsafe.com.br
                </a>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Respondemos em até 48 horas úteis.
            </p>
          </Section>

          <Section title="Perguntas frequentes">
            <div className="space-y-4">
              <FaqItem question="Como faço para criar uma conta?">
                Basta abrir o aplicativo SAFE e tocar em &ldquo;Criar
                conta&rdquo;. Você pode se cadastrar usando seu e-mail ou uma
                conta Apple/Google.
              </FaqItem>

              <FaqItem question="Esqueci minha senha. O que faço?">
                Na tela de login, toque em &ldquo;Esqueci minha senha&rdquo; e
                siga as instruções para redefinir sua senha por e-mail.
              </FaqItem>

              <FaqItem question="Como gerenciar ou cancelar minha assinatura?">
                As assinaturas são gerenciadas pela loja de aplicativos (App
                Store ou Google Play). Acesse as configurações de assinatura do
                seu dispositivo para alterar ou cancelar.
              </FaqItem>

              <FaqItem question="Meus dados estão seguros?">
                Sim. Levamos sua privacidade a sério. Consulte nossa{" "}
                <a
                  href="/privacidade"
                  className="text-burgundy-600 underline-offset-2 hover:underline"
                >
                  Política de Privacidade
                </a>{" "}
                para mais detalhes sobre como protegemos seus dados.
              </FaqItem>

              <FaqItem question="Encontrei um problema no aplicativo. Como reportar?">
                Envie um e-mail para nosso suporte descrevendo o problema, o
                dispositivo que você usa e, se possível, uma captura de tela.
                Isso nos ajuda a resolver mais rápido.
              </FaqItem>

              <FaqItem question="O aplicativo funciona offline?">
                Algumas funcionalidades requerem conexão com a internet. Estamos
                trabalhando para ampliar o acesso offline em futuras
                atualizações.
              </FaqItem>
            </div>
          </Section>

          <Section title="Outras informações">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <a
                  href="/privacidade"
                  className="text-burgundy-600 underline-offset-2 hover:underline"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a
                  href="/termos"
                  className="text-burgundy-600 underline-offset-2 hover:underline"
                >
                  Termos de Uso
                </a>
              </li>
            </ul>
          </Section>

          <div className="mt-10 border-t border-warm-300 pt-6">
            <p className="text-xs leading-relaxed text-gray-400">
              Se precisar de ajuda adicional, não hesite em nos contatar. Estamos
              comprometidos em oferecer a melhor experiência possível.
            </p>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-warm-300/50 bg-warm-100 py-8">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Safe — Um espaço seguro para sua
            alma
          </p>
        </div>
      </footer>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-2 leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-warm-300/50 bg-warm-100/50 transition-colors open:bg-warm-100">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-gray-900">
        {question}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
        {children}
      </div>
    </details>
  );
}
