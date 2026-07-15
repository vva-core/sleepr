import {
  Payments,
  PaymentStatus as PrismaPaymentStatus,
} from '@app/common/prisma/generated/prisma';
import {
  CreatePaymentResponse,
  Payment,
  PaymentStatus,
} from '@app/common/types/proto/payments';
import type Stripe from 'stripe';

/**
 * Boundary mappers between:
 *  - Prisma storage types (`Payments`, `PrismaPaymentStatus`)
 *  - Stripe SDK types (`Stripe.PaymentIntent`)
 *  - Proto wire types (`Payment`, `PaymentStatus`, `CreatePaymentResponse`)
 *
 * Rule of thumb: nothing outside this file should reference two of those
 * three worlds at the same time. If a mapping is missing, add it here.
 */

/**
 * Exhaustive map of Prisma → proto payment status.
 * Using a `Record` (not a `switch`) so TypeScript will fail the build
 * the moment a new value is added to the Prisma enum but not to proto.
 */
const PRISMA_TO_PROTO_STATUS: Record<PrismaPaymentStatus, PaymentStatus> = {
  PENDING: PaymentStatus.PENDING,
  SUCCEEDED: PaymentStatus.SUCCEEDED,
  FAILED: PaymentStatus.FAILED,
  CANCELLED: PaymentStatus.CANCELLED,
};

/**
 * Stripe intent status → Prisma enum.
 * Stripe has more granular states than we model; collapse them intentionally.
 * See https://stripe.com/docs/payments/intents#intent-statuses
 */
const STRIPE_TO_PRISMA_STATUS: Record<
  Stripe.PaymentIntent.Status,
  PrismaPaymentStatus
> = {
  requires_payment_method: 'PENDING',
  requires_confirmation: 'PENDING',
  requires_action: 'PENDING',
  processing: 'PENDING',
  requires_capture: 'PENDING',
  succeeded: 'SUCCEEDED',
  canceled: 'CANCELLED',
};

export function toProtoPaymentStatus(
  status: PrismaPaymentStatus,
): PaymentStatus {
  return (
    PRISMA_TO_PROTO_STATUS[status] ?? PaymentStatus.PAYMENT_STATUS_UNSPECIFIED
  );
}

export function fromStripeStatus(
  status: Stripe.PaymentIntent.Status,
): PrismaPaymentStatus {
  return STRIPE_TO_PRISMA_STATUS[status] ?? 'FAILED';
}

/**
 * Prisma `Payments` row → proto `Payment`.
 * Single source of truth for the wire shape of a payment.
 */
export function toProtoPayment(row: Payments): Payment {
  return {
    id: row.id,
    reservationId: row.reservationId,
    amount: row.amount,
    status: toProtoPaymentStatus(row.status),
    createdAt: row.createdAt.toISOString(),
    stripePaymentIntentId: row.stripePaymentIntentId,
  };
}

/**
 * Convenience wrapper for the `CreatePayment` RPC: bundles the Stripe
 * `client_secret` with a mapped `Payment`. Throws if Stripe returned no
 * client secret — that would be a broken payment intent, not a mapping bug.
 */
export function toCreatePaymentResponse(
  row: Payments,
  clientSecret: string | null | undefined,
): CreatePaymentResponse {
  if (!clientSecret) {
    throw new Error('Stripe PaymentIntent did not return a client_secret');
  }
  return {
    clientSecret,
    payment: toProtoPayment(row),
  };
}
