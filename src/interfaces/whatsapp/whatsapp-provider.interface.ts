// src/interfaces/whatsapp/whatsapp-provider.interface.ts
export interface WhatsAppProviderResponse {
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

export interface WhatsAppOptions {
  priority?: 'high' | 'normal' | 'low';
  templateName?: string;
  templateParams?: Record<string, string>;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  [key: string]: any;
}

export abstract class WhatsAppProviderInterface {
  /**
   * Envia uma mensagem WhatsApp
   * @param to - Número de telefone do destinatário (formato E.164)
   * @param message - Conteúdo da mensagem
   * @param options - Opções adicionais
   * @returns - Resposta do provedor
   */
  abstract send(to: string, message: string, options?: WhatsAppOptions): Promise<WhatsAppProviderResponse>;

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
