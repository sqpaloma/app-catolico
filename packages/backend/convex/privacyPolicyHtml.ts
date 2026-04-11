/**
 * Public privacy policy HTML served at GET /privacy (Convex HTTP).
 * Replace bracketed placeholders before production; this is a template, not legal advice.
 */
export const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Política de Privacidade — SAFE</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 42rem; margin: 0 auto; padding: 1.5rem; background: #faf8f5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #8B1A1A; }
    h2 { font-size: 1.1rem; margin-top: 1.75rem; color: #333; }
    p, li { font-size: 0.95rem; color: #333; }
    ul { padding-left: 1.25rem; }
    .meta { font-size: 0.85rem; color: #666; margin-bottom: 1.5rem; }
    .note { font-size: 0.8rem; color: #666; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0d8d0; }
  </style>
</head>
<body>
  <h1>Política de Privacidade</h1>
  <p class="meta">Aplicativo SAFE — Vigência: [Data de vigência] — Última atualização: [Data da última atualização]</p>

  <p>
    Esta Política de Privacidade descreve como <strong>[Nome do responsável pelo tratamento]</strong>
    (“nós”, “nosso”) trata dados pessoais dos usuários do aplicativo SAFE (“App”), em conformidade com a
    Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
  </p>

  <h2>1. Controlador e contato</h2>
  <p>
    <strong>Controlador:</strong> [Nome do responsável pelo tratamento]<br />
    <strong>Endereço ou site:</strong> [Endereço ou site]<br />
    <strong>E-mail para exercício de direitos e dúvidas:</strong> [E-mail de contato]
  </p>

  <h2>2. Dados que podemos coletar</h2>
  <p>Dependendo de como você usa o App, podemos tratar, entre outros:</p>
  <ul>
    <li><strong>Dados de conta e autenticação:</strong> e-mail, nome, imagem de perfil e identificadores técnicos fornecidos pelo provedor de login (por exemplo, serviço de autenticação terceiro).</li>
    <li><strong>Dados de uso do App:</strong> conteúdos que você envia, como perguntas, mensagens no diário, respostas e interações com diretores espirituais, quando aplicável.</li>
    <li><strong>Dados de assinatura e pagamento:</strong> dados necessários para cobrança e gestão de planos (por exemplo, identificação de cliente e status de pagamento), tratados pelo processador de pagamentos.</li>
    <li><strong>Dados técnicos:</strong> logs, identificadores de dispositivo ou sessão e informações de diagnóstico para segurança, desempenho e prevenção a fraudes.</li>
  </ul>

  <h2>3. Finalidades e bases legais (LGPD)</h2>
  <p>Tratamos dados pessoais para:</p>
  <ul>
    <li>Prestação do serviço do App, criação e gestão de conta (execução de contrato e procedimentos preliminares);</li>
    <li>Comunicações relacionadas ao serviço, suporte e segurança (legítimo interesse e/ou execução de contrato);</li>
    <li>Processamento de pagamentos e assinaturas (execução de contrato e obrigação legal, quando couber);</li>
    <li>Melhoria da experiência, análises agregadas e cumprimento de obrigações legais.</li>
  </ul>
  <p>Quando exigido, solicitaremos consentimento de forma destacada para finalidades específicas.</p>

  <h2>4. Compartilhamento com terceiros</h2>
  <p>Podemos compartilhar dados com prestadores que nos auxiliam a operar o App, por exemplo:</p>
  <ul>
    <li>Provedor de autenticação e identidade de usuários;</li>
    <li>Infraestrutura e banco de dados em nuvem (hospedagem do backend);</li>
    <li>Processador de pagamentos e serviços financeiros correlatos;</li>
    <li>Ferramentas de análise ou suporte, quando utilizadas.</li>
  </ul>
  <p>
    Esses fornecedores tratam dados conforme contratos e instruções nossas, na medida necessária à prestação do serviço.
    Podemos ainda divulgar dados quando exigido por lei ou ordem judicial competente.
  </p>

  <h2>5. Transferência internacional</h2>
  <p>
    Alguns provedores podem estar localizados ou processar dados fora do Brasil. Quando houver transferência internacional,
    adotamos medidas compatíveis com a LGPD, conforme aplicável.
  </p>

  <h2>6. Retenção</h2>
  <p>
    Mantemos dados pelo tempo necessário para cumprir as finalidades descritas, resguardar direitos em disputas e cumprir
    obrigações legais. Critérios incluem natureza dos dados, necessidade contratual e prazos legais.
  </p>

  <h2>7. Segurança</h2>
  <p>
    Adotamos medidas técnicas e organizacionais razoáveis para proteger dados pessoais contra acessos não autorizados,
    perda ou alteração indevida. Nenhum sistema é totalmente isento de risco.
  </p>

  <h2>8. Direitos dos titulares</h2>
  <p>Você pode solicitar, conforme a LGPD:</p>
  <ul>
    <li>Confirmação de tratamento e acesso aos dados;</li>
    <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
    <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
    <li>Portabilidade, quando aplicável;</li>
    <li>Informação sobre compartilhamentos;</li>
    <li>Revogação de consentimento, quando o tratamento se basear nele;</li>
    <li>Oposição a tratamentos baseados em legítimo interesse, observados os limites legais.</li>
  </ul>
  <p>Para exercer seus direitos, entre em contato pelo e-mail indicado na seção 1.</p>

  <h2>9. Crianças e adolescentes</h2>
  <p>
    O App não se destina a menores de 16 anos sem consentimento legal adequado. Se você for responsável e acreditar que
    tratamos dados de menor sem base válida, contate-nos.
  </p>

  <h2>10. Cookies e tecnologias similares</h2>
  <p>
    Em versões web ou fluxos embutidos no navegador, podem ser usadas tecnologias como cookies ou armazenamento local
    para sessão, preferências e segurança. Você pode gerenciar cookies nas configurações do seu navegador.
  </p>

  <h2>11. Alterações</h2>
  <p>
    Podemos atualizar esta Política periodicamente. A data de vigência no topo será ajustada e, quando necessário,
    notificaremos por meios adequados (por exemplo, no App ou por e-mail).
  </p>

  <p class="note">
    Este documento é um modelo informativo. Revise com assessoria jurídica para adequar ao seu negócio e às práticas reais de tratamento de dados.
  </p>
</body>
</html>
`;
