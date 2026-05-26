import type { Product, ShoppingCart } from '../types'; 

const API_URL = import.meta.env.VITE_API_URL;

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
  }
};