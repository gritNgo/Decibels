import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import type { OrderVM, OrderHeader } from '../../types';
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
  Alert,
  Badge,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconTruck, 
  IconReceipt, 
  IconSettings, 
  IconAlertCircle, 
  IconCheck 
} from '@tabler/icons-react';

export function OrderManagementDetails() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [orderData, setOrderData] = useState<OrderVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for administrative modifications
  const [shippingForm, setShippingForm] = useState<OrderHeader | null>(null);
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Role detection computed straight from session token claims
  const storedUser = localStorage.getItem('decibels_session');
  const session = storedUser ? JSON.parse(storedUser) : null;
  const isAdminOrEmployee = session?.role === 'Admin' || session?.role === 'Employee';

  // Integrated clean state tracking directly inside the effect boundary to prevent cascading renders
  useEffect(() => {
    let isMounted = true;
    if (!orderId) return;

    const loadOrderDetailsStream = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderApi.getOrderDetails(orderId);
        if (isMounted) {
          setOrderData(data);
          setShippingForm(data.orderHeader);
          setCourier(data.orderHeader.courier || '');
          setTrackingNumber(data.orderHeader.trackingNumber || '');
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to extract downstream relational order graph parameters.';
          setError(errorMessage);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrderDetailsStream();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Unified reload helper utilizing the exact same operational pattern
  const reloadOrderDataState = async () => {
    setError(null);
    try {
      const data = await orderApi.getOrderDetails(orderId);
      setOrderData(data);
      setShippingForm(data.orderHeader);
      setCourier(data.orderHeader.courier || '');
      setTrackingNumber(data.orderHeader.trackingNumber || '');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'State refresh operation failed.';
      setError(errorMessage);
    }
  };

  const handleUpdateDetails = async () => {
    if (!shippingForm) return;
    setActionLoading(true);
    try {
      await orderApi.updateOrderDetails({
        ...shippingForm,
        courier,
        trackingNumber,
      });
      await reloadOrderDataState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Mutation failure updating shipping rows.';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartProcessing = async () => {
    setActionLoading(true);
    try {
      await orderApi.startProcessing(orderId);
      await reloadOrderDataState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Workflow transition failure.';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOrder = async () => {
    if (!courier || !trackingNumber) {
      setError('Courier identity and tracking digits must be specified before dispatch.');
      return;
    }
    setActionLoading(true);
    try {
      await orderApi.shipOrder({ id: orderId, courier, trackingNumber });
      await reloadOrderDataState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Logistical shipping validation exception.';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      await orderApi.cancelOrder(orderId);
      await reloadOrderDataState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Financial processor cancellation rollback failure.';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Group justify="center" py="xl" my="xl">
        <Loader size="xl" type="bars" color="blue.4" />
        <Text size="md" c="dimmed">Assembling order ledger structures...</Text>
      </Group>
    );
  }

  if (error && !orderData) {
    return (
      <Container size="sm" my="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="System Graph Resolution Error" color="red" variant="filled">
          {error}
        </Alert>
        <Button component={Link} to="/admin/orders" mt="md" leftSection={<IconArrowLeft size={16} />}>
          Back to Order Registry
        </Button>
      </Container>
    );
  }

  if (!orderData || !shippingForm) return null;

  const { orderHeader, orderDetail } = orderData;

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'blue';
      case 'inprocess': return 'orange';
      case 'shipped': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Button 
        component={Link} 
        to={isAdminOrEmployee ? "/admin/orders" : "/orders"} 
        variant="subtle" 
        leftSection={<IconArrowLeft size={16} />} 
        c="dimmed" 
        mb="xl"
      >
        BACK TO REGISTRY
      </Button>

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} c="white" fw={700} style={{ letterSpacing: '-0.5px' }}>
            ORDER DETAILS
          </Title>
          <Text size="sm" c="dimmed">ID: #{orderHeader.id}</Text>
        </div>
        <Badge size="lg" color={getStatusColor(orderHeader.orderStatus)} variant="filled" radius="sm">
          STATUS: {orderHeader.orderStatus?.toUpperCase()}
        </Badge>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Workflow Exception" color="red" variant="light" mb="lg">
          {error}
        </Alert>
      )}

      <Grid columns={12} style={{ gap: 'var(--mantine-spacing-xl)' }}>
        {/* LEFT PANEL: LOGISTICAL SHIPPING & ACCOUNTS METADATA */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
            <Group mb="md" gap="xs">
              <IconTruck size={20} color="var(--mantine-color-blue-4)" />
              <Text size="md" fw={600} c="white">CUSTOMER DETAILS</Text>
            </Group>
            <Divider mb="lg" color="dark.4" />

            <Stack gap="md">
              <TextInput
                label="Recipient Full Name"
                value={shippingForm.name}
                onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                readOnly={!isAdminOrEmployee}
                bg="dark.8"
              />
              <TextInput
                label="Contact Phone Number"
                value={shippingForm.phoneNumber}
                onChange={(e) => setShippingForm({ ...shippingForm, phoneNumber: e.target.value })}
                readOnly={!isAdminOrEmployee}
                bg="dark.8"
              />
              <TextInput
                label="Street Address"
                value={shippingForm.street}
                onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                readOnly={!isAdminOrEmployee}
                bg="dark.8"
              />
              <Grid columns={3}>
                <Grid.Col span={1}>
                  <TextInput
                    label="City"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    readOnly={!isAdminOrEmployee}
                    bg="dark.8"
                  />
                </Grid.Col>
                <Grid.Col span={1}>
                  <TextInput
                    label="State"
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    readOnly={!isAdminOrEmployee}
                    bg="dark.8"
                  />
                </Grid.Col>
                <Grid.Col span={1}>
                  <TextInput
                    label="Postal Code"
                    value={shippingForm.postalCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    readOnly={!isAdminOrEmployee}
                    bg="dark.8"
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Account Registration Email"
                value={orderHeader.applicationUser?.email || 'Guest Client Context'}
                readOnly
                disabled
                bg="dark.8"
              />

              <Grid columns={2}>
                <Grid.Col span={1}>
                  <TextInput
                    label="Courier Class Service"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    readOnly={!isAdminOrEmployee}
                    placeholder="e.g. DHL, FedEx"
                    bg="dark.8"
                  />
                </Grid.Col>
                <Grid.Col span={1}>
                  <TextInput
                    label="Logistical Tracking ID"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    readOnly={!isAdminOrEmployee}
                    placeholder="e.g. TRK1023948"
                    bg="dark.8"
                  />
                </Grid.Col>
              </Grid>

              {isAdminOrEmployee && (
                <Button 
                  onClick={handleUpdateDetails} 
                  loading={actionLoading} 
                  variant="light" 
                  color="yellow" 
                  mt="sm"
                >
                  UPDATE SHIPPING ATTRIBUTES
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* RIGHT PANEL: LINE ITEMS, FINANCIAL LEDGER, & WORKFLOW CONTROLS */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="xl">
            {/* INVOICE BILLING BREAKDOWN */}
            <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
              <Group mb="md" gap="xs">
                <IconReceipt size={20} color="var(--mantine-color-green-4)" />
                <Text size="md" fw={600} c="white">FINANCIAL TRANSACTION LEDGER</Text>
              </Group>
              <Divider mb="md" color="dark.4" />

              <Stack gap="xs" mb="md">
                {orderDetail.map((item) => (
                  <Group key={item.id} justify="space-between" wrap="nowrap">
                    <div>
                      <Text size="sm" fw={500} c="gray.2" lineClamp={1}>{item.product?.name}</Text>
                      <Text size="xs" c="dimmed">Qty: {item.quantity} × €{item.price.toFixed(2)}</Text>
                    </div>
                    <Text size="sm" fw={600} c="white">€{(item.price * item.quantity).toFixed(2)}</Text>
                  </Group>
                ))}
              </Stack>

              <Divider my="md" color="dark.4" />

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Payment Method:</Text>
                <Badge variant="outline" color="purple">Stripe Sandbox Gateway</Badge>
              </Group>
              <Group justify="space-between" mb="xl">
                <Text size="md" fw={700} c="white">Total:</Text>
                <Text size="xl" fw={700} c="green.4">€{orderHeader.orderTotal.toFixed(2)}</Text>
              </Group>
            </Paper>

            {/* STATE-MACHINE ORCHESTRATION ENGINE (ADMIN EXCLUSIVE) */}
            {isAdminOrEmployee && (
              <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
                <Group mb="md" gap="xs">
                  <IconSettings size={20} color="var(--mantine-color-orange-4)" />
                  <Text size="md" fw={600} c="white">ADMINISTRATIVE FULFILLMENT ACTIONS</Text>
                </Group>
                <Divider mb="lg" color="dark.4" />

                <Stack gap="sm">
                  {orderHeader.orderStatus?.toLowerCase() === 'approved' && (
                    <Button 
                      color="orange" 
                      onClick={handleStartProcessing} 
                      loading={actionLoading}
                      fullWidth
                    >
                      START MANUFACTURING/PROCESSING
                    </Button>
                  )}

                  {orderHeader.orderStatus?.toLowerCase() === 'inprocess' && (
                    <Button 
                      color="green" 
                      onClick={handleShipOrder} 
                      loading={actionLoading}
                      leftSection={<IconCheck size={16} />}
                      fullWidth
                    >
                      CONFIRM & DISPATCH SHIPMENT
                    </Button>
                  )}

                  {orderHeader.orderStatus?.toLowerCase() !== 'cancelled' && 
                   orderHeader.orderStatus?.toLowerCase() !== 'shipped' && (
                    <Button 
                      color="red" 
                      variant="outline" 
                      onClick={handleCancelOrder} 
                      loading={actionLoading}
                      fullWidth
                    >
                      CANCEL ORDER & ISSUE FULL REFUND
                    </Button>
                  )}

                  {orderHeader.orderStatus?.toLowerCase() === 'shipped' && (
                    <Alert color="green" variant="light" py="xs">
                      This transaction framework has scaled completely into functional fulfillment.
                    </Alert>
                  )}
                  
                  {orderHeader.orderStatus?.toLowerCase() === 'cancelled' && (
                    <Alert color="red" variant="light" py="xs">
                      This order has been refunded.
                    </Alert>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}