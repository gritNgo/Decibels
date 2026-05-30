import { AppShell, Group, Anchor, Button, Container, Text, Divider } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
// Global reactive state hooks
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
        main: { background: 'var(--mantine-color-dark-8)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }
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
                  height: '40px',             
                  width: 'auto',              
                  display: 'block',
                  filter: 'invert(1) brightness(1.5)', 
                  transition: 'transform 0.2s ease'       
                }} 
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Anchor>

            {/* NAV NAVIGATION LINKS */}
            <Group gap="sm">
              <Anchor component={Link} to="/" c="dimmed" size="sm">Home</Anchor>
              
              {isAuthenticated && (
                <Anchor 
                  component={Link} 
                  to={isAdmin ? "/admin/orders" : "/orders"} 
                  c="dimmed" 
                  size="sm"
                  visibleFrom="sm" 
                >
                  {isAdmin ? "Order Management" : "My Orders"}
                </Anchor>
              )}
              
              {isAdmin && (
                <Anchor 
                  component={Link} 
                  to="/admin/products" 
                  c="dimmed" 
                  size="sm"
                  visibleFrom="sm" 
                >
                  Product Management
                </Anchor>
              )}

              {isAuthenticated && (
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
                <Button component={Link} to="/login" variant="light" size="xs">Login</Button>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* CORE VIEWPORT LAYER */}
      <AppShell.Main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Container size="lg" py="xl" style={{ flex: 1, width: '100%' }}>
          {/* Outlet is the dynamic zone where nested child route pages render */}
          <Outlet />
        </Container>

       {/* PERSISTENT FOOTER */}
        <Container size="lg" w="100%" mt="auto" pt="xl" pb="md">
          <Divider my="sm" color="gray.8" />
          <Group justify="space-between" wrap="nowrap">
            
            {/* Left Spacer - Kept visible everywhere to anchor true horizontal centering */}
            <Group style={{ flex: 1 }} justify="flex-start">
              <Text size="xs" style={{ visibility: 'hidden', width: '56px' }}>Spacer</Text>
            </Group>
            
            {/* Middle Text Element - Dead Center */}
            <Text size="xs" c="dimmed" ta="center" style={{ flex: 1, whiteSpace: 'nowrap' }}>
              © {new Date().getFullYear()} Decibels
            </Text>
            
            {/* Right Social Icons */}
            <Group gap="md" wrap="nowrap" justify="flex-end" style={{ flex: 1 }}>
              <Anchor 
                href="https://github.com/gritNgo/Decibels" 
                target="_blank" 
                rel="noopener noreferrer" 
                c="dimmed"
                style={{ display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-4)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <IconBrandGithub size={20} stroke={1.5} />
              </Anchor>

              <Anchor 
                href="https://www.linkedin.com/in/fiorenso-wattalage-fernando/" 
                target="_blank" 
                rel="noopener noreferrer" 
                c="dimmed"
                style={{ display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-4)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <IconBrandLinkedin size={20} stroke={1.5} />
              </Anchor>
            </Group>

          </Group>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}