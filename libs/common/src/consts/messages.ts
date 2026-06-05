/**
 * Message and event pattern names used across microservices.
 *
 * - `*_MESSAGES` are request/response patterns used with `@MessagePattern`
 *   and `ClientProxy.send()`.
 * - `*_EVENTS` are fire-and-forget patterns used with `@EventPattern`
 *   and `ClientProxy.emit()` / publishers.
 */

export const AUTH_MESSAGES = {
  AUTHENTICATE: 'authenticate',
} as const;

export const PAYMENTS_MESSAGES = {
  CREATE: 'create-payment',
  CONFIRM: 'confirm-payment',
} as const;

export const PAYMENTS_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
} as const;

export const NOTIFICATIONS_EVENTS = {
  NOTIFY_EMAIL: 'notify-email',
} as const;
