import { subscriberRepository } from '../repositories/subscriberRepository.js';

/**
 * Service de Domínio para gerenciamento de assinaturas da newsletter.
 * Aplica validação de formato, normalização e idempotência.
 */
export const subscriberService = {
  /**
   * Expressão regular padrão para validação de e-mail
   */
  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

  /**
   * Registra um novo assinante de forma segura
   * @param {string} rawEmail
   * @returns {Promise<object>}
   */
  async subscribe(rawEmail) {
    if (!rawEmail || typeof rawEmail !== 'string') {
      return {
        success: false,
        statusCode: 400,
        error: 'O endereço de e-mail é obrigatório.'
      };
    }

    const email = rawEmail.trim().toLowerCase();

    if (!this.EMAIL_REGEX.test(email)) {
      return {
        success: false,
        statusCode: 400,
        error: 'Por favor, informe um endereço de e-mail válido.'
      };
    }

    const result = await subscriberRepository.save(email);

    return {
      success: true,
      statusCode: 200,
      alreadySubscribed: result.alreadySubscribed,
      message: result.alreadySubscribed
        ? 'Você já está a bordo! Seu e-mail já está registrado para receber os drops diários.'
        : '🚀 Inscrição confirmada com sucesso! Você receberá os novos exoplanetas e pôsteres A4 a cada drop.'
    };
  },

  /**
   * Retorna a contagem total de assinantes
   * @returns {Promise<number>}
   */
  async getSubscribersCount() {
    return await subscriberRepository.count();
  }
};
