// src/interfaces/sms/sms-provider.interface.ts
export interface SMSProviderResponse {
  success: boolean;
  provider: string;
  messageId: string;
  timestamp: string;
  status: string;
  details: {
    to: string;
    message: string;
    providerResponse: any;
    [key: string]: any;
  };
}

export interface SMSOptions {
  priority?: 'high' | 'normal' | 'low';
  senderId?: string;
  [key: string]: any;
}

export abstract class SMSProviderInterface {
  /**
   * Envia uma mensagem SMS
   * @param to - Número de telefone do destinatário (formato E.164)
   * @param message - Conteúdo da mensagem
   * @param options - Opções adicionais
   * @returns - Resposta do provedor
   */
  abstract send(to: string, message: string, options?: SMSOptions): Promise<SMSProviderResponse>;

  /**
   * Verifica o status de uma mensagem enviada
   * @param messageId - ID da mensagem no provedor
   * @returns - Status da mensagem
   */
  abstract getStatus(messageId: string): Promise<any>;

  /**
   * Verifica se o provedor está operacional
   * @returns - Status do provedor
   */
  abstract checkHealth(): Promise<boolean>;
}
