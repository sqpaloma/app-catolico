import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Termos de Uso — SAFE",
  description:
    "Termos de Uso do aplicativo SAFE.",
};

export default function TermsOfUsePage() {
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
            Termos de Uso
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Aplicativo SAFE — Última atualização: Maio 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto -mt-6 max-w-3xl px-6 pb-20">
        <article className="rounded-2xl border border-warm-300/50 bg-white p-8 shadow-lg sm:p-12">
          <Section title="1. Aceitação">
            <p>
              Ao criar uma conta ou utilizar o aplicativo SAFE
              (&ldquo;App&rdquo;), você declara ter lido e concordado com estes
              Termos de Uso e com a Política de Privacidade. Se não concordar,
              não utilize o App.
            </p>
          </Section>

          <Section title="2. Descrição do serviço">
            <p>
              O App oferece um ambiente digital para apoio à vida espiritual,
              incluindo recursos como direção espiritual, diário, perguntas e
              interação com diretores, conforme disponibilizado em cada versão.
              Funcionalidades podem exigir cadastro ou assinatura.
            </p>
          </Section>

          <Section title="3. Elegibilidade e conta">
            <p>
              Você deve fornecer informações verdadeiras e manter sua conta
              segura. Você é responsável por todas as atividades realizadas com
              seu acesso. Notifique-nos imediatamente em caso de uso não
              autorizado.
            </p>
          </Section>

          <Section title="4. Coleta e uso de dados para personalização">
            <p>
              Durante o cadastro, podemos solicitar informações como sexo, faixa
              etária e outros dados de perfil. Esses dados são utilizados
              exclusivamente para personalizar sua experiência no App, oferecendo
              orientações e conteúdos mais adequados ao seu perfil. O tratamento
              desses dados segue nossa Política de Privacidade e a LGPD.
            </p>
          </Section>

          <Section title="5. Natureza do conteúdo">
            <p>
              O conteúdo e orientações disponibilizados no App não substituem
              acompanhamento sacramental, pastoral ou profissional de saúde
              quando aplicável. O uso é por sua conta e risco, no limite do
              razoável para um aplicativo de apoio espiritual.
            </p>
          </Section>

          <Section title="6. Conduta do usuário">
            <p>
              É proibido utilizar o App para fins ilícitos, ofensivos,
              discriminatórios, que violem direitos de terceiros ou que
              comprometam a segurança dos sistemas. Podemos suspender ou
              encerrar contas que violem estes Termos.
            </p>
          </Section>

          <Section title="7. Conteúdo do usuário">
            <p>
              Ao enviar textos, imagens ou outros materiais, você declara
              possuir direitos necessários e nos concede licença para hospedar,
              exibir e processar esse conteúdo para operação do App, observando a
              Política de Privacidade.
            </p>
          </Section>

          <Section title="8. Assinaturas e pagamentos">
            <p>
              Planos pagos, preços e formas de pagamento são informados no App.
              Cobranças recorrentes seguem as regras exibidas no momento da
              contratação. Cancelamentos e reembolsos observam a legislação
              aplicável e as condições informadas na contratação.
            </p>
          </Section>

          <Section title="9. Propriedade intelectual">
            <p>
              Marcas, layout e software do App são protegidos. É vedada cópia,
              engenharia reversa ou uso não autorizado, salvo permissão expressa.
            </p>
          </Section>

          <Section title="10. Limitação de responsabilidade">
            <p>
              Na máxima extensão permitida pela lei, não nos responsabilizamos
              por danos indiretos, lucros cessantes ou perdas decorrentes do uso
              ou impossibilidade de uso do App. O App é fornecido &ldquo;no
              estado em que se encontra&rdquo;.
            </p>
          </Section>

          <Section title="11. Modificações">
            <p>
              Podemos alterar estes Termos ou o App. Alterações relevantes podem
              ser comunicadas pelo App ou por outros meios razoáveis. O uso
              continuado após a vigência das alterações constitui aceitação.
            </p>
          </Section>

          <Section title="12. Lei e foro">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do
              Brasil. Fica eleito o foro da comarca de domicílio do consumidor,
              quando aplicável, ou outro determinado por lei imperativa.
            </p>
          </Section>

          <Section title="13. Contato">
            <p>
              Para dúvidas sobre estes Termos, utilize os canais indicados na{" "}
              <a
                href="/privacidade"
                className="text-burgundy-600 underline-offset-2 hover:underline"
              >
                Política de Privacidade
              </a>{" "}
              do App.
            </p>
          </Section>

          <div className="mt-10 border-t border-warm-300 pt-6">
            <p className="text-xs leading-relaxed text-gray-400">
              Este documento é um modelo informativo. Revise com assessoria
              jurídica para adequar ao seu negócio e às práticas reais de
              tratamento de dados.
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
