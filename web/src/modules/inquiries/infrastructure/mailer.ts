import nodemailer, { type Transporter } from 'nodemailer'

/**
 * SMTP settings come from the environment only (never the database, never Git):
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE ("true" for port 465),
 *   SMTP_USER, SMTP_PASSWORD, MAIL_FROM, MAIL_TO (where form notifications go).
 * Until SMTP_HOST and MAIL_FROM are set, nothing is sent: emails wait in the outbox.
 */
type Env = Record<string, string | undefined>

export function smtpConfigured(env: Env = process.env): boolean {
  return Boolean(env.SMTP_HOST?.trim() && env.MAIL_FROM?.trim())
}

export function notificationRecipients(env: Env = process.env): string | null {
  const to =
    env.MAIL_TO?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  return to.length ? to.join(', ') : null
}

let transporter: Transporter | null = null

function getTransporter(env: Env = process.env): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_SECURE === 'true',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? '' } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  })
  return transporter
}

export interface OutgoingEmail {
  to: string
  subject: string
  text: string
  replyTo?: string
}

export async function sendEmail(email: OutgoingEmail, env: Env = process.env): Promise<void> {
  await getTransporter(env).sendMail({
    from: env.MAIL_FROM,
    to: email.to,
    subject: email.subject,
    text: email.text,
    replyTo: email.replyTo,
  })
}
