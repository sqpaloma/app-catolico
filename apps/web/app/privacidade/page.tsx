import type { Metadata } from "next";
import {
  LEGAL_EMAIL,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Política de Privacidade — SAFE",
  description:
    "Política de Privacidade do aplicativo SAFE, em conformidade com a LGPD.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Política de Privacidade"
      subtitle="Aplicativo SAFE — Última atualização: Maio 2026"
    >
      <p className="leading-relaxed text-gray-600">
        Esta Política de Privacidade descreve como{" "}
        <strong className="text-gray-900">Safe Espiritual</strong> (&ldquo;nós&rdquo;,
        &ldquo;nosso&rdquo;) trata dados pessoais dos usuários do aplicativo SAFE
        (&ldquo;App&rdquo;), em conformidade com a Lei Geral de Proteção de Dados
        (Lei nº 13.709/2018 — LGPD).
      </p>

      <LegalSection title="1. Controlador e contato">
        <p>
          <strong>Controlador:</strong> Safe Espiritual
          <br />
          <strong>Site:</strong>{" "}
          <a
            href="https://www.safecatholic.app"
            className="text-burgundy-600 underline-offset-2 hover:underline"
          >
            www.safecatholic.app
          </a>
          <br />
          <strong>E-mail para exercício de direitos e dúvidas:</strong>{" "}
          {LEGAL_EMAIL}
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que podemos coletar">
        <p>
          Dependendo de como você usa o App, podemos tratar, entre outros:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Dados de conta e autenticação:</strong> e-mail, nome, imagem
            de perfil e identificadores técnicos fornecidos pelo provedor de
            login.
          </li>
          <li>
            <strong>Dados de perfil e personalização:</strong> informações
            fornecidas voluntariamente durante o cadastro, como sexo, faixa
            etária e preferências pessoais. Esses dados são utilizados
            exclusivamente para personalizar orientações e conteúdos oferecidos a
            você no App.
          </li>
          <li>
            <strong>Dados de uso do App:</strong> conteúdos que você envia, como
            perguntas, mensagens no diário, respostas e interações com diretores
            espirituais.
          </li>
          <li>
            <strong>Dados de assinatura e pagamento:</strong> dados necessários
            para cobrança e gestão de planos, tratados pelo processador de
            pagamentos.
          </li>
          <li>
            <strong>Dados técnicos:</strong> logs, identificadores de dispositivo
            ou sessão e informações de diagnóstico.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalidades e bases legais (LGPD)">
        <p>Tratamos dados pessoais para:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Prestação do serviço do App, criação e gestão de conta (execução de
            contrato e procedimentos preliminares);
          </li>
          <li>
            Personalização da experiência, utilizando dados de perfil informados
            no cadastro para adequar orientações e conteúdos ao seu contexto
            pessoal (consentimento e/ou legítimo interesse);
          </li>
          <li>
            Comunicações relacionadas ao serviço, suporte e segurança (legítimo
            interesse e/ou execução de contrato);
          </li>
          <li>
            Processamento de pagamentos e assinaturas (execução de contrato e
            obrigação legal);
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
      </LegalSection>

      <LegalSection title="4. Compartilhamento com terceiros">
        <p>
          Podemos compartilhar dados com prestadores que nos auxiliam a operar o
          App, por exemplo:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Provedor de autenticação e identidade de usuários;</li>
          <li>
            Infraestrutura e banco de dados em nuvem (hospedagem do backend);
          </li>
          <li>
            Processador de pagamentos e serviços financeiros correlatos;
          </li>
          <li>Ferramentas de análise ou suporte, quando utilizadas.</li>
        </ul>
        <p className="mt-3">
          Esses fornecedores tratam dados conforme contratos e instruções nossas,
          na medida necessária à prestação do serviço. Podemos ainda divulgar
          dados quando exigido por lei ou ordem judicial competente.
        </p>
      </LegalSection>

      <LegalSection title="5. Transferência internacional">
        <p>
          Alguns provedores podem estar localizados ou processar dados fora do
          Brasil. Quando houver transferência internacional, adotamos medidas
          compatíveis com a LGPD, conforme aplicável.
        </p>
      </LegalSection>

      <LegalSection title="6. Retenção">
        <p>
          Mantemos dados pelo tempo necessário para cumprir as finalidades
          descritas, resguardar direitos em disputas e cumprir obrigações legais.
          Critérios incluem natureza dos dados, necessidade contratual e prazos
          legais.
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança">
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger
          dados pessoais contra acessos não autorizados, perda ou alteração
          indevida. Nenhum sistema é totalmente isento de risco.
        </p>
      </LegalSection>

      <LegalSection title="8. Direitos dos titulares">
        <p>Você pode solicitar, conforme a LGPD:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Confirmação de tratamento e acesso aos dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
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
            Oposição a tratamentos baseados em legítimo interesse, observados os
            limites legais.
          </li>
        </ul>
        <p className="mt-3">
          Para exercer seus direitos, entre em contato pelo e-mail indicado na
          seção 1.
        </p>
      </LegalSection>

      <LegalSection title="9. Crianças e adolescentes">
        <p>
          O App não se destina a menores de 16 anos sem consentimento legal
          adequado. Se você for responsável e acreditar que tratamos dados de
          menor sem base válida, contate-nos.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies e tecnologias similares">
        <p>
          Em versões web ou fluxos embutidos no navegador, podem ser usadas
          tecnologias como cookies ou armazenamento local para sessão,
          preferências e segurança. Você pode gerenciar cookies nas configurações
          do seu navegador.
        </p>
      </LegalSection>

      <LegalSection title="11. Alterações">
        <p>
          Podemos atualizar esta Política periodicamente. A data de vigência no
          topo será ajustada e, quando necessário, notificaremos por meios
          adequados (por exemplo, no App ou por e-mail).
        </p>
      </LegalSection>

      <div className="mt-10 border-t border-warm-300 pt-6">
        <p className="text-xs leading-relaxed text-gray-400">
          Em caso de dúvidas, entre em contato pelo e-mail indicado na seção 1.
        </p>
      </div>
    </LegalPageShell>
  );
}
