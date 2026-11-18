export {
  countCustomerInquiries,
  exportInquiries,
  INQUIRY_STATUSES,
  listCustomerInquiries,
  listInquiries,
  notificationEmail,
  setInquiryStatus,
  submitInquiry,
  unlinkCustomerInquiries,
  type InquiryStatus,
} from './application/inquiries'
export {
  ACCOUNT_EMAIL,
  BACKOFF_MS,
  listOutbox,
  MAX_ATTEMPTS,
  nextAttemptDelay,
  processOutbox,
  queueEmail,
  redactTokens,
  type QueuedEmail,
  retryOutbox,
  startOutboxWorker,
} from './application/outbox'
export { notificationRecipients, smtpConfigured } from './infrastructure/mailer'
