import { Resend } from 'resend';
import twilio from 'twilio';
import type { NotificationStatus, OrderRecord } from './types.js';

interface NotificationSendResult {
  email: NotificationStatus;
  sms: NotificationStatus;
}

interface ClaimedNotifications {
  email: boolean;
  sms: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const storeName = process.env.STORE_NAME?.trim() || 'Store Support';
const supportEmail = process.env.STORE_SUPPORT_EMAIL?.trim() || '';
const supportPhone = process.env.STORE_SUPPORT_PHONE?.trim() || '';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatOrderItems(order: OrderRecord) {
  return order.items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;">${escapeHtml(item.name)} x ${item.quantity} - ${currencyFormatter.format(
          item.price * item.quantity,
        )}</li>`,
    )
    .join('');
}

function buildEmailHtml(order: OrderRecord) {
  const safeFullName = escapeHtml(order.customer.fullName);
  const safeReference = escapeHtml(order.reference);
  const safeAddress = escapeHtml(order.customer.address);
  const safeCity = escapeHtml(order.customer.city);
  const safeState = escapeHtml(order.customer.state);
  const safePaymentChannel = escapeHtml(order.paymentChannel || 'Paystack checkout');
  const safeSupportEmail = escapeHtml(supportEmail);
  const safeSupportPhone = escapeHtml(supportPhone);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:640px;margin:0 auto;padding:24px;">
      <p style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7c2d12;margin-bottom:8px;">
        Payment Confirmed
      </p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">Thank you for your order, ${safeFullName}.</h1>
      <p style="margin:0 0 12px;">
        Your payment for order <strong>${safeReference}</strong> has been processed successfully.
      </p>
      <p style="margin:0 0 24px;">
        Your goods will be delivered to you now that your payment has been confirmed.
      </p>

      <div style="background:#faf5f2;border:1px solid #ead7ce;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;"><strong>Total paid:</strong> ${currencyFormatter.format(order.amount)}</p>
        <p style="margin:0 0 8px;"><strong>Delivery address:</strong> ${safeAddress}, ${safeCity}, ${safeState}</p>
        <p style="margin:0;"><strong>Payment channel:</strong> ${safePaymentChannel}</p>
      </div>

      <h2 style="font-size:18px;margin:0 0 12px;">Order summary</h2>
      <ul style="padding-left:20px;margin:0 0 24px;">
        ${formatOrderItems(order)}
      </ul>

      <p style="margin:0 0 8px;">If you need help, reply to this email or contact us at ${safeSupportEmail}.</p>
      <p style="margin:0;">You can also reach us on ${safeSupportPhone}.</p>
    </div>
  `;
}

function buildEmailText(order: OrderRecord) {
  const itemSummary = order.items
    .map(
      (item) =>
        `- ${item.name} x ${item.quantity}: ${currencyFormatter.format(
          item.price * item.quantity,
        )}`,
    )
    .join('\n');

  return [
    `Thank you for your order, ${order.customer.fullName}.`,
    '',
    `Your payment for order ${order.reference} has been processed successfully.`,
    'Your goods will be delivered to you now that your payment has been confirmed.',
    '',
    `Total paid: ${currencyFormatter.format(order.amount)}`,
    `Delivery address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}`,
    `Payment channel: ${order.paymentChannel || 'Paystack checkout'}`,
    '',
    'Order summary:',
    itemSummary,
    '',
    `Need help? Contact ${supportEmail} or ${supportPhone}.`,
  ].join('\n');
}

function buildSmsText(order: OrderRecord) {
  return `${storeName}: Your payment for order ${order.reference} has been processed successfully. Total paid: ${currencyFormatter.format(
    order.amount,
  )}. Your goods will be delivered to you now that your payment has been confirmed. Need help? ${supportPhone}`;
}

async function sendEmailConfirmation(order: OrderRecord): Promise<NotificationStatus> {
  const senderEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resendClient || !senderEmail || !senderEmail.includes('@')) {
    console.warn('Email confirmation skipped: RESEND_API_KEY or valid RESEND_FROM_EMAIL not configured.');
    return 'not_configured';
  }

  try {
    const { error } = await resendClient.emails.send({
      from: senderEmail,
      to: order.customer.email,
      subject: `${storeName} payment confirmation - ${order.reference}`,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
    });

    if (error) {
      console.error(JSON.stringify({ event: 'email_provider_rejected' }));
      return 'failed';
    }

    return 'sent';
  } catch {
    console.error(JSON.stringify({ event: 'email_confirmation_failed' }));
    return 'failed';
  }
}

async function sendSmsConfirmation(order: OrderRecord): Promise<NotificationStatus> {
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!twilioClient || !fromNumber) {
    return 'not_configured';
  }

  try {
    await twilioClient.messages.create({
      body: buildSmsText(order),
      from: fromNumber,
      to: order.customer.phone,
    });

    return 'sent';
  } catch {
    console.error(JSON.stringify({ event: 'sms_confirmation_failed' }));
    return 'failed';
  }
}

export async function sendOrderNotifications(
  order: OrderRecord,
  claimed: ClaimedNotifications,
): Promise<NotificationSendResult> {
  const email = claimed.email
    ? await sendEmailConfirmation(order)
    : order.notificationStatus.email;

  const sms = claimed.sms
    ? await sendSmsConfirmation(order)
    : order.notificationStatus.sms;

  return { email, sms };
}
