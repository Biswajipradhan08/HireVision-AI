import axios from 'axios';
import { PaymentOrder } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CASHFREE_API_URL = 'https://api.cashfree.com/pg';
const PAYMENT_ORDERS_KEY = 'hirevision_payment_orders';

/**
 * Payment Service
 * Handles Cashfree payment integration and order management
 * 
 * Note: To use this in production:
 * 1. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY in environment variables
 * 2. Use Cashfree's server-side SDK for secure payment verification
 */
export const paymentService = {
  /**
   * Get Cashfree credentials from environment
   */
  getCredentials() {
    return {
      appId: import.meta.env.VITE_CASHFREE_APP_ID || '',
      secretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY || ''
    };
  },

  /**
   * Create a payment order
   * In production, this should be called from your backend
   */
  async createPaymentOrder(
    customerId: string,
    amount: number,
    plan: 'premium' = 'premium'
  ): Promise<PaymentOrder> {
    const orderId = `order_${Date.now()}_${uuidv4().slice(0, 8)}`;
    
    const paymentOrder: PaymentOrder = {
      orderId,
      customerId,
      amount,
      currency: 'INR',
      plan,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
    };

    // Store order locally (in production, store on backend)
    const orders = await this.getPaymentOrders();
    orders.push(paymentOrder);
    localStorage.setItem(PAYMENT_ORDERS_KEY, JSON.stringify(orders));

    console.log('[Cashfree] Payment order created:', paymentOrder);
    
    return paymentOrder;
  },

  /**
   * Initiate Cashfree payment
   * This returns the payment session object to initiate payment
   */
  async initiatePayment(order: PaymentOrder): Promise<any> {
    try {
      const creds = this.getCredentials();
      
      if (!creds.appId || !creds.secretKey) {
        throw new Error('Cashfree credentials not configured. Set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY');
      }

      // In production, this call should come from your backend
      // Here we're showing the structure for client-side integration
      const response = await axios.post(
        `${CASHFREE_API_URL}/orders`,
        {
          order_id: order.orderId,
          order_amount: order.amount,
          order_currency: order.currency,
          customer_id: order.customerId,
          order_note: `Premium subscription - ${order.plan}`,
          customer_phone: '', // Would be set in actual implementation
          customer_email: '', // Would be set in actual implementation
          return_url: `${window.location.origin}/#/payment-success`,
          notify_url: 'https://your-backend-url.com/api/payment-webhook' // Configure your backend webhook
        },
        {
          headers: {
            'x-api-version': '2021-05-21',
            'x-client-id': creds.appId,
            'x-client-secret': creds.secretKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('[Cashfree] Payment initiation failed:', error);
      throw error;
    }
  },

  /**
   * Verify payment status
   * In production, verify with backend using Cashfree webhook signature
   */
  async verifyPayment(orderId: string, paymentId: string): Promise<boolean> {
    try {
      const creds = this.getCredentials();
      
      if (!creds.appId || !creds.secretKey) {
        console.error('Cashfree credentials not configured');
        return false;
      }

      // In production, verify with Cashfree API through your backend
      const response = await axios.get(
        `${CASHFREE_API_URL}/orders/${orderId}/payments/${paymentId}`,
        {
          headers: {
            'x-api-version': '2021-05-21',
            'x-client-id': creds.appId,
            'x-client-secret': creds.secretKey
          }
        }
      );

      return response.data?.cf_payment_status === 'SUCCESS';
    } catch (error) {
      console.error('[Cashfree] Payment verification failed:', error);
      return false;
    }
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, status: 'success' | 'failed'): Promise<void> {
    const orders = await this.getPaymentOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      localStorage.setItem(PAYMENT_ORDERS_KEY, JSON.stringify(orders));
    }
  },

  /**
   * Get payment orders
   */
  async getPaymentOrders(): Promise<PaymentOrder[]> {
    const data = localStorage.getItem(PAYMENT_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Get subscription pricing
   */
  getPremiumPlanPrice(): number {
    return 299; // ₹299 for 30 days, or customize as needed
  },

  /**
   * Get premium plan duration in days
   */
  getPremiumPlanDuration(): number {
    return 30;
  }
};
