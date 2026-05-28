import { useEffect, useState } from 'react';
import { orderApi } from '../../api/order'; 
import type { OrderHeader } from '../../types'; // Import your exact types
import { Container, Table, Title, Text, Badge, Paper, Center, Loader, Stack } from '@mantine/core';

export function CustomerOrdersView() {
  // Use your explicit OrderHeader model definition to enforce ironclad TypeScript typing
  const [orders, setOrders] = useState<OrderHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCustomerOrders = async () => {
      try {
        // Satisfy the 1-argument requirement by passing an empty string or "All" 
        // to retrieve all orders matching this user's token identity context
        const response = await orderApi.getOrders(""); 
        
        // Explicit type-safe checking ensuring an array fallback layout
        const dataArray = Array.isArray(response) ? response : [];
        
        if (isMounted) {
          setOrders(dataArray);
        }
      } catch (err) {
        console.error('Failed to load user order graph matrices.', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCustomerOrders();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Center style={{ height: '40vh' }}>
        <Loader size="md" color="blue" />
      </Center>
    );
  }

  const rows = orders.map((order) => (
    <Table.Tr key={order.id}>
      <Table.Td fw={500} c="white">#{order.id}</Table.Td>
      <Table.Td>{order.name}</Table.Td>
      <Table.Td fw={600}>€{order.orderTotal.toFixed(2)}</Table.Td>
      <Table.Td>
        <Badge color={order.orderStatus === 'Approved' ? 'green' : 'blue'} variant="light">
          {order.orderStatus || 'Pending'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={order.paymentStatus === 'Approved' ? 'green' : 'yellow'} variant="dot">
          {order.paymentStatus || 'Pending'}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md" my={20}>
      <Stack gap="sm" mb="xl">
        <Title order={2} c="white">YOUR PURCHASING HISTORY</Title>
        <Text size="sm" c="dimmed">Track real-time settlement states of your transactional assets.</Text>
      </Stack>

      <Paper radius="md" p="md" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        {orders.length === 0 ? (
          <Text size="sm" c="dimmed" style={{ textAlign: 'center' }} py="xl">
            No tracked order allocations discovered on this account profile context.
          </Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th c="dimmed">ORDER ID</Table.Th>
                <Table.Th c="dimmed">RECIPIENT</Table.Th>
                <Table.Th c="dimmed">TOTAL</Table.Th>
                <Table.Th c="dimmed">ORDER STATUS</Table.Th>
                <Table.Th c="dimmed">PAYMENT STATUS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}