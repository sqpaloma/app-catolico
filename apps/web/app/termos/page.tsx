import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Termos de Uso — SAFE",
  description: "Termos de Uso do aplicativo SAFE.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPageShell
      title="Termos de Uso"
      subtitle="Aplicativo SAFE — Última atualização: Maio 2026"
    >
      <LegalSection title="1. Aceitação">
        <p>
          Ao criar uma conta ou utilizar o aplicativo SAFE (&ldquo;App&rdquo;),
          você declara ter lido e concordado com estes Termos de Uso e com a
          Política de Privacidade. Se não concordar, não utilize o App.
        </p>
      </LegalSection>

      <LegalSection title="2. Descrição do serviço">
        <p>
          O App oferece um ambiente digital para apoio à vida espiritual,
          incluindo recursos como direção espiritual, diário, perguntas e
          interação com diretores, conforme disponibilizado em cada versão.
          Funcionalidades podem exigir cadastro ou assinatura.
        </p>
      </LegalSection>

      <LegalSection title="3. Elegibilidade e conta">
        <p>
          Você deve fornecer informações verdadeiras e manter sua conta segura.
          Você é responsável por todas as atividades realizadas com seu acesso.
          Notifique-nos imediatamente em caso de uso não autorizado.
        </p>
      </LegalSection>

      <LegalSection title="4. Coleta e uso de dados para personalização">
        <p>
          Durante o cadastro, podemos solicitar informações como sexo, faixa
          etária e outros dados de perfil. Esses dados são utilizados
          exclusivamente para personalizar sua experiência no App, oferecendo
          orientações e conteúdos mais adequados ao seu perfil. O tratamento
          desses dados segue nossa Política de Privacidade e a LGPD.
        </p>
      </LegalSection>

      <LegalSection title="5. Natureza do conteúdo">
        <p>
          O conteúdo e orientações disponibilizados no App não substituem
          acompanhamento sacramental, pastoral ou profissional de saúde quando
          aplicável. O uso é por sua conta e risco, no limite do razoável para um
          aplicativo de apoio espiritual.
        </p>
      </LegalSection>

      <LegalSection title="6. Conduta do usuário">
        <p>
          É proibido utilizar o App para fins ilícitos, ofensivos,
          discriminatórios, que violem direitos de terceiros ou que comprometam a
          segurança dos sistemas. Podemos suspender ou encerrar contas que violem
          estes Termos.
        </p>
      </LegalSection>

      <LegalSection title="7. Conteúdo do usuário">
        <p>
          Ao enviar textos, imagens ou outros materiais, você declara possuir
          direitos necessários e nos concede licença para hospedar, exibir e
          processar esse conteúdo para operação do App, observando a Política de
          Privacidade.
        </p>
      </LegalSection>

      <LegalSection title="8. Assinaturas e pagamentos">
        <p>
          Planos pagos, preços e formas de pagamento são informados no App.
          Cobranças recorrentes seguem as regras exibidas no momento da
          contratação. Cancelamentos e reembolsos observam a legislação aplicável
          e as condições informadas na contratação.
        </p>
      </LegalSection>

      <LegalSection title="9. Propriedade intelectual">
        <p>
          Marcas, layout e software do App são protegidos. É vedada cópia,
          engenharia reversa ou uso não autorizado, salvo permissão expressa.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida pela lei, não nos responsabilizamos por
          danos indiretos, lucros cessantes ou perdas decorrentes do uso ou
          impossibilidade de uso do App. O App é fornecido &ldquo;no estado em
          que se encontra&rdquo;.
        </p>
      </LegalSection>

      <LegalSection title="11. Modificações">
        <p>
          Podemos alterar estes Termos ou o App. Alterações relevantes podem ser
          comunicadas pelo App ou por outros meios razoáveis. O uso continuado
          após a vigência das alterações constitui aceitação.
        </p>
      </LegalSection>

      <LegalSection title="12. Lei e foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil.
          Fica eleito o foro da comarca de domicílio do consumidor, quando
          aplicável, ou outro determinado por lei imperativa.
        </p>
      </LegalSection>

      <LegalSection title="13. Contato">
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
      </LegalSection>

      <div className="mt-10 border-t border-warm-300 pt-6">
        <p className="text-xs leading-relaxed text-gray-400">
          Em caso de dúvidas, entre em contato pelos canais indicados na Política
          de Privacidade.
        </p>
      </div>
    </LegalPageShell>
  );
}
