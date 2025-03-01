'use client';

import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, 
  CircularProgress, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Grid, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Order, Product } from '@/types';
import { orderController } from '@/lib/controllers/orderController';
import { productController } from '@/lib/controllers/productController';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<{
    date: string;
    product_ids: string[];
    total: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    product_ids: [],
    total: '0.00'
  });
  const [formErrors, setFormErrors] = useState<{
    date?: string;
    product_ids?: string;
  }>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch products since we need them for order details
        await productController.fetchProducts(setProducts, setLoading, setNotification);
        await orderController.fetchOrders(setOrders, setLoading, setNotification);
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
    setEditingOrder(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      product_ids: [],
      total: '0.00'
    });
    setFormErrors({});
    setOpenForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      date: order.date,
      product_ids: order.product_ids,
      total: order.total
    });
    setFormErrors({});
    setOpenForm(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await orderController.deleteOrder(id, orders, setOrders, setNotification);
    }
  };

  const handleProductSelectChange = (event: any) => {
    const selectedProductIds = event.target.value as string[];
    const total = orderController.calculateTotal(selectedProductIds, products);
    
    setFormData({
      ...formData,
      product_ids: selectedProductIds,
      total
    });
    
    if (formErrors.product_ids) {
      setFormErrors({
        ...formErrors,
        product_ids: undefined
      });
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      date: event.target.value
    });
    
    if (formErrors.date) {
      setFormErrors({
        ...formErrors,
        date: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      date?: string;
      product_ids?: string;
    } = {};
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    if (formData.product_ids.length === 0) {
      errors.product_ids = 'Please select at least one product';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    await orderController.saveOrder(
      formData,
      editingOrder,
      orders,
      setOrders,
      setOpenForm,
      setNotification
    );
  };

  const getProductNames = (productIds: string[]): string => {
    return productIds.map(id => {
      const product = products.find(p => p._id === id);
      return product ? product.name : 'Unknown Product';
    }).join(', ');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Orders
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add New Order
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getProductNames(order.product_ids)}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditOrder(order)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Order Form Dialog */}
        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingOrder ? 'Edit Order' : 'Add New Order'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={formData.date}
                  onChange={handleDateChange}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total"
                  type="text"
                  fullWidth
                  value={`$${formData.total}`}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!formErrors.product_ids}
                >
                  <InputLabel id="products-select-label">Products</InputLabel>
                  <Select
                    labelId="products-select-label"
                    multiple
                    value={formData.product_ids}
                    onChange={handleProductSelectChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((productId) => {
                          const product = products.find(p => p._id === productId);
                          return (
                            <Chip 
                              key={productId} 
                              label={product ? product.name : 'Unknown'}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {products.map(product => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.name} - ${product.price}
                      </MenuItem>
                    ))}
                   </Select>
                  {formErrors.product_ids && (
                    <FormHelperText error>{formErrors.product_ids}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
