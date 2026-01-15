import { isToday, isTomorrow, parse } from "date-fns";

/**
 * Formata número de telefone para o padrão do WhatsApp API
 * Remove caracteres especiais e adiciona código do Brasil se necessário
 */
export function formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }

    return cleaned;
}

/**
 * Gera a URL do WhatsApp API com a mensagem pré-preenchida
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Abre o WhatsApp com a mensagem pré-preenchida
 */
export function sendWhatsAppMessage(phone: string, message: string): void {
    const url = generateWhatsAppUrl(phone, message);
    window.open(url, '_blank');
}

/**
 * Gera mensagem de confirmação de agendamento
 */
export function generateConfirmationMessage(
    clientName: string,
    date: string,
    time: string,
    serviceName: string,
    professionalName: string,
    salonName?: string
): string {
    return `Olá ${clientName}! ✅

Seu agendamento foi *CONFIRMADO*:
📅 Data: ${date}
⏰ Horário: ${time}
💇 Serviço: ${serviceName}
👤 Profissional: ${professionalName}
${salonName ? `\n${salonName}` : ''}`;
}

/**
 * Gera mensagem de cancelamento de agendamento
 */
export function generateCancellationMessage(
    clientName: string,
    date: string,
    time: string,
    serviceName: string,
    salonName?: string
): string {
    return `Olá ${clientName}!

Infelizmente seu agendamento foi *CANCELADO*:
📅 Data: ${date}
⏰ Horário: ${time}
💇 Serviço: ${serviceName}

Entre em contato para reagendar.
${salonName ? `\n${salonName}` : ''}`;
}

/**
 * Gera mensagem de lembrete de agendamento
 */
export function generateReminderMessage(
    clientName: string,
    date: string,
    time: string,
    serviceName: string,
    professionalName: string,
    salonName?: string
): string {
    const parsedDate = parse(date, "dd/MM/yyyy", new Date());
    let timeText = `para o dia ${date}`;

    if (isToday(parsedDate)) {
        timeText = "para *HOJE*";
    } else if (isTomorrow(parsedDate)) {
        timeText = "para *AMANHÃ*";
    }

    return `Olá ${clientName}! 📅

Lembrete do seu agendamento ${timeText}:
📅 Data: ${date}
⏰ Horário: ${time}
💇 Serviço: ${serviceName}
👤 Profissional: ${professionalName}

Esperamos você! 😊
${salonName ? `\n${salonName}` : ''}`;
}
