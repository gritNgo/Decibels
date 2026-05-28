import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import type { OrderVM } from '../../types';
import { Container, Grid, Paper, Title, Text, Table, Badge, Button, Center, Loader, Stack, Group, Divider } from '@mantine/core';
import { IconArrowLeft, IconReceipt } from '@tabler/icons-react';

export function CustomerOrderDetailsView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OrderVM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await orderApi.getOrderDetails(Number(id));
        if (isMounted) setData(response);
      } catch (err) {
        console.error('Failed to extract transactional details graph matrix:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="md" color="blue" />
      </Center>
    );
  }

  if (!data || !data.orderHeader) {
    return (
      <Center style={{ height: '50vh' }}>
        <Stack align="center" gap="sm">
          <Text c="dimmed">Target order specification matrix could not be resolved.</Text>
          <Button component={Link} to="/orders" variant="light" size="xs">Back to History</Button>
        </Stack>
      </Center>
    );
  }

  const { orderHeader, orderDetail = [] } = data;

  const itemRows = orderDetail.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td fw={500} c="white">{item.product?.name || `Product ID: ${item.productId}`}</Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
      <Table.Td>€{item.price.toFixed(2)}</Table.Td>
      <Table.Td fw={600} style={{ textAlign: 'right' }}>
        €{(item.price * item.quantity).toFixed(2)}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md" my={20}>
      <Group justify="space-between" mb="xl">
        <Button 
          component={Link} 
          to="/orders" 
          variant="subtle" 
          color="dimmed" 
          leftSection={<IconArrowLeft size={16} />}
        >
          BACK TO HISTORY
        </Button>
        <Badge size="lg" radius="sm" color={orderHeader.orderStatus?.toLowerCase() === 'approved' ? 'green' : 'blue'}>
          {orderHeader.orderStatus || 'Pending'}
        </Badge>
      </Group>

      <Grid>
        {/* Left Column: Relational Itemized Line Assets */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
            <Group gap="sm" mb="lg">
              <IconReceipt size={22} color="var(--mantine-color-blue-5)" />
              <Title order={3} c="white">SPECIFICATION BREAKDOWN</Title>
            </Group>
            
            <Table verticalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th c="dimmed">ITEM DESCRIPTION</Table.Th>
                  <Table.Th c="dimmed" style={{ textAlign: 'center' }}>QTY</Table.Th>
                  <Table.Th c="dimmed">UNIT PRICE</Table.Th>
                  <Table.Th c="dimmed" style={{ textAlign: 'right' }}>SUBTOTAL</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{itemRows}</Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>

        {/* Right Column: Transaction Header Metadata */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
            <Title order={4} c="white" mb="sm">ORDER #{orderHeader.id}</Title>
            <Text size="xs" c="dimmed" mb="md">
              Logged: {orderHeader.orderDate ? new Date(orderHeader.orderDate).toLocaleString() : 'N/A'}
            </Text>
            
            <Divider my="sm" color="dark.4" />

            <Stack gap="xs" my="md">
              <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Shipping Destination</Text>
              <Text size="sm" c="white" fw={500}>{orderHeader.name}</Text>
              <Text size="xs" c="dimmed">{orderHeader.street}</Text>
              <Text size="xs" c="dimmed">{orderHeader.postalCode} {orderHeader.city} ({orderHeader.state})</Text>
              <Text size="xs" c="dimmed">Contact: {orderHeader.phoneNumber}</Text>
            </Stack>

            <Divider my="sm" color="dark.4" />

            <Stack gap="xs" mt="md">
              <Group justify="space-between">
                <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Payment State</Text>
                <Badge size="xs" variant="dot" color={orderHeader.paymentStatus?.toLowerCase() === 'approved' ? 'green' : 'yellow'}>
                  {orderHeader.paymentStatus || 'Pending'}
                </Badge>
              </Group>
              
              <Group justify="space-between" mt="sm">
                <Title order={5} c="white">TOTAL SECURED</Title>
                <Title order={4} c="blue">€{orderHeader.orderTotal.toFixed(2)}</Title>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}