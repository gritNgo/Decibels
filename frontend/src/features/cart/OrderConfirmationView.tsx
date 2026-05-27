import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { Container, Paper, Title, Text, Button, Loader, Center, Stack } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconReceipt } from '@tabler/icons-react';

export function OrderConfirmationView() {
  const { id } = useParams<{ id: string }>();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!id) return;
      try {
        // Fires verification payload straight to api/cart/verify/{id}
        // This cleans out the shopping cart lines inside EF Core automatically
        await orderApi.verifyPayment(Number(id));
        setSuccess(true);
      } catch (err) {
        console.error("Payment confirmation tracing failure:", err);
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [id]);

  return (
    <Container size="sm" py="xl" my="xl">
      <Paper p="xl" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Center>
          {verifying ? (
            <Stack align="center" py="xl">
              <Loader size="lg" type="dots" color="blue.4" />
              <Text c="dimmed">Finalizing transaction telemetry logs...</Text>
            </Stack>
          ) : success ? (
            <Stack align="center" gap="md" style={{ textAlign: 'center' }}>
              <ThemeIconCircle color="green">
                <IconCheck size={32} color="var(--mantine-color-green-4)" />
              </ThemeIconCircle>
              <Title order={2} c="white">Payment Successful!</Title>
              <Text c="dimmed" size="sm">
                Order Tracking Identity Index: <Text span fw={700} c="blue.4">#{id}</Text>
              </Text>
              <Text c="gray.3" maw={400} mx="auto" size="sm">
                Your payment was processed successfully. The inventory allocation blocks have been safely locked down.
              </Text>
              <Button component={Link} to="/orders" leftSection={<IconReceipt size={16} />} mt="md" color="blue">
                View My Orders
              </Button>
            </Stack>
          ) : (
            <Stack align="center" gap="md" style={{ textAlign: 'center' }}>
              <ThemeIconCircle color="amber">
                <IconAlertTriangle size={32} color="var(--mantine-color-yellow-4)" />
              </ThemeIconCircle>
              <Title order={2} c="white">Telemetry Status Uncertain</Title>
              <Text c="gray.4" size="sm">
                We couldn't instantly verify the Stripe session webhook parameters. Don't worry—your order has been logged.
              </Text>
              <Button component={Link} to="/" mt="md" variant="light">
                Return to Catalog
              </Button>
            </Stack>
          )}
        </Center>
      </Paper>
    </Container>
  );
}

// Quick inner presentation block wrapper for consistent look
function ThemeIconCircle({ children, color }: { children: React.ReactNode; color: 'green' | 'amber' }) {
  const bg = color === 'green' ? 'rgba(43, 138, 62, 0.1)' : 'rgba(230, 73, 73, 0.1)';
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {children}
    </div>
  );
}