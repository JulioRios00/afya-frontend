'use client';

import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, 
  CircularProgress, Snackbar, Alert 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProductsTable from '@/components/products/ProductsTable';
import ProductForm from '@/components/products/ProductForm';
import api from '@/lib/api';
import { Product, Category } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get<Product[]>('/products'),
          api.get<Category[]>('/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotification({
          open: true,
          message: 'Failed to load data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        setNotification({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        setNotification({
          open: true,
          message: 'Failed to delete product',
          severity: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (formData: Omit<Product, '_id'>) => {
    try {
      if (editingProduct) {
        const response = await api.put<Product>(`/products/${editingProduct._id}`, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
        setNotification({
          open: true,
          message: 'Product updated successfully',
          severity: 'success'
        });
      } else {
        const response = await api.post<Product>('/products', formData);
        setProducts([...products, response.data]);
        setNotification({
          open: true,
          message: 'Product created successfully',
          severity: 'success'
        });
      }
      setOpenForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setNotification({
        open: true,
        message: 'Failed to save product',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Products
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add New Product
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ProductsTable 
            products={products} 
            categories={categories}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        <ProductForm 
          open={openForm}
          product={editingProduct}
          categories={categories}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
        />

        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}