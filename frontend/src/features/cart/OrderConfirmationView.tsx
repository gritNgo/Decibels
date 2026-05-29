import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/order'; 
// Extract context hook to clear stale cart badge
import { useCart } from '../../context/CartContext'; 
import { Container, Paper, Title, Text, Button, Loader, Center, Stack, ThemeIcon, Group, Image, Anchor } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export function OrderConfirmationView() {
  const { id } = useParams<{ id: string }>();
  const { refreshCartCount } = useCart(); // Pull state synchronization pipeline
  const [status, setStatus] = useState<'loading' | 'success' | 'uncertain'>('loading');
  const [isRetrying, setIsRetrying] = useState(false);
  
  const pollingTracker = useRef<number | null>(null);
  const attempts = useRef(0);

  const checkPaymentStatus = useCallback(async (manualRetry = false) => {
    if (!id) return;
    if (manualRetry) setIsRetrying(true);
    
    try {
      attempts.current += 1;
      
      // Trigger the verification call through orderApi method
      await orderApi.verifyPayment(Number(id)); 
      // Resolve the details graph model payload object safely
      const response = await orderApi.getOrderDetails(Number(id)); 
      
      // Access via the clean nested orderHeader property layout matching the C# OrderVM structure
      const currentOrderStatus = (response?.orderHeader?.orderStatus || '').toString().toLowerCase();
      const currentPaymentStatus = (response?.orderHeader?.paymentStatus || '').toString().toLowerCase();

      if (currentOrderStatus === 'approved' || currentPaymentStatus === 'approved') {
        setStatus('success');
        
        // Trigger immediate background sync to clear navbar counter now that DB is wiped
        await refreshCartCount();
        
        if (pollingTracker.current) window.clearInterval(pollingTracker.current);
      } else if (attempts.current >= 4 && !manualRetry) {
        setStatus('uncertain');
        if (pollingTracker.current) window.clearInterval(pollingTracker.current);
      }
    } catch (err) {
      console.error('Handshake verification telemetry trace error:', err);
      if (attempts.current >= 4 && !manualRetry) {
        setStatus('uncertain');
        if (pollingTracker.current) window.clearInterval(pollingTracker.current);
      }
    } finally {
      if (manualRetry) setIsRetrying(false);
    }
  }, [id, refreshCartCount]);

  useEffect(() => {
    const handleInitialVerification = window.setTimeout(() => {
      checkPaymentStatus(false);
    }, 0);

    pollingTracker.current = window.setInterval(() => {
      checkPaymentStatus(false);
    }, 3000); 

    return () => {
      window.clearTimeout(handleInitialVerification);
      if (pollingTracker.current) window.clearInterval(pollingTracker.current);
    };
  }, [checkPaymentStatus]);

  if (status === 'loading') {
    return (
      <Center style={{ height: '50vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" color="blue" type="dots" />
          <Text size="sm" c="dimmed">Executing real-time Stripe sandbox synchronization handshakes...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Container size="xs" my={40}>
      <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Stack align="center" gap="md">
          {status === 'success' ? (
            <>
              <Image 
                src="/images/rock.jpg" 
                alt="Order Success Asset" 
                mah={200}
                maw={200}
                fit="contain"
                my="sm"
                style={{ 
                  borderRadius: '16px', // Forces the actual visible image boundaries to round
                  overflow: 'hidden',
                  border: '1px solid var(--mantine-color-dark-4)'  // anchors it into the dark UI theme
                }}
              />
              <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                Payment Confirmed
              </Title>
              
              <Text size="sm" c="dimmed" style={{ textAlign: 'center', lineHeight: 1.6 }}>
                Your transaction for{' '}
                <Anchor component={Link} to={`/orders/${id}`} fw={700} color="blue.4">
                  Order #{id}
                </Anchor>{' '}
                settled successfully. Review it or track the status timeline within{' '}
                <Anchor component={Link} to="/orders" fw={500} color="blue.4">
                  My Orders
                </Anchor>.
              </Text>

              <Button component={Link} to="/" color="blue" mt="md" fullWidth style={{ letterSpacing: '0.5px' }}>
                CONTINUE SHOPPING
              </Button>
            </>
          ) : (
            <>
              <ThemeIcon color="yellow" size={60} radius={60} variant="light">
                <IconAlertTriangle size={34} />
              </ThemeIcon>
              <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                Telemetry Syncing
              </Title>
              <Text size="sm" c="dimmed" style={{ textAlign: 'center' }}>
                Your order is securely logged. If the payment state doesn't show instantly, click below to re-ping the verification gateway.
              </Text>
              
              <Group grow style={{ width: '100%' }} mt="md" gap="xs">
                <Button 
                  variant="light"
                  color="yellow"
                  leftSection={<IconRefresh size={14} />}
                  loading={isRetrying}
                  onClick={() => checkPaymentStatus(true)}
                >
                  RE-VERIFY STATUS
                </Button>
                <Button component={Link} to="/" color="dark">
                  RETURN HOME
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}