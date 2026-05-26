import type { Product, ShoppingCart } from '../types'; 

const API_URL = import.meta.env.VITE_API_URL;

  export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  isAuthSuccessful: boolean;
  token: string;
  email: string;
  role: string;
  errorMessage: string;
}

export const catalogApi = {
  /**
   * Retrieves all verified items from the public home catalog endpoint
   */
  getProducts: async (signal?: AbortSignal): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/api/home`, { signal });
    
    if (!response.ok) {
      throw new Error(`Catalog data request failed with status: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Retrieves a single product detail wrapper for layout initialization
   */
  getProductDetails: async (productId: number, signal?: AbortSignal): Promise<ShoppingCart> => {
    const response = await fetch(`${API_URL}/api/home/details/${productId}`, { signal });
    
    if (!response.ok) {
      throw new Error(`Product detail request failed with status: ${response.status}`);
    }
    
    return response.json();
  }, 


/**
   * Dispatches login parameters to the stateless authentication gateway
   */
// Update the login execution client method block inside catalogApi:
login: async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    body: JSON.stringify(payload)
  });

  const data: AuthResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.errorMessage || 'Authentication handshake rejected.');
  }
  return data;
}
};