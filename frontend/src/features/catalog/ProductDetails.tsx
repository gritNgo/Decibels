import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
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
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const [quantity, setQuantity] = useState<number | string>(1);

  useEffect(() => {
    if (!id) {
      setState({ status: 'error', message: 'Invalid product identification context.' });
      return;
    }

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
      {/* BACK NAVIGATION BUTTON */}
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

      {/* PRIMARY TRANSFORMATION SURFACE PANEL */}
      <Paper shadow="xl" radius="lg" p={{ base: 'md', sm: 'xl' }} bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Grid columns={12} gutter={{ base: 'xl', md: 50 }} align="center">
          
          {/* LEFT AXIS: PREMIUM GRAPHIC CONTAINER */}
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

          {/* RIGHT AXIS: META LOGIC SPECIFICATION ENGINE */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <div>
                <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }} size="lg" radius="sm" mb="sm">
                  {product?.category?.name || 'Premium Line'}
                </Badge>
                
                <Title order={1} fw={700} style={{ tracking: '-0.5px', textTransform: 'uppercase' }} c="white">
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

              {/* DESCRIPTION PANEL WITH SAFE HTML INJECTION (Equivalent to @Html.Raw) */}
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

              {/* QUANTITY BLOCK & DISPATCH ADD ACTION CHANNEL */}
              <Stack gap="xs" mt="md">
                <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase', tracking: '0.5px' }}>
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
                    color="blue" 
                    size="lg" 
                    radius="md"
                    style={{ flexGrow: 1 }}
                    leftSection={<IconShoppingCart size={20} />}
                    onClick={() => alert(`Transactional dispatch block initialized! Packing ${quantity} unit(s) of [${product?.name}] into memory layers.`)}
                  >
                    ADD TO CART
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