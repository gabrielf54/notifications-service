// src/interfaces/email/email-provider.interface.ts
export interface EmailContent {
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailProviderResponse {
  success: boolean;
  provider: string;
  messageId: string;
  timestamp: string;
  status: string;
  details: {
    to: string;
    subject: string;
    providerResponse: any;
    [key: string]: any;
  };
}

export interface EmailOptions {
  priority?: 'high' | 'normal' | 'low';
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  [key: string]: any;
}

export abstract class EmailProviderInterface {
  /**
   * Envia um e-mail
   * @param to - Endereço de e-mail do destinatário
   * @param content - Conteúdo do e-mail
   * @param options - Opções adicionais
   * @returns - Resposta do provedor
   */
  abstract send(to: string, content: EmailContent, options?: EmailOptions): Promise<EmailProviderResponse>;

  /**
   * Verifica o status de um e-mail enviado
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
