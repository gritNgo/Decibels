import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProductCatalog } from './features/catalog/ProductCatalog'; 
import {ProductDetails} from './features/catalog/ProductDetails';
import {LoginView} from './features/auth/LoginView'
import '@mantine/core/styles.css';

const CartView = () => <div><h2>Your Shopping Cart</h2><p>Items persistency processing matrix boundary.</p></div>;
const OrdersView = () => <div><h2>Order Management</h2><p>Admin transactional processing interface.</p></div>;

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ProductCatalog />} />
              <Route path="product/:id" element={<ProductDetails />} /> {/* REGISTER THE DYNAMIC EXTENSION URL PARAMETER ROUTE */}

              <Route path="cart" element={<CartView />} />
              <Route path="orders" element={<OrdersView />} />
              <Route path="login" element={<LoginView />} />
              <Route path="*" element={<div><h2>404 - Resource Not Found</h2></div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;