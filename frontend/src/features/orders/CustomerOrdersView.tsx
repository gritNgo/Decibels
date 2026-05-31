import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/order'; 
import type { OrderHeader } from '../../types'; 
import { Container, Table, Title, Text, Badge, Paper, Center, Loader, Stack, Button } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

export function CustomerOrdersView() {
  const [orders, setOrders] = useState<OrderHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCustomerOrders = async () => {
      try {
        // Satisfy parameter constraints by requesting all user-scoped transactional rows
        const response = await orderApi.getOrders(""); 
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
        <Badge color={order.orderStatus?.toLowerCase() === 'approved' ? 'green' : 'blue'} variant="light">
          {order.orderStatus || 'Pending'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={order.paymentStatus?.toLowerCase() === 'approved' ? 'green' : 'yellow'} variant="dot">
          {order.paymentStatus || 'Pending'}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Button 
          component={Link} 
          to={`/orders/${order.id}`} 
          variant="subtle" 
          size="xs"
          leftSection={<IconEye size={14} />}
        >
          Details
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md" my={20}>
      <Stack gap="sm" mb="xl">
        <Title order={2} c="white">YOUR PURCHASING HISTORY</Title>
        <Text size="sm" c="dimmed">Track real-time settlement states of your transactional assets.</Text>
      </Stack>

      {/* overflow: 'auto' ensures the parent container acts as a bounding box */}
      <Paper radius="md" p="md" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)', overflow: 'auto' }}>
        {orders.length === 0 ? (
          <Text size="sm" c="dimmed" style={{ textAlign: 'center' }} py="xl">
            No tracked order allocations discovered on this account profile context.
          </Text>
        ) : (
          /* Enforces explicit wide rendering boundaries inside the scrollable view */
          <Table.ScrollContainer minWidth={750}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th c="dimmed">ORDER ID</Table.Th>
                  <Table.Th c="dimmed">RECIPIENT</Table.Th>
                  <Table.Th c="dimmed">TOTAL</Table.Th>
                  <Table.Th c="dimmed">ORDER STATUS</Table.Th>
                  <Table.Th c="dimmed">PAYMENT STATUS</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }} c="dimmed">ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>
    </Container>
  );
}