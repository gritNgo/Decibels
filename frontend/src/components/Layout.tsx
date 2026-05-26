import { AppShell, Group, Anchor, Menu, Button, Container, Text } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  // Mock authentication states — placeholders until connection to real JWT/Context storage
  const isAuthenticated = true; 
  const isAdmin = true; 
  const cartCount = 3; 

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
            {/* LOGO */}
            <Anchor component={Link} to="/" fw={700} size="xl" c="blue.5" style={{ textDecoration: 'none' }}>
              𝄞 Decibels
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
                <Button variant="light" color="red" size="xs">Logout</Button>
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