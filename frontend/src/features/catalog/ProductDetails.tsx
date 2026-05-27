import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import { cartApi } from '../../api/cart';
import type { ShoppingCart } from '../../types';
import { 
  Container, 
  Grid, 
  Image, 
  Title, 
  Text, 
  Badge, 
  Button, 
  NumberInput, 
  Group, 
  Loader, 
  Alert, 
  Stack, 
  Paper, 
  Divider,
  ActionIcon
} from '@mantine/core';
import { IconArrowLeft, IconShoppingCart, IconPlus, IconMinus } from '@tabler/icons-react';

type DetailState =
  | { status: 'loading' }
  | { status: 'success'; cartItem: ShoppingCart }
  | { status: 'error'; message: string };

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // If the ID route parameter context is missing entirely, seed the error immediately to satisfy ESLint
  const [state, setState] = useState<DetailState>(() => 
    id ? { status: 'loading' } : { status: 'error', message: 'Invalid product identification context.' }
  );
  
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!id) return; // Terminate if checked on initialization

    const controller = new AbortController();
    
    catalogApi.getProductDetails(Number(id), controller.signal)
      .then((cartItem) => {
        setState({ status: 'success', cartItem });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setState({ status: 'error', message: err.message || 'Failed to fetch item details.' });
        }
      });

    return () => controller.abort();
  }, [id]);

  const handleAddToCart = async () => {
  if (!id) return;
  setIsAdding(true);
  try {
    // Call the dedicated POST upsert route instead of PATCH plus
    // We send the actual product identity context alongside the selected input quantity state counter
    await cartApi.upsertItem(Number(id), Number(quantity)); 
    
    // Success: Seamless transition to the updated shopping cart layout
    navigate('/cart');
  } catch (err) {
    console.error("Failed to append entry to persistent storage:", err);
  } finally {
    setIsAdding(false);
  }
};

  if (state.status === 'loading') {
    return (
      <Group justify="center" py="xl" my="xl">
        <Loader size="xl" type="bars" color="blue.4" />
        <Text size="md" c="dimmed" fw={500}>De-serializing product inventory metadata parameters...</Text>
      </Group>
    );
  }

  if (state.status === 'error') {
    return (
      <Container size="sm" my="xl">
        <Alert title="Data Retrieval Error" color="red" variant="filled" radius="md">
          {state.message}
        </Alert>
        <Button component={Link} to="/" variant="subtle" mt="md" leftSection={<IconArrowLeft size={16} />}>
          Return to home catalog
        </Button>
      </Container>
    );
  }

  const { product } = state.cartItem;

  return (
    <Container size="lg" py="xl">
      <Button 
        component={Link} 
        to="/" 
        variant="subtle" 
        leftSection={<IconArrowLeft size={16} />} 
        c="dimmed" 
        mb="xl"
        size="sm"
        styles={{ root: { '&:hover': { backgroundColor: 'transparent', color: '#fff' } } }}
      >
        BACK TO HOME
      </Button>

      <Paper shadow="xl" radius="lg" p={{ base: 'md', sm: 'xl' }} bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        {/* Standardized the gutter tokens layout to match Mantine's type configuration constraints */}
        <Grid columns={12} align="center" style={{ gap: 'var(--mantine-spacing-xl)' }}>
          
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper radius="md" p="md" bg="dark.8" withBorder style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <Image
                src={product?.imageUrl}
                radius="md"
                alt={product?.name}
                fallbackSrc="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop"
                style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <div>
                <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }} size="lg" radius="sm" mb="sm">
                  {product?.category?.name || 'Premium Line'}
                </Badge>
                
                <Title order={1} fw={700} style={{ letterSpacing: '-0.5px', textTransform: 'uppercase' }} c="white">
                  {product?.name}
                </Title>
              </div>

              <Group gap="xs" align="baseline">
                <Text size="sm" c="dimmed" fw={500}>Price:</Text>
                <Text size="2xl" fw={700} c="green.4">
                  €{product?.price.toFixed(2)}
                </Text>
              </Group>

              <Divider my="xs" color="dark.4" />

              <div style={{ minHeight: '120px' }}>
                <Text size="sm" fw={400} c="gray.4" style={{ lineHeight: 1.7 }}>
                  {product?.description ? (
                    <span dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    'No detailed technical description overview layout mapped for this specialized device asset registry.'
                  )}
                </Text>
              </div>

              <Divider my="xs" color="dark.4" />

              <Stack gap="xs" mt="md">
                <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Quantity
                </Text>
                
                <Group gap="md" align="center">
                  <Group gap={5} style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: '6px', padding: '4px', backgroundColor: 'var(--mantine-color-dark-8)' }}>
                    <ActionIcon 
                      size="lg" 
                      variant="subtle" 
                      color="gray"
                      disabled={Number(quantity) <= 1}
                      onClick={() => setQuantity((v) => Math.max(1, Number(v) - 1))}
                    >
                      <IconMinus size={16} />
                    </ActionIcon>

                    <NumberInput
                      hideControls
                      value={quantity}
                      onChange={(val) => setQuantity(val)}
                      min={1}
                      max={100}
                      styles={{ input: { width: '45px', textAlign: 'center', border: 'none', backgroundColor: 'transparent', fontWeight: 600 } }}
                    />

                    <ActionIcon 
                      size="lg" 
                      variant="subtle" 
                      color="gray"
                      disabled={Number(quantity) >= 100}
                      onClick={() => setQuantity((v) => Math.min(100, Number(v) + 1))}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Group>

                  <Button 
                    loading={isAdding} 
                    onClick={handleAddToCart}
                    size="md" 
                    color="blue"
                    leftSection={<IconShoppingCart size={16} />}
                  >
                    Add to Cart
                  </Button>
                </Group>
              </Stack>

            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}