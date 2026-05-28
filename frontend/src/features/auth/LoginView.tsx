import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { catalogApi } from '../../api/catalog';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  PasswordInput, 
  Button, 
  Alert, 
  Stack,
  Divider,
  Group
} from '@mantine/core';
import { IconLock, IconMail, IconAlertCircle, IconUser, IconShieldLock } from '@tabler/icons-react';

export function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core authorization pipeline wrapper
  const executeAuthenticationFlow = async (targetEmail: string, targetPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.login({ email: targetEmail, password: targetPassword });
      
      if (response.isAuthSuccessful) {
        login({
          token: response.token,
          email: response.email,
          role: response.role
        });
        
        // Strategic redirection based on credentials matrix context
        if (response.role === 'Admin' || response.role === 'Employee') {
          navigate('/admin/orders');
        } else {
          navigate('/');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid transactional tracking handshake configuration parameters.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await executeAuthenticationFlow(email, password);
  };

// bypass mechanism to fast-track recruiter reviews
  const handleSandboxDemoBypass = async (role: 'Customer' | 'Admin') => {
    const demoEmail = role === 'Admin' 
      ? import.meta.env.VITE_DEMO_ADMIN_EMAIL 
      : import.meta.env.VITE_DEMO_BUYER_EMAIL;
      
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD; 

    await executeAuthenticationFlow(demoEmail, demoPassword);
  };

  return (
    <Container size="xs" my={60}>
      <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Stack gap="xs" align="center" mb="lg">
          <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Login
          </Title>
          <Text size="sm" c="dimmed">
            Access secure e-commerce persistence channels
          </Text>
        </Stack>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Authentication Failure" color="red" variant="filled" mb="md" radius="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              required
              label="Email Address"
              placeholder="name@example.com"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={loading}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your secure account password"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={loading}
            />

            <Button 
              type="submit" 
              color="blue" 
              size="md" 
              radius="md" 
              mt="md"
              loading={loading}
              fullWidth
            >
              SIGN IN
            </Button>
          </Stack>
        </form>

        {/* RECRUITER / ARCHITECT EVALUATION PORTAL BYPASS BLOCK */}
        <Divider label="RECRUITER / ARCHITECT EVALUATION PORTAL" labelPosition="center" my="xl" />

        <Paper p="sm" radius="md" bg="dark.8" withBorder style={{ borderColor: 'var(--mantine-color-yellow-8)' }}>
          <Text size="xs" c="yellow.5" mb="md" fw={500} style={{ textAlign: 'center', lineHeight: '1.4' }}>
            Execute rapid end-to-end technical reviews using pre-seeded infrastructure accounts:
          </Text>
          
          <Group grow gap="xs">
            <Button 
              variant="light" 
              color="blue" 
              size="xs"
              radius="sm"
              leftSection={<IconUser size={14} />}
              loading={loading}
              onClick={() => handleSandboxDemoBypass('Customer')}
            >
              Demo Customer
            </Button>
            
            <Button 
              variant="light" 
              color="red" 
              size="xs"
              radius="sm"
              leftSection={<IconShieldLock size={14} />}
              loading={loading}
              onClick={() => handleSandboxDemoBypass('Admin')}
            >
              Demo Admin
            </Button>
          </Group>
        </Paper>
      </Paper>
    </Container>
  );
}