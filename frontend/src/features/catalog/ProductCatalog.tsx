import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog';
import type { Product } from '../../types';
import { Link } from 'react-router-dom';
import { SimpleGrid, Card, Image, Text, Badge, Button, Group, Loader, Alert, Stack, Title, Paper } from '@mantine/core';
import {   IconMessageCode,   IconWallet,   IconPackage,   IconTruck } from '@tabler/icons-react';

type FetchState = 
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; message: string };

export function ProductCatalog() {
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    catalogApi.getProducts(controller.signal)
      .then((data) => {
        setState({ status: 'success', data });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setState({ status: 'error', message: err.message || 'Failed to sync catalog.' });
        }
      });

    return () => controller.abort();
  }, []);

  if (state.status === 'loading') {
    return (
      <Group justify="center" py="xl">
        <Loader size="xl" type="bars" />
        <Text size="lg" c="dimmed">Loading...</Text>
      </Group>
    );
  }

  if (state.status === 'error') {
    return (
      <Alert title="Data Sync Failure" color="red" variant="filled" my="xl">
        {state.message}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* FULL-WIDTH UI HERO BANNER (Replaces @section FullWidthBanner) */}
    <Card p={0} radius="md" withBorder style={{ overflow: 'hidden' }}>
      <Image
        src="/images/banner.png" // Points directly to public/images/banner.png
        alt="Welcome to Decibels Banner"
        fit="contain"
        w="100%"
        h="auto"
        fallbackSrc="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop"
      />
    </Card>
      {/* BRAND VALUES INTRO HERO BLOCK */}
      <Paper p="xl" radius="md" bg="dark.7" style={{ textAlign: 'center' }}>
        <Title order={2} fw={700}>Not your average-Joe musical instruments store!</Title>
        <Text size="md" c="dimmed" mt="xs" max-w={700} style={{ margin: '0 auto' }}>
          Decibels is a real music business started by musicians for musicians, and is home to instruments used by your favorite Rockers!
        </Text>
      </Paper>

      {/* MARKETING VALUE BUCKETS */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
  <Card p="md" radius="md" bg="dark.6" withBorder>
    <Group gap="sm" mb="xs">
      <IconMessageCode size={24} color="var(--mantine-color-blue-4)" />
      <Text fw={600} size="sm">Assistance</Text>
    </Group>
    <Text size="xs" c="dimmed">
      Pre and post sales support at your complete disposal. If there's a problem, you're sure we'll solve it. (AI chatbot coming soon!)
    </Text>
  </Card>

  <Card p="md" radius="md" bg="dark.6" withBorder>
    <Group gap="sm" mb="xs">
      <IconWallet size={24} color="var(--mantine-color-green-4)" />
      <Text fw={600} size="sm">Payment</Text>
    </Group>
    <Text size="xs" c="dimmed">
      You can pay for your order using Link (by Stripe) or a major credit card (Visa, Mastercard, Amex, Discover, Diners Club, JCB).
    </Text>
  </Card>

  <Card p="md" radius="md" bg="dark.6" withBorder>
    <Group gap="sm" mb="xs">
      <IconPackage size={24} color="var(--mantine-color-orange-4)" />
      <Text fw={600} size="sm">Shipping Cost</Text>
    </Group>
    <Text size="xs" c="dimmed">
      Although we can't offer free shipping, we do our best to keep them at the lowest possible, while maintaining excellent service!
    </Text>
  </Card>

  <Card p="md" radius="md" bg="dark.6" withBorder>
    <Group gap="sm" mb="xs">
      <IconTruck size={24} color="var(--mantine-color-cyan-4)" />
      <Text fw={600} size="sm">Shipping Speed</Text>
    </Group>
    <Text size="xs" c="dimmed">
      We ship to most EU countries by express courier and delivery within 36/48h. All shipments are fully insured.
    </Text>
  </Card>
</SimpleGrid>

      {/* DYNAMIC DATABASE PRODUCTS VIEW GRID */}
      <Title order={3} c="blue.4" fw={600} mt="lg">Featured Products</Title>
      
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        {state.data.map((product) => (
          <Card key={product.id} shadow="sm" padding="md" radius="md" withBorder style={{ display: 'flex', flexDirection: 'column' }}>
            <Card.Section>
              <Image
                src={product.imageUrl}
                height={160}
                alt={product.name}
                fallbackSrc="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop"
              />
            </Card.Section>

            <Stack justify="space-between" mt="md" style={{ flexGrow: 1 }} gap="xs">
              <div>
                <Text fw={600} size="sm" style={{ textTransform: 'uppercase' }}>{product.name}</Text>
                <Badge color="blue" variant="light" size="xs" mt="xs">
                  {product.category?.name || 'Instrument'}
                </Badge>
              </div>

              <Group justify="space-between" align="center" mt="md">
                <Text size="lg" fw={700} c="green.4">
                  €{product.price.toFixed(2)}
                </Text>
                <Button 
                  component={Link} 
                  to={`/product/${product.id}`} 
                  color="blue" 
                  radius="md" 
                  size="xs"
                >
                  Details
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}