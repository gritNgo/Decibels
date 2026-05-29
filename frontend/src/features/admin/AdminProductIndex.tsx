import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import type { Product } from '../../types';
import {
  Container,
  Paper,
  Table,
  Title,
  Button,
  Group,
  Text,
  ActionIcon,
  Loader,
  Center,
  Alert,
  Image
} from '@mantine/core';
import { IconPlus, IconPencil, IconTrash, IconPackage } from '@tabler/icons-react';

export function AdminProductIndex() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const data = await catalogApi.getAdminProducts(controller.signal);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Failed to sync current product registry.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolutely certain you want to delete this product?')) {
      return;
    }

    setDeleteLoadingId(id);
    try {
      await catalogApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Product purging database fault.');
      }
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Group gap="sm">
          <Loader size="md" color="blue" />
          <Text size="sm" c="dimmed">Synchronizing system catalog tables...</Text>
        </Group>
      </Center>
    );
  }

  return (
    <Container size="lg" my="xl">
      <Group justify="space-between" mb="xl">
        <Group gap="sm">
          <IconPackage size={28} style={{ color: 'var(--mantine-color-blue-5)' }} />
          <Title order={2} fw={700} c="white" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Inventory 
          </Title>
        </Group>
        
        <Button
          component={Link}
          to="/admin/products/create"
          color="blue"
          leftSection={<IconPlus size={16} />}
          style={{ letterSpacing: '0.5px' }}
        >
          NEW PRODUCT 
        </Button>
      </Group>

      {error && (
        <Alert title="Catalog Operation Error" color="red" variant="filled" mb="lg" radius="md">
          {error}
        </Alert>
      )}

      <Paper radius="md" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)', overflow: 'hidden' }}>
        {products.length === 0 ? (
          <Center p="xl" style={{ minHeight: '200px' }}>
            <Text c="dimmed" size="sm">No product asset traces registered in database storage schemas.</Text>
          </Center>
        ) : (
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover variant="unstyled">
            <Table.Thead style={{ backgroundColor: 'var(--mantine-color-dark-8)', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
              <Table.Tr>
                <Table.Th style={{ color: 'var(--mantine-color-dark-2)' }} w={80}>Image</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-dark-2)' }}>Product Name</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-dark-2)' }}>Category</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-dark-2)' }} ta="right">Unit Price</Table.Th>
                <Table.Th style={{ color: 'var(--mantine-color-dark-2)' }} ta="center" w={100}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((product) => (
                <Table.Tr key={product.id} style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
                  <Table.Td>
                    <Image
                      src={product.imageUrl || 'https://placehold.co/600x400/1a1a1a/FFF?text=No+Image'}
                      alt={product.name}
                      w={44}
                      h={44}
                      radius="sm"
                      fallbackSrc="https://placehold.co/600x400/1a1a1a/FFF?text=No+Image"
                      style={{ objectFit: 'cover', border: '1px solid var(--mantine-color-dark-5)' }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} c="white">
                      {product.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {product.category?.name || `ID: ${product.categoryId}`}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} color="blue.4">
                      €{product.price.toFixed(2)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <ActionIcon
                        component={Link}
                        to={`/admin/products/edit/${product.id}`}
                        variant="subtle"
                        color="blue"
                        size="sm"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        loading={deleteLoadingId === product.id}
                        onClick={() => handleDelete(product.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}