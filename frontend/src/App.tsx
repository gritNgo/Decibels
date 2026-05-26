import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import '@mantine/core/styles.css';

// Lightweight View Placeholders for validation testing
const HomeView = () => <div><h2>Catalog / Home View</h2><p>Products display grid placeholder.</p></div>;
const CartView = () => <div><h2>Your Shopping Cart</h2><p>Items persistency processing matrix boundary.</p></div>;
const OrdersView = () => <div><h2>Order Management</h2><p>Admin transactional processing interface.</p></div>;
const LoginView = () => <div><h2>Authentication Gate</h2><p>Secure login forms payload placeholder.</p></div>;

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          {/* Base Layout Route Wrapper */}
          <Route path="/" element={<Layout />}>
            {/* Indexed/Nested Child Routes */}
            <Route index element={<HomeView />} />
            <Route path="cart" element={<CartView />} />
            <Route path="orders" element={<OrdersView />} />
            <Route path="login" element={<LoginView />} />
            
            {/* Catch-all 404 fallback */}
            <Route path="*" element={<div><h2>404 - Resource Not Found</h2></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;