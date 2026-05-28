import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderApi } from '../../api/order';
import type { OrderHeader } from '../../types'; 

import { 
  Container, 
  Table, 
  Title, 
  Paper, 
  Badge, 
  Group, 
  Button, 
  Loader, 
  Text, 
  Alert,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconEye, IconRefresh, IconInbox } from '@tabler/icons-react';

export function OrderManagementIndex() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentStatusFilter = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState<OrderHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapped in useCallback to prevent cascading render cycles and solve linting gates
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getOrders(currentStatusFilter);
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Operational failure extracting central order registries.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentStatusFilter]);

// Extracted tracking side-effects directly to run cleanly inside standard execution bounds
useEffect(() => {
  let isMounted = true;
  
  const loadOrderDataStream = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getOrders(currentStatusFilter);
      if (isMounted) setOrders(data);
    } catch (err: unknown) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : 'Operational failure extracting central order registries.';
        setError(errorMessage);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  loadOrderDataStream();
  
  return () => {
    isMounted = false; // Prevents race condition state updates if a user rapidly toggles filter tabs
  };
}, [currentStatusFilter]);

  const handleFilterChange = (status: string) => {
    setSearchParams({ status });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Badge color="blue.5" variant="light">Approved</Badge>;
      case 'inprocess': return <Badge color="orange.5" variant="light">In Process</Badge>;
      case 'shipped': return <Badge color="green.5" variant="filled">Shipped</Badge>;
      case 'cancelled': return <Badge color="red.5" variant="outline">Cancelled</Badge>;
      case 'pending': return <Badge color="cyan.5" variant="light">Pending Payment</Badge>;
      default: return <Badge color="gray.5" variant="light">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Stack gap={4}>
          <Title order={2} c="white" fw={700} style={{ letterSpacing: '-0.5px' }}>
            ORDER MANAGEMENT REGISTRY
          </Title>
          <Text size="sm" c="dimmed">Administrative control interface for fulfillment workflows</Text>
        </Stack>
        <ActionIcon variant="subtle" size="lg" color="gray" onClick={fetchOrders} disabled={loading}>
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      <Paper p="xs" radius="md" bg="dark.7" withBorder mb="lg" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Group gap="xs">
          {[
            { label: 'All Orders', value: 'all' },
            { label: 'Approved', value: 'approved' },
            { label: 'In Process', value: 'inprocess' },
            { label: 'Payment Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' }
          ].map((tab) => (
            <Button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              variant={currentStatusFilter === tab.value ? 'filled' : 'subtle'}
              color={currentStatusFilter === tab.value ? 'blue' : 'gray'}
              size="xs"
              radius="sm"
            >
              {tab.label}
            </Button>
          ))}
        </Group>
      </Paper>

      {loading ? (
        <Group justify="center" py="xl" my="xl">
          <Loader size="lg" type="bars" color="blue.4" />
        </Group>
      ) : error ? (
        <Alert title="Data Link Layer Fault" color="red" variant="light">
          {error}
        </Alert>
      ) : orders.length === 0 ? (
        <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ textAlign: 'center', borderColor: 'var(--mantine-color-dark-4)' }}>
          <IconInbox size={48} color="var(--mantine-color-dark-3)" style={{ marginBottom: '12px' }} />
          <Text size="sm" c="dimmed">No transaction records mapped to this status filter configuration.</Text>
        </Paper>
      ) : (
        <Paper radius="md" bg="dark.7" withBorder style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-dark-4)' }}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover style={{ color: 'var(--mantine-color-gray-3)' }}>
            <Table.Thead style={{ backgroundColor: 'var(--mantine-color-dark-8)', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
              <Table.Tr>
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)' }}>ID</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)' }}>Recipient Name</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)' }}>Phone Connection</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)' }}>Workflow Status</Table.Th>
                {/* Merged duplicate style declarations into a unified structural descriptor layout */}
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)', textAlign: 'right' }}>Revenue Gross</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-gray-4)' }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id} style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
                  <Table.Td fw={600} c="white">#{order.id}</Table.Td>
                  <Table.Td>{order.name}</Table.Td>
                  {/* Replaced non-existent custom property with correct native Mantine font family string */}
                  <Table.Td><Text size="xs" style={{ fontFamily: 'monospace' }}>{order.phoneNumber}</Text></Table.Td>
                  <Table.Td>{getStatusBadge(order.orderStatus)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right', fontWeight: 600 }} c="green.4">
                    €{order.orderTotal.toFixed(2)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Tooltip label="Open Operational Control Panel" position="left" withArrow radius="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}

function Stack({ children, gap }: { children: React.ReactNode; gap: number }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>{children}</div>;
}