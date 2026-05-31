import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import type { ProductUpsertDTO, Product, Category } from '../../types';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  FileInput,
  Button,
  Stack,
  Alert,
  Loader,
  Center,
  Image,
  Text,
  Box
} from '@mantine/core';
import { IconArrowLeft, IconUpload, IconDeviceFloppy, IconPhoto } from '@tabler/icons-react';

export function ProductManagementForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [formLoading, setFormLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking baseline image URL from DB vs active client-side unsaved file preview
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [localFilePreviewUrl, setLocalFilePreviewUrl] = useState<string | null>(null);

  // Form State Layout
  const [formValues, setFormValues] = useState<ProductUpsertDTO>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageFile: null
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadFormContext() {
      try {
        const catData = await catalogApi.getCategories(controller.signal);
        const mappedCats = catData.map((c: Category) => ({ value: c.id.toString(), label: c.name }));
        setCategories(mappedCats);

        if (isEditMode) {
          const products = await catalogApi.getAdminProducts(controller.signal);
          const target = products.find((p: Product) => p.id === Number(id));
          if (target) {
            setFormValues({
              id: target.id,
              name: target.name,
              description: target.description || '',
              price: target.price,
              categoryId: target.categoryId.toString(),
              imageFile: null
            });
            setExistingImageUrl(target.imageUrl || null);
          } else {
            throw new Error('Target product asset reference missing from remote database.');
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Failed to populate contextual asset form frames.');
        }
      } finally {
        setFormLoading(false);
      }
    }

    loadFormContext();
    return () => controller.abort();
  }, [id, isEditMode]);

  // Clean listener to turn uploaded files into real-time visual streams
  const handleFileChange = (file: File | null) => {
    setFormValues(v => ({ ...v, imageFile: file }));
    
    // Revoke previous local object preview URLs cleanly to prevent application memory leaks
    if (localFilePreviewUrl) {
      URL.revokeObjectURL(localFilePreviewUrl);
      setLocalFilePreviewUrl(null);
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLocalFilePreviewUrl(objectUrl);
    }
  };

  // Lifecycle teardown to completely wipe generated preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (localFilePreviewUrl) URL.revokeObjectURL(localFilePreviewUrl);
    };
  }, [localFilePreviewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.name || !formValues.categoryId || formValues.price <= 0) {
      setError('Please validate initialization parameters. Price must exceed zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await catalogApi.upsertProduct(formValues);
      navigate('/admin/products');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Database write processing crash.');
      } else {
        setError('An unknown system error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Stack align="center">
          <Loader size="xl" type="bars" color="blue" />
          <Title order={4} c="dimmed">Assembling remote schema constraints...</Title>
        </Stack>
      </Center>
    );
  }

  // Choose preview source: prioritizes new modifications over existing database records
  const activePreviewUrl = localFilePreviewUrl || existingImageUrl;

  return (
    <Container size="sm" my="xl">
      <Button
        component={Link}
        to="/admin/products"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        c="dimmed"
        mb="lg"
      >
        BACK TO INVENTORY
      </Button>

      <Paper radius="md" p="xl" withBorder bg="dark.7" style={{ borderColor: 'var(--mantine-color-dark-4)' }}>
        <Title order={2} fw={700} c="white" mb="xl" style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          {isEditMode ? 'Edit Product' : 'New Product'}
        </Title>

        {error && (
          <Alert title="Validation/Write Fault" color="red" variant="filled" mb="lg" radius="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            
            {/* REAL-TIME DYNAMIC IMAGE PREVIEW PANEL */}
            <Box style={{ border: '1px dashed var(--mantine-color-dark-4)', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }} bg="dark.8" p="md">
              
              {activePreviewUrl ? (
                <Center style={{ flexDirection: 'column' }}>
                  <Image
                    src={activePreviewUrl}
                    alt="Active media asset state"
                    h={200}
                    w="auto"
                    radius="sm"
                    fit="contain"
                    fallbackSrc="https://placehold.co/600x400/1a1a1a/FFF?text=Error+Loading+Media+Asset"
                  />
                </Center>
              ) : (
                <Center style={{ height: '150px', flexDirection: 'column' }}>
                  <IconPhoto size={40} style={{ color: 'var(--mantine-color-dark-4)' }} stroke={1.5} />
                  <Text size="xs" c="dimmed" mt="xs">
                    No image 
                  </Text>
                </Center>
              )}
            </Box>

            <TextInput
              label="Product Name"
              placeholder="e.g., Shure SM7B Custom Variant"
              required
              value={formValues.name}
              onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))}
            />

            <Select
              label="Category"
              placeholder="Select target structural category"
              required
              data={categories}
              value={formValues.categoryId}
              onChange={(val) => setFormValues(v => ({ ...v, categoryId: val || '' }))}
            />

            <NumberInput
              label="Price (€)"
              placeholder="199.99"
              required
              min={0.01}
              decimalScale={2}
              fixedDecimalScale
              hideControls
              value={formValues.price}
              onChange={(val) => setFormValues(v => ({ ...v, price: Number(val) }))}
            />

            <Textarea
              label="Description"
              placeholder="Provide clean HTML or string markdown documentation layouts for this audio device asset..."
              minRows={4}
              value={formValues.description}
              onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))}
            />

            <FileInput
              label="Image"
              placeholder={isEditMode ? "Leave empty to keep current image" : "Choose file..."}
              leftSection={<IconUpload size={16} />}
              accept="image/png,image/jpeg,image/webp"
              clearable
              value={formValues.imageFile}
              onChange={handleFileChange} // Wired up to the clean state proxy stream pipeline
            />

            <Button
              type="submit"
              color="blue"
              size="md"
              mt="md"
              loading={isSubmitting}
              leftSection={<IconDeviceFloppy size={18} />}
              fullWidth
            >
              SAVE
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}