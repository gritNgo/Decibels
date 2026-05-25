import { useEffect, useState } from 'react';
import { MantineProvider, Container, Title, Text, Badge, Stack } from '@mantine/core';
import '@mantine/core/styles.css';

function App() {
  const [apiStatus, setApiStatus] = useState<'testing' | 'connected' | 'blocked_by_cors'>('testing');
  const apiUrl = import.meta.env.VITE_API_URL;

useEffect(() => {
  // Target the public health check route to bypass authorization guards
  fetch(`${apiUrl}/api/connection`)
    .then((res) => {
      if (res.ok) setApiStatus('connected');
      else setApiStatus('blocked_by_cors');
    })
    .catch((err) => {
      console.error("API connection error:", err);
      setApiStatus('blocked_by_cors');
    });
}, [apiUrl]);

  return (
    <MantineProvider defaultColorScheme="dark">
      <Container size="lg" style={{ marginTop: '2rem' }}>
        <Stack gap="md">
          <Title order={1} c="blue.6">Decibels Client Engine</Title>
          <Text>Connected to environment endpoint: <code>{apiUrl}</code></Text>
          
          {apiStatus === 'testing' && <Badge color="yellow">Testing Bridge Connection...</Badge>}
          {apiStatus === 'connected' && <Badge color="green">Bridge Connected Successfully</Badge>}
          {apiStatus === 'blocked_by_cors' && (
            <Badge color="red">Connection Blocked or API Offline (Check CORS in Backend)</Badge>
          )}
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;