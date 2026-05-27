import { useEffect, useState } from 'react';
import { orderApi } from '../../api/order';
import type { OrderSubmissionPayload } from '../../types'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Group, 
  Divider, 
  Loader, 
  Alert
} from '@mantine/core';
import { IconCreditCard, IconArrowLeft, IconTruck } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL;

interface CartItemSummary {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    price: number;
  };
}

interface SummaryData {
  shoppingCartList: CartItemSummary[];
  orderHeader: {
    orderTotal: number;
    name: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export function SummaryView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState<OrderSubmissionPayload>({
    name: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });
  
  const [cartItems, setCartItems] = useState<CartItemSummary[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const storedUser = localStorage.getItem('decibels_session');
        if (!storedUser) throw new Error('Unauthenticated operational access context violation.');
        const session = JSON.parse(storedUser);

        const response = await fetch(`${API_URL}/api/cart/summary`, {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });

        if (!response.ok) throw new Error('Failed to resolve checkout billing summaries.');
        
        const data: SummaryData = await response.json();
        
        setCartItems(data.shoppingCartList);
        setOrderTotal(data.orderHeader.orderTotal);
        
        setForm({
          name: data.orderHeader.name || '',
          phoneNumber: data.orderHeader.phoneNumber || '',
          street: data.orderHeader.street || '',
          city: data.orderHeader.city || '',
          state: data.orderHeader.state || '',
          postalCode: data.orderHeader.postalCode || ''
        });
      } catch (err: unknown) {
        // Eliminated explicit 'any' type mapping to meet strict linting standards
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error resolving checkout variables.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await orderApi.submitOrder(form);
      
      if (result.requiresPayment && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        navigate(`/order-confirmation/${result.orderId}`);
      }
    } catch (err: unknown) {
      // Safely typed catch block with concrete string evaluation
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Transactional exception processing your checking parameters.');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Group justify="center" py="xl" my="xl">
        <Loader size="xl" type="bars" color="blue.4" />
        <Text size="md" c="dimmed" fw={500}>Assembling financial ledger summaries...</Text>
      </Group>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <Container size="sm" my="xl">
        <Alert title="Checkout Verification Fault" color="red" variant="filled">
          {error}
        </Alert>
        <Button component={Link} to="/cart" mt="md" leftSection={<IconArrowLeft size={16} />}>
          Return to functional cart mapping
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Button component={Link} to="/cart" variant="subtle" leftSection={<IconArrowLeft size={16} />} c="dimmed" mb="xl">
        BACK TO CART
      </Button>

      <Title order={2} mb="xl" c="white" fw={700} style={{ letterSpacing: '-0.5px' }}>
        ORDER SUMMARY SPECIFICATION
      </Title>

      <form onSubmit={handlePlaceOrder}>
        <Grid columns={12} style={{ gap: 'var(--mantine-spacing-xl)' }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
              <Group mb="md" gap="xs">
                <IconTruck size={20} color="var(--mantine-color-blue-4)" />
                <Text size="md" fw={600} c="white">SHIPPING METADATA TARGETS</Text>
              </Group>
              <Divider mb="lg" color="dark.4" />

              <Stack gap="sm">
                <TextInput
                  label="Recipient Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  bg="dark.8"
                />
                <TextInput
                  label="Contact Phone Number"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  bg="dark.8"
                />
                <TextInput
                  label="Street Address Line"
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  bg="dark.8"
                />
                <Grid columns={12}>
                  <Grid.Col span={6}>
                    <TextInput
                      label="City"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      bg="dark.8"
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput
                      label="State"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      bg="dark.8"
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput
                      label="Postal Code"
                      required
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      bg="dark.8"
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
              <Text size="md" fw={600} c="white" mb="md">LINE ITEM INVENTORY</Text>
              <Divider mb="md" color="dark.4" />

              <Stack gap="xs">
                {cartItems.map((item) => (
                  <Group key={item.id} justify="space-between" wrap="nowrap">
                    <div>
                      <Text size="sm" fw={500} c="gray.2" lineClamp={1}>{item.product?.name}</Text>
                      <Text size="xs" c="dimmed">Qty: {item.quantity} × €{item.price.toFixed(2)}</Text>
                    </div>
                    <Text size="sm" fw={600} c="white">€{(item.price * item.quantity).toFixed(2)}</Text>
                  </Group>
                ))}

                <Divider my="md" color="dark.4" />

                <Group justify="space-between">
                  <Text size="md" fw={700} c="white">Total Revenue Target:</Text>
                  <Text size="xl" fw={700} c="green.4">€{orderTotal.toFixed(2)}</Text>
                </Group>

                {error && (
                  <Alert title="Mutation Failure" color="red" mt="md" variant="light">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  color="blue"
                  mt="xl"
                  loading={issubmitting}
                  leftSection={<IconCreditCard size={18} />}
                  fullWidth
                >
                  PROCEED TO STRIPE GATEWAY
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </form>
    </Container>
  );
}