import { MantineProvider, Container, Title, Text } from '@mantine/core';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Container size="lg" style={{ marginTop: '2rem' }}>
        <Title order={1} c="blue.6">Decibels Client Engine</Title>
        <Text mt="md">Decoupled React TypeScript frontend connected to .NET 8 Web API.</Text>
      </Container>
    </MantineProvider>
  );
}

export default App;