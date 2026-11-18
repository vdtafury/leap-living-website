export {
  exportInquiries,
  INQUIRY_STATUSES,
  listInquiries,
  notificationEmail,
  setInquiryStatus,
  submitInquiry,
  type InquiryStatus,
} from './application/inquiries'
export {
  BACKOFF_MS,
  listOutbox,
  MAX_ATTEMPTS,
  nextAttemptDelay,
  processOutbox,
  retryOutbox,
  startOutboxWorker,
} from './application/outbox'
export { notificationRecipients, smtpConfigured } from './infrastructure/mailer'
