import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartApi, type ShoppingCartVM, type ShoppingCartItem } from '../../api/cart';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  Image,
  ActionIcon,
  Divider,
  LoadingOverlay,
  Alert,
  Center
} from '@mantine/core';
import { IconPlus, IconMinus, IconTrash, IconShoppingCart, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';

export function CartView() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<ShoppingCartVM | null>(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [rowActionId, setRowActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track synchronization state variables explicitly to satisfy strict custom rules
  const [shouldRefresh, setShouldRefresh] = useState(true);

  useEffect(() => {
    if (!shouldRefresh) return;

    let isMounted = true;
    
    async function loadCartData() {
      try {
        const data = await cartApi.getCart();
        if (isMounted) {
          setCartData(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to synchronize layout records.');
        }
      } finally {
        if (isMounted) {
          setGlobalLoading(false);
          setRowActionId(null);
          setShouldRefresh(false); // Clean termination of mutation signal passes
        }
      }
    }

    loadCartData();

    return () => {
      isMounted = false;
    };
  }, [shouldRefresh]);

  const handleQuantityMutation = async (cartId: number, action: 'plus' | 'minus' | 'remove') => {
    setRowActionId(cartId);
    try {
      if (action === 'plus') await cartApi.plusItem(cartId);
      if (action === 'minus') await cartApi.minusItem(cartId);
      if (action === 'remove') await cartApi.removeItem(cartId);
      
      // Flip the reactive synchronization flag instead of executing setState functions directly inside callbacks
      setShouldRefresh(true); 
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Execution target aborted via validation faults.');
      setRowActionId(null);
    }
  };

  if (globalLoading) {
    return <LoadingOverlay visible loaderProps={{ type: 'bars', color: 'blue' }} overlayProps={{ blur: 2 }} />;
  }

  const items = cartData?.shoppingCartList ?? [];
  const totalCost = cartData?.orderHeader?.orderTotal ?? 0;

  return (
    <Container size="lg" my="xl">
      <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Group justify="space-between" mb="xl">
          <Button component={Link} to="/" variant="subtle" leftSection={<IconArrowLeft size={16} />} color="gray">
            Continue Shopping
          </Button>
          <Stack gap={0} align="flex-end">
            <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Shopping Cart
            </Title>
            <Text size="xs" c="dimmed">Decoupled execution checkout boundary channel</Text>
          </Stack>
        </Group>

        <Divider mb="xl" color="dark.4" />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Operational Conflict" color="red" variant="filled" mb="md" radius="md">
            {error}
          </Alert>
        )}

        {items.length === 0 ? (
          <Center style={{ height: 250 }}>
            <Stack align="center" gap="xs">
              <IconShoppingCart size={48} color="var(--mantine-color-dark-3)" />
              <Text fw={600} size="lg" c="dimmed">Your persistent shopping cart configuration context is empty.</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="lg">
            {items.map((item: ShoppingCartItem) => (
              <Paper key={item.id} p="md" withBorder bg="dark.8" style={{ borderColor: 'var(--mantine-color-dark-5)', position: 'relative' }}>
                <Grid align="center">
                  <Grid.Col span={{ base: 3, sm: 1.5 }}>
                    <Image src={item.product?.imageUrl || 'https://placehold.co/100'} radius="sm" alt={item.product?.name} fallbackSrc="https://placehold.co/100" />
                  </Grid.Col>

                  <Grid.Col span={{ base: 9, sm: 5.5 }}>
                    <Text fw={700} size="md" c="white" style={{ textTransform: 'uppercase' }}>
                      {item.product?.name}
                    </Text>
                    <Text size="sm" c="blue.4" fw={500}>
                      ${item.product?.price.toFixed(2)}
                    </Text>
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        loading={rowActionId === item.id} 
                        onClick={() => handleQuantityMutation(item.id, 'minus')}
                      >
                        <IconMinus size={16} />
                      </ActionIcon>
                      <Text fw={700} size="md" mx="sm" c="white">
                        {item.quantity}
                      </Text>
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        loading={rowActionId === item.id} 
                        onClick={() => handleQuantityMutation(item.id, 'plus')}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, sm: 2 }}>
                    <Group justify="space-between">
                      <Text fw={700} size="md" c="white">
                        ${(item.product?.price * item.quantity).toFixed(2)}
                      </Text>
                      <ActionIcon 
                        variant="filled" 
                        color="red" 
                        loading={rowActionId === item.id} 
                        onClick={() => handleQuantityMutation(item.id, 'remove')}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>
            ))}

            <Divider my="md" color="dark.4" />

            <Group justify="flex-end" p="md">
              <Group gap="xs">
                <Text size="lg" fw={600} c="dimmed" style={{ textTransform: 'uppercase' }}>Order Total:</Text>
                <Text size="xl" fw={900} c="white">${totalCost.toFixed(2)}</Text>
              </Group>
            </Group>

            <Group justify="center" mt="md">
              <Button 
                size="md" 
                color="blue" 
                radius="md" 
                w={{ base: '100%', sm: 250 }}
                onClick={() => navigate('/summary')}
                style={{ letterSpacing: '0.5px' }}
              >
                PROCEED TO SUMMARY
              </Button>
            </Group>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}