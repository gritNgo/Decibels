import type { Product, Category, BaseApiResponse, ShoppingCart, ProductUpsertDTO } from '../types'; 

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

// Private helper to instantly grab JWT session telemetry
async function getSessionToken(): Promise<string> {
  const storedUser = localStorage.getItem('decibels_session');
  if (!storedUser) throw new Error('Authentication trace missing.');
  const session = JSON.parse(storedUser);
  return session.token;
}

export const catalogApi = {
  // =========================================================
  // PUBLIC / CUSTOMER ENDPOINTS
  // =========================================================
  
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
  },

  // =========================================================
  // SECURE ADMINISTRATIVE ENDPOINTS
  // =========================================================

  /**
   * Fetch all base products for the admin grid configuration management console
   */
  getAdminProducts: async (signal?: AbortSignal): Promise<Product[]> => {
    const token = await getSessionToken();
    const response = await fetch(`${API_URL}/api/product`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal
    });
    if (!response.ok) throw new Error('Failed to retrieve inventory data.');
    return response.json();
  },

  /**
   * Fetch structural lookup categories to bind inside select controls
   */
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    const token = await getSessionToken();
    const response = await fetch(`${API_URL}/api/category`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal
    });
    if (!response.ok) throw new Error('Failed to synchronize lookup definitions.');
    return response.json();
  },

  /**
   * Dispatches a multi-part form envelope containing metadata and a raw 
   * binary stream directly into the Azure Blob asset engine pipeline
   */
  upsertProduct: async (dto: ProductUpsertDTO): Promise<BaseApiResponse> => {
    const token = await getSessionToken();
    const formData = new FormData();

    if (dto.id) formData.append('id', dto.id.toString());
    formData.append('name', dto.name);
    formData.append('description', dto.description);
    formData.append('price', dto.price.toString());
    formData.append('categoryId', dto.categoryId);

    if (dto.imageFile) {
      formData.append('file', dto.imageFile); // Maps directly to 'IFormFile file' in C#
    }

    const response = await fetch(`${API_URL}/api/product/upsert`, {
      method: 'POST',
      headers: {
        // Leave Content-Type as browser attaches multi-part boundaries automatically
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Transactional product update constraint failed.');
    }

    return response.json();
  },

  /**
   * Purges a product record from SQL Server registry and invokes cloud asset deletion
   */
  deleteProduct: async (id: number): Promise<BaseApiResponse> => {
    const token = await getSessionToken();
    const response = await fetch(`${API_URL}/api/product/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to strike item context from database registry.');
    return response.json();
  }
};