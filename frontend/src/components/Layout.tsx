import { AppShell, Group, Anchor, Menu, Button, Container} from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
 // live reactive hook invocation
const { isAuthenticated, isAdmin, logout } = useAuth();
const cartCount = 0; // placehoplder until mount of operational state machine bucket 

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        main: { background: 'var(--mantine-color-dark-8)' }
      }}
    >
      {/* HEADER SECTION (Equivalent to <header> in _Layout.cshtml) */}
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
              
              {/* ADMIN ROLE GUARDED DROPDOWN (Equivalent to @if (User.IsInRole(StaticDetails.Role_Admin))) */}
              {isAdmin && (
                <>
                  <Anchor component={Link} to="/orders" c="dimmed" size="sm">Order Management</Anchor>
                  
                  <Menu shadow="md" width={200} trigger="hover" openDelay={100} closeDelay={400}>
                    <Menu.Target>
                      <Anchor href="#" c="dimmed" size="sm">Content Management ▼</Anchor>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item component={Link} to="/admin/categories">Category</Menu.Item>
                      <Menu.Item component={Link} to="/admin/products">Product</Menu.Item>
                      <Menu.Item component={Link} to="/admin/companies">Company</Menu.Item>
                      <Menu.Divider />
                      <Menu.Item component={Link} to="/register">Create User</Menu.Item>
                      <Menu.Item component={Link} to="/admin/users">Manage Users</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}

              {/* SHOPPING CART (Equivalent to @await Component.InvokeAsync("ShoppingCart")) */}
              <Anchor component={Link} to="/cart" c="dimmed" size="sm">
                Cart ({cartCount})
              </Anchor>
            </Group>

            {/* LOGIN / IDENTITY ACTIONS (Equivalent to <partial name="_LoginPartial" />) */}
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

      {/* CORE VIEWPORT LAYER (Equivalent to @RenderBody()) */}
      <AppShell.Main>
        <Container size="lg" py="xl">
          {/* Outlet is the dynamic zone where nested child route pages render */}
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}