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

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  category?: Category;
  imageUrl?: string;
}

// ---------------------------------------------------------
// ADMINISTRATIVE MANAGEMENT CONTROL SCHEMAS
// ---------------------------------------------------------

export interface ProductUpsertDTO {
  id?: number;          // Populated during edit passes, missing during fresh creates
  name: string;
  description: string;
  price: number;
  categoryId: string;   // Kept as string for Mantine's <Select> data keys
  imageFile: File | null; // Captures the binary file handle from the HTML input layer
}

export interface ShoppingCart {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  applicationUserId?: string;
  price: number;
}

// ---------------------------------------------------------
// IDENTITY & ORDER TRANSACTION DOMAIN DATA LAYOUTS
// ---------------------------------------------------------

export interface ApplicationUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface OrderHeader {
  id: number;
  applicationUserId: string;
  applicationUser?: ApplicationUser;
  orderDate: string;
  shippingDate?: string;
  orderTotal: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentDate?: string;
  paymentDueDate?: string;
  sessionId?: string;
  paymentIntentId?: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  name: string;
  courier?: string;
  trackingNumber?: string;
}

export interface OrderDetail {
  id: number;
  orderHeaderId: number;
  productId: number;
  product: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface OrderVM {
  orderHeader: OrderHeader;
  orderDetail: OrderDetail[];
}

export interface OrderSubmissionPayload {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

