import type { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export interface ShoppingCartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  applicationUserId: string;
  price: number;
}

export interface OrderHeader {
  id: number;
  orderTotal: number;
  name?: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface ShoppingCartVM {
  shoppingCartList: ShoppingCartItem[];
  orderHeader: OrderHeader;
}

// Reusable helper to safely extract token credentials context
const getAuthHeaders = () => {
  const storedUser = localStorage.getItem('decibels_session');
  if (!storedUser) throw new Error('Unauthenticated operational access context violation.');
  
  const { token } = JSON.parse(storedUser);
  return {
    'Content-Type': 'application/json',
    'accept': '*/*',
    'Authorization': `Bearer ${token}` 
  };
};

export const cartApi = {
  /**
   * Retrieves the current user's persistent database shopping cart graph wrapper
   */
  getCart: async (): Promise<ShoppingCartVM> => {
    const response = await fetch(`${API_URL}/api/cart`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to resolve active shopping cart records.');
    return response.json();
  },

  /**
   * Increments item allocation quantity threshold rows
   */
  plusItem: async (cartId: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/api/cart/plus/${cartId}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to increment shopping row quantity.');
    return response.json();
  },

  /**
   * Decrements or purges an allocated database row record
   */
  minusItem: async (cartId: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/api/cart/minus/${cartId}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to decrement shopping row quantity.');
    return response.json();
  },

  /**
   * Drops a specific shopping cart item record row out of the system context completely
   */
  removeItem: async (cartId: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/api/cart/remove/${cartId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to purge item record context.');
    return response.json();
  }
};