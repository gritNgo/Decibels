export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string; // Optional because string? can be null
  price: number;        // Covers decimal(8,2)
  categoryId: number;
  category?: Category;  // Nested relational navigation object
  imageUrl?: string;
}

export interface ShoppingCart {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  applicationUserId?: string;
  price: number; // Populated client-side or calculated on screen
}