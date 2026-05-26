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
  Stack 
} from '@mantine/core';
import { IconLock, IconMail, IconAlertCircle } from '@tabler/icons-react';

export function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

// 1. Swapped React.FormEvent with React.SyntheticEvent to satisfy React 19 typings
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await catalogApi.login({ email, password });
      
      if (response.isAuthSuccessful) {
        login({
          token: response.token,
          email: response.email,
          role: response.role
        });
        navigate('/'); 
      }
    } catch (err: unknown) { // 2. Shifted from 'any' to 'unknown'
      // Gracefully extract message from unknown type safely
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid transactional tracking handshake configuration parameters.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" my={60}>
      <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Stack gap="xs" align="center" mb="lg">
          <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', tracking: '-0.5px' }}>
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
      </Paper>
    </Container>
  );
}