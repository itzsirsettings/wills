export type OrderStatus = 'pending' | 'paid' | 'failed';

export type NotificationStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'not_configured';

export interface OrderItemRecord {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerRecord {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
}

export interface NotificationState {
  email: NotificationStatus;
  sms: NotificationStatus;
}

export interface OrderRecord {
  reference: string;
  receiptTokenHash: string;
  amount: number;
  amountInKobo: number;
  currency: 'NGN';
  status: OrderStatus;
  customer: CustomerRecord;
  items: OrderItemRecord[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  paymentChannel?: string;
  paystackTransactionId?: string;
  deliveryMessage: string;
  notificationStatus: NotificationState;
}

export interface PaystackTransactionData {
  id: number;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
  gateway_response?: string;
  metadata?: unknown;
}
