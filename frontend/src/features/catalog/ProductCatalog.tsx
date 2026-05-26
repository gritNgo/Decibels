import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog';
import type { Product } from '../../types';
import { SimpleGrid, Card, Image, Text, Badge, Button, Group, Loader, Alert, Stack, Title, Paper } from '@mantine/core';

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
        <Text size="lg" c="dimmed">Synchronizing live catalog data matrix...</Text>
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
    <Card p={0} radius="md" withBorder overflow-hidden>
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
        <Card p="md" radius="sm" bg="dark.6">
          <Text fw={600} size="sm">Assistance (AI Chatbot coming soon!)</Text>
          <Text size="xs" c="dimmed" mt="xs">Pre and post sales support at your complete disposal.</Text>
        </Card>
        <Card p="md" radius="sm" bg="dark.6">
          <Text fw={600} size="sm">Secure Payments</Text>
          <Text size="xs" c="dimmed" mt="xs">Pay safely via Link by Stripe or major standard credit cards.</Text>
        </Card>
        <Card p="md" radius="sm" bg="dark.6">
          <Text fw={600} size="sm">Insured Shipping</Text>
          <Text size="xs" c="dimmed" mt="xs">We ship via rapid express courier with full asset insurance coverage.</Text>
        </Card>
        <Card p="md" radius="sm" bg="dark.6">
          <Text fw={600} size="sm">Lowest Rates</Text>
          <Text size="xs" c="dimmed" mt="xs">We do our absolute best to keep operational shipping fees at a baseline minimal cost.</Text>
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
                <Button color="blue" radius="md" size="xs">
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