import { AppShell, Group, Anchor, Button, Container } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
// Global eactive state hooks
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

export function Layout() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart(); // Destructure live reactive counter state

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        main: { background: 'var(--mantine-color-dark-8)' }
      }}
    >
      {/* HEADER SECTION */}
      <AppShell.Header px="md">
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%">            
            <Anchor component={Link} to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/images/logo.png" 
                alt="Decibels Logo" 
                style={{ 
                 height: '40px',             // Restricts vertical scaling to stay inside the 60px nav bar
                width: 'auto',              // Auto-calculates horizontal aspect ratio dynamically
                display: 'block',
                filter: 'invert(1) brightness(1.5)', // Inverts black text to white/light-silver for dark mode parity
                transition: 'transform 0.2s ease'    // Smooth micro-interaction transition hint   
                }} 
              // hover effect
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Anchor>

            {/* NAV NAVIGATION LINKS */}
            <Group gap="md">
              <Anchor component={Link} to="/" c="dimmed" size="sm">Home</Anchor>
              
              {/* Unified Navigation: Role-based isolation */}
              {isAuthenticated && (
                <Anchor 
                  component={Link} 
                  to={isAdmin ? "/admin/orders" : "/orders"} 
                  c="dimmed" 
                  size="sm"
                >
                  {isAdmin ? "Order Management" : "My Orders"}
                </Anchor>
              )}
              
              {/* Streamlined, Scope-Compliant Admin Dropdown */}
              {isAdmin && (
              <Anchor 
                component={Link} 
                to="/admin/products" 
                c="dimmed" 
                size="sm"
              >
                Product Management
              </Anchor>
            )}

              {/* Hide shopping cart entirely for administrative user sessions */}
              {!isAdmin && (
                <Anchor component={Link} to="/cart" c="dimmed" size="sm">
                  Cart ({cartCount})
                </Anchor>
              )}
            </Group>

            {/* LOGIN / IDENTITY ACTIONS */}
            <Group gap="sm">
              {isAuthenticated ? (
                <Button variant="light" color="red" size="xs" onClick={logout}>Logout</Button>
              ) : (
                <>
                  <Button component={Link} to="/login" variant="light" size="xs">Login</Button>
                  <Button component={Link} to="/register" variant="filled" size="xs">Register</Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* CORE VIEWPORT LAYER */}
      <AppShell.Main>
        <Container size="lg" py="xl">
          {/* Outlet is the dynamic zone where nested child route pages render */}
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}