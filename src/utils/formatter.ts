// src/utils/formatter.ts
/**
 * Formata um número de telefone para o padrão E.164
 * @param phoneNumber - Número de telefone a ser formatado
 * @returns Número de telefone formatado
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Se não começar com +, adiciona o prefixo internacional
  if (!phoneNumber.startsWith('+')) {
    // Verifica se já tem o código do país (assumindo Brasil como padrão)
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Formata um endereço de e-mail
 * @param email - Endereço de e-mail a ser formatado
 * @returns Endereço de e-mail formatado
 */
export function formatEmail(email: string): string {
  // Remove espaços em branco
  return email.trim().toLowerCase();
}

/**
 * Formata uma data para o formato ISO
 * @param date - Data a ser formatada
 * @returns Data formatada
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Verifica se um horário está dentro de um intervalo permitido
 * @param currentTime - Horário atual (formato HH:MM)
 * @param startTime - Horário de início (formato HH:MM)
 * @param endTime - Horário de fim (formato HH:MM)
 * @returns Verdadeiro se estiver dentro do intervalo
 */
export function isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
  const current = parseTimeToMinutes(currentTime);
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  
  return current >= start && current <= end;
}

/**
 * Converte um horário no formato HH:MM para minutos
 * @param time - Horário no formato HH:MM
 * @returns Total de minutos
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
