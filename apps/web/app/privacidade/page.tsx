import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Política de Privacidade — SAFE",
  description:
    "Política de Privacidade do aplicativo SAFE, em conformidade com a LGPD.",
};

export default function PrivacyPolicyPage() {
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
            Política de Privacidade
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Aplicativo SAFE — Última atualização: [Data da última atualização]
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto -mt-6 max-w-3xl px-6 pb-20">
        <article className="rounded-2xl border border-warm-300/50 bg-white p-8 shadow-lg sm:p-12">
          <p className="leading-relaxed text-gray-600">
            Esta Política de Privacidade descreve como{" "}
            <strong className="text-gray-900">
              [Nome do responsável pelo tratamento]
            </strong>{" "}
            (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo;) trata dados pessoais dos
            usuários do aplicativo SAFE (&ldquo;App&rdquo;), em conformidade com
            a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <Section title="1. Controlador e contato">
            <p>
              <strong>Controlador:</strong> [Nome do responsável pelo
              tratamento]
              <br />
              <strong>Endereço ou site:</strong> [Endereço ou site]
              <br />
              <strong>E-mail para exercício de direitos e dúvidas:</strong>{" "}
              [E-mail de contato]
            </p>
          </Section>

          <Section title="2. Dados que podemos coletar">
            <p>
              Dependendo de como você usa o App, podemos tratar, entre outros:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Dados de conta e autenticação:</strong> e-mail, nome,
                imagem de perfil e identificadores técnicos fornecidos pelo
                provedor de login.
              </li>
              <li>
                <strong>Dados de uso do App:</strong> conteúdos que você envia,
                como perguntas, mensagens no diário, respostas e interações com
                diretores espirituais.
              </li>
              <li>
                <strong>Dados de assinatura e pagamento:</strong> dados
                necessários para cobrança e gestão de planos, tratados pelo
                processador de pagamentos.
              </li>
              <li>
                <strong>Dados técnicos:</strong> logs, identificadores de
                dispositivo ou sessão e informações de diagnóstico.
              </li>
            </ul>
          </Section>

          <Section title="3. Finalidades e bases legais (LGPD)">
            <p>Tratamos dados pessoais para:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Prestação do serviço do App, criação e gestão de conta (execução
                de contrato e procedimentos preliminares);
              </li>
              <li>
                Comunicações relacionadas ao serviço, suporte e segurança
                (legítimo interesse e/ou execução de contrato);
              </li>
              <li>
                Processamento de pagamentos e assinaturas (execução de contrato
                e obrigação legal);
              </li>
              <li>
                Melhoria da experiência, análises agregadas e cumprimento de
                obrigações legais.
              </li>
            </ul>
            <p className="mt-3">
              Quando exigido, solicitaremos consentimento de forma destacada para
              finalidades específicas.
            </p>
          </Section>

          <Section title="4. Compartilhamento com terceiros">
            <p>
              Podemos compartilhar dados com prestadores que nos auxiliam a
              operar o App, por exemplo:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provedor de autenticação e identidade de usuários;</li>
              <li>
                Infraestrutura e banco de dados em nuvem (hospedagem do
                backend);
              </li>
              <li>
                Processador de pagamentos e serviços financeiros correlatos;
              </li>
              <li>Ferramentas de análise ou suporte, quando utilizadas.</li>
            </ul>
            <p className="mt-3">
              Esses fornecedores tratam dados conforme contratos e instruções
              nossas, na medida necessária à prestação do serviço. Podemos ainda
              divulgar dados quando exigido por lei ou ordem judicial competente.
            </p>
          </Section>

          <Section title="5. Transferência internacional">
            <p>
              Alguns provedores podem estar localizados ou processar dados fora
              do Brasil. Quando houver transferência internacional, adotamos
              medidas compatíveis com a LGPD, conforme aplicável.
            </p>
          </Section>

          <Section title="6. Retenção">
            <p>
              Mantemos dados pelo tempo necessário para cumprir as finalidades
              descritas, resguardar direitos em disputas e cumprir obrigações
              legais. Critérios incluem natureza dos dados, necessidade
              contratual e prazos legais.
            </p>
          </Section>

          <Section title="7. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais razoáveis para
              proteger dados pessoais contra acessos não autorizados, perda ou
              alteração indevida. Nenhum sistema é totalmente isento de risco.
            </p>
          </Section>

          <Section title="8. Direitos dos titulares">
            <p>Você pode solicitar, conforme a LGPD:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Confirmação de tratamento e acesso aos dados;</li>
              <li>
                Correção de dados incompletos, inexatos ou desatualizados;
              </li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários ou
                tratados em desconformidade;
              </li>
              <li>Portabilidade, quando aplicável;</li>
              <li>Informação sobre compartilhamentos;</li>
              <li>
                Revogação de consentimento, quando o tratamento se basear nele;
              </li>
              <li>
                Oposição a tratamentos baseados em legítimo interesse, observados
                os limites legais.
              </li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato pelo e-mail indicado
              na seção 1.
            </p>
          </Section>

          <Section title="9. Crianças e adolescentes">
            <p>
              O App não se destina a menores de 16 anos sem consentimento legal
              adequado. Se você for responsável e acreditar que tratamos dados de
              menor sem base válida, contate-nos.
            </p>
          </Section>

          <Section title="10. Cookies e tecnologias similares">
            <p>
              Em versões web ou fluxos embutidos no navegador, podem ser usadas
              tecnologias como cookies ou armazenamento local para sessão,
              preferências e segurança. Você pode gerenciar cookies nas
              configurações do seu navegador.
            </p>
          </Section>

          <Section title="11. Alterações">
            <p>
              Podemos atualizar esta Política periodicamente. A data de vigência
              no topo será ajustada e, quando necessário, notificaremos por meios
              adequados (por exemplo, no App ou por e-mail).
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
