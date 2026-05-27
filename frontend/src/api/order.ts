import type { 
  OrderSubmissionPayload, 
  BaseApiResponse, 
  OrderHeader, 
  OrderVM 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(): HeadersInit {
  const storedUser = localStorage.getItem('decibels_session');
  if (!storedUser) throw new Error('Unauthenticated operational access context violation.');
  const session = JSON.parse(storedUser);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`
  };
}

export const orderApi = {
  /**
   * Dispatches the final checkout payload to generate a Stripe session or process delayed payments
   */
  submitOrder: async (payload: OrderSubmissionPayload): Promise<{ requiresPayment: boolean; checkoutUrl?: string; orderId: number }> => {
    const response = await fetch(`${API_URL}/api/cart/summary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Order transaction validation fault.');
    return response.json();
  },

  /**
   * Verifies payment completion after Stripe webhook/redirect loops complete
   */
  verifyPayment: async (orderId: number): Promise<BaseApiResponse & { status?: string }> => {
    const response = await fetch(`${API_URL}/api/cart/verify/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Payment token authorization verification failed.');
    return response.json();
  },

  /**
   * Fetches the system orders index collection using filter queries (all, pending, inprocess, completed)
   */
  getOrders: async (status: string): Promise<OrderHeader[]> => {
    const response = await fetch(`${API_URL}/api/order?status=${status}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to extract order history arrays.');
    return response.json();
  },

  /**
   * Assembles a comprehensive details relational graph for a specific individual transaction order boundary index
   */
  getOrderDetails: async (orderId: number): Promise<OrderVM> => {
    const response = await fetch(`${API_URL}/api/order/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to resolve target order details graph.');
    return response.json();
  },

  /**
   * Pushes manual data tracking payload adjustments over structural logistic headers
   */
  updateOrderDetails: async (payload: OrderHeader): Promise<BaseApiResponse & { data?: OrderHeader }> => {
    const response = await fetch(`${API_URL}/api/order/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Logistical property update mutation abort.');
    return response.json();
  },

  /**
   * Transitions target process state machine bounds forward into processing configurations
   */
  startProcessing: async (orderId: number): Promise<BaseApiResponse> => {
    const response = await fetch(`${API_URL}/api/order/start-processing/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('State transition loop execution fault.');
    return response.json();
  },

  /**
   * Finalizes tracking details and marks shipment allocations completed
   */
  shipOrder: async (payload: { id: number; trackingNumber: string; courier: string }): Promise<BaseApiResponse> => {
    const response = await fetch(`${API_URL}/api/order/ship`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Logistical delivery validation abort.');
    return response.json();
  },

  /**
   * Triggers cancellation loops and issues full merchant refunds over processed Stripe payment charges
   */
  cancelOrder: async (orderId: number): Promise<BaseApiResponse> => {
    const response = await fetch(`${API_URL}/api/order/cancel/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Financial processor reversal abort loop.');
    return response.json();
  }
};