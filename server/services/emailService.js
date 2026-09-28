import { Resend } from 'resend';
import { config } from '../config/index.js';

let resendClient = null;

function getResendClient() {
  if (!resendClient && config.resendApiKey) {
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
}

/**
 * Service responsável pelo envio de e-mails transacionais (boas-vindas e alertas de drops)
 * Utiliza o Resend API para garantir entrega direta na Caixa Principal (Primary Inbox).
 * Formatação no estilo "Tyler Vigen / Carta Pessoal" para evitar filtros de spam/promoções.
 */
export const emailService = {
  /**
   * Verifica se o serviço de e-mail está configurado com API Key
   */
  isConfigured() {
    return !!config.resendApiKey;
  },

  /**
   * Dispara o e-mail de confirmação de inscrição e boas-vindas
   * @param {string} recipientEmail
   * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
   */
  async sendWelcomeEmail(recipientEmail) {
    if (!recipientEmail) return { success: false, error: 'E-mail do destinatário não informado.' };

    const client = getResendClient();
    if (!client) {
      console.warn(`⚠️ [EMAIL SERVICE] RESEND_API_KEY não configurada. E-mail de boas-vindas para ${recipientEmail} não disparado.`);
      return { success: false, error: 'Chave RESEND_API_KEY não configurada no servidor.' };
    }

    const fromAddress = config.emailFrom || 'Exoplanetas Extremos <onboarding@resend.dev>';
    const appUrl = config.appBaseUrl || 'https://exoplanets.luckhaosbb.dev';

    const subject = '🪐 Inscrição Confirmada • Bem-vindo ao Observatório de Exoplanetas Extremos';

    const textContent = `
🪐 OBSERVATÓRIO DE EXOPLANETAS EXTREMOS

Sua inscrição foi confirmada com sucesso!

Olá,

Você agora está oficialmente registrado para receber as transmissões diárias do Exoplanetas Extremos.

A cada 24 horas (exatamente à meia-noite), nosso observatório cataloga um novo mundo hostil no universo observável — ambientes extremos com ventos supersônicos de vidro a 7.000 km/h, tempestades de ferro fundido ou oceanos de magma perpétuo.

O que você receberá:
• Uma notificação curta e direta no instante em que o novo planeta for liberado;
• Acesso à telemetria orbital física e simulação 3D em monitor retrô;
• Acesso exclusivo ao Pôster Vintage A4 (300 DPI) com certificado criptográfico de autenticidade (HMAC-SHA256) antes que a janela de 24 horas se encerre.

Nós respeitamos seu tempo: sem newsletters intermináveis, sem spam e sem marketing. Apenas astronomia, ciência e arte gráfica colecionável.

Acesse o mundo de hoje:
${appUrl}

Um abraço cósmico,
Lucas Gomes
Desenvolvedor & Criador • Exoplanetas Extremos
github.com/luckhaosbb

---
Caso deseje cancelar sua inscrição a qualquer momento, basta responder diretamente a esta mensagem.
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscrição Confirmada • Exoplanetas Extremos</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06080d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #06080d; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #0d111a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 35px 30px; text-align: left;">
          <tr>
            <td>
              <div style="font-size: 32px; margin-bottom: 12px;">🪐</div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px;">OBSERVATÓRIO DE EXOPLANETAS EXTREMOS</div>
              <h1 style="margin: 0 0 18px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Sua inscrição foi confirmada com sucesso</h1>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                Olá! Você agora está oficialmente conectado ao radar astronômico do <strong>Exoplanetas Extremos</strong>.
              </p>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                A cada 24 horas (exatamente à meia-noite), o observatório cataloga um novo mundo hostil no universo observável — ambientes com ventos supersônicos de vidro a 7.000 km/h, chuva de ferro incandescente ou oceanos de magma perpétuo.
              </p>

              <div style="background-color: rgba(56, 189, 248, 0.05); border-left: 3px solid #38bdf8; border-radius: 4px; padding: 16px 18px; margin: 22px 0;">
                <strong style="color: #38bdf8; font-size: 14px; display: block; margin-bottom: 8px;">O que você receberá:</strong>
                <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                  <li style="margin-bottom: 6px;">Alerta curto e direto sempre que um novo planeta for catalogado;</li>
                  <li style="margin-bottom: 6px;">Acesso à telemetria orbital e simulação física 3D em monitor retrô;</li>
                  <li>Download do <strong>Pôster Colecionável A4 (300 DPI)</strong> com certificado criptográfico oficial (HMAC-SHA256) antes do fechamento diário.</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                Nós respeitamos seu tempo: sem newsletters intermináveis, sem spam e sem marketing. Apenas astronomia, astrofísica e arte gráfica colecionável.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="border-radius: 8px; background-color: #38bdf8;">
                    <a href="${appUrl}" target="_blank" style="font-size: 15px; font-weight: 700; color: #06080d; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                      Explorar Planeta do Dia &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 30px 0 20px 0;" />

              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #ffffff;">
                Lucas Gomes
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">
                Desenvolvedor &bull; github.com/luckhaosbb
              </p>

              <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                Você recebeu este e-mail porque solicitou alertas diários no site exoplanets.luckhaosbb.dev. Caso deseje cancelar sua inscrição a qualquer momento, responda diretamente a esta mensagem.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    try {
      const response = await client.emails.send({
        from: fromAddress,
        to: [recipientEmail],
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`📧 [EMAIL SERVICE] E-mail de boas-vindas enviado com sucesso para ${recipientEmail}! (ID: ${response.data?.id})`);
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.error(`❌ [EMAIL SERVICE] Erro ao disparar e-mail de boas-vindas para ${recipientEmail}:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Dispara o alerta diário de novo exoplaneta para todos os assinantes
   * @param {Array<{ email: string }>} subscribers
   * @param {object} planet
   * @returns {Promise<{ totalSent: number, failed: number }>}
   */
  async sendDailyDropAlert(subscribers, planet) {
    if (!subscribers || subscribers.length === 0 || !planet) {
      return { totalSent: 0, failed: 0 };
    }

    const client = getResendClient();
    if (!client) {
      console.warn(`⚠️ [EMAIL SERVICE] RESEND_API_KEY não configurada. Alerta diário não disparado.`);
      return { totalSent: 0, failed: subscribers.length };
    }

    const fromAddress = config.emailFrom || 'Exoplanetas Extremos <onboarding@resend.dev>';
    const appUrl = config.appBaseUrl || 'https://exoplanets.luckhaosbb.dev';

    const planetName = planet.name || 'Exoplaneta Extremo';
    const planetTitle = planet.comicHeroTitle || planet.title || 'MUNDO HOSTIL CATALOGADO';
    const dangerScore = planet.dangerLevel ? `${planet.dangerLevel.toFixed(1)} / 10` : '10.0 / 10';
    const tempDisplay = planet.tempC ? `${planet.tempC.toLocaleString('pt-BR')} °C` : '--';
    const survivalTime = planet.survivalTime || 'Morte instantânea';

    const subject = `🪐 Novo Mundo Catalogado: ${planetName} — ${planetTitle}`;

    const textContent = `
🪐 NOVO EXOPLANETA REVELADO • DROP DE HOJE

Exoplaneta: ${planetName}
Classificação: ${planetTitle}
Nível de Perigo: ${dangerScore}
Temperatura Estimada: ${tempDisplay}
Sobrevivência Humana: ${survivalTime}

O Observatório de Exoplanetas Extremos acaba de liberar a telemetria do dia.
O pôster oficial de colecionador A4 (300 DPI) com assinatura criptográfica oficial (HMAC-SHA256) está disponível para emissão e download pelas próximas 24 horas.

Acesse a telemetria 3D e garanta seu pôster:
${appUrl}#poster

Um abraço cósmico,
Lucas Gomes • Exoplanetas Extremos
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Exoplaneta Catalogado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06080d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #06080d; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #0d111a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 35px 30px; text-align: left;">
          <tr>
            <td>
              <div style="font-size: 28px; margin-bottom: 12px;">🪐</div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px;">DROP DIÁRIO • OBSERVATÓRIO</div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff;">${planetName}</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #f59e0b; font-weight: 600;">${planetTitle}</p>
              
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin-bottom: 22px;">
                <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
                  <tr>
                    <td style="color: #64748b;">Nível de Hostilidade:</td>
                    <td style="color: #ef4444; font-weight: 700; text-align: right;">💀 ${dangerScore}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">Temperatura Superficial:</td>
                    <td style="color: #cbd5e1; font-weight: 600; text-align: right;">${tempDisplay}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">Sobrevivência Humana:</td>
                    <td style="color: #cbd5e1; font-weight: 600; text-align: right;">${survivalTime}</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                A transmissão já está disponível no monitor retrô 3D. O pôster de colecionador correspondente foi liberado com tiragem numerada e certificado HMAC-SHA256 nos metadados.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="border-radius: 8px; background-color: #38bdf8;">
                    <a href="${appUrl}#poster" target="_blank" style="font-size: 15px; font-weight: 700; color: #06080d; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                      Ver Telemetria & Pôster &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 30px 0 20px 0;" />

              <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                Você recebe este alerta porque assinou a lista do observatório. Para cancelar sua inscrição a qualquer momento, responda diretamente a esta mensagem.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    let totalSent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const email = typeof sub === 'string' ? sub : sub.email;
      if (!email) continue;

      try {
        await client.emails.send({
          from: fromAddress,
          to: [email],
          subject,
          text: textContent,
          html: htmlContent
        });
        totalSent++;
      } catch (err) {
        console.error(`❌ [EMAIL SERVICE] Falha ao enviar drop diário para ${email}:`, err.message);
        failed++;
      }
    }

    console.log(`🚀 [EMAIL SERVICE] Broadcast do drop diário concluído: ${totalSent} enviados, ${failed} falhas.`);
    return { totalSent, failed };
  }
};
