import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { ProductCatalog } from './features/catalog/ProductCatalog'; 
import {ProductDetails} from './features/catalog/ProductDetails';
import {LoginView} from './features/auth/LoginView'
import { CartView } from './features/cart/CartView';
import { SummaryView } from './features/cart/SummaryView';
import { OrderConfirmationView } from './features/cart/OrderConfirmationView';
import { OrderManagementIndex } from './features/admin/OrderManagementIndex';
import { OrderManagementDetails } from './features/admin/OrderManagementDetails';
import { CustomerOrdersView } from './features/orders/CustomerOrdersView';
import { CustomerOrderDetailsView } from './features/orders/CustomerOrderDetailsView';
import { ProductManagementForm } from './features/admin/ProductManagementForm';
import { AdminProductIndex } from './features/admin/AdminProductIndex';
import { AdminCategoryIndex } from './features/admin/AdminCategoryIndex';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AuthProvider>
        <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="login" element={<LoginView />} />
              <Route index element={<ProductCatalog />} />
              <Route path="product/:id" element={<ProductDetails />} /> 
              <Route path="cart" element={<CartView />} />
              <Route path="/summary" element={<SummaryView />} />
              <Route path="/orders" element={<CustomerOrdersView />} />
              <Route path="/orders/:id" element={<CustomerOrderDetailsView />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmationView />} />
              <Route path="/admin/orders" element={<OrderManagementIndex />} />
              <Route path="/admin/orders/:id" element={<OrderManagementDetails />} />
              <Route path="/admin/products" element={<AdminProductIndex />} />
              <Route path="/admin/categories" element={<AdminCategoryIndex />} />
<Route path="/admin/products/create" element={<ProductManagementForm />} />
<Route path="/admin/products/edit/:id" element={<ProductManagementForm />} />
              <Route path="*" element={<div><h2>404 - Resource Not Found</h2></div>} />
            </Route>
          </Routes>
        </BrowserRouter>
          </CartProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;