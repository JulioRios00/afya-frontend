import api from '@/lib/api';
import { Product } from '@/types';
import { Dispatch, SetStateAction } from 'react';

const apiMethods = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(product: Omit<Product, '_id'>): Promise<Product> {
    try {
      const response = await api.post<Product>('/products', product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: Omit<Product, '_id'>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

export const productController = {
  ...apiMethods,
  
  fetchProducts: async (
    setProducts: Dispatch<SetStateAction<Product[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      const data = await apiMethods.getProducts();
      setProducts(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to load products',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  },
  
  saveProduct: async (
    formData: Omit<Product, '_id'>,
    editingProduct: Product | null,
    products: Product[],
    setProducts: Dispatch<SetStateAction<Product[]>>,
    setOpenForm: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      if (editingProduct) {
        const response = await apiMethods.updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? response : p));
        setNotification({
          open: true,
          message: 'Product updated successfully',
          severity: 'success'
        });
      } else {
        const response = await apiMethods.createProduct(formData);
        setProducts([...products, response]);
        setNotification({
          open: true,
          message: 'Product created successfully',
          severity: 'success'
        });
      }
      setOpenForm(false);
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to save product',
        severity: 'error'
      });
      return false;
    }
  },
  
  deleteProduct: async (
    id: string,
    products: Product[],
    setProducts: Dispatch<SetStateAction<Product[]>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      await apiMethods.deleteProduct(id);
      setProducts(products.filter(product => product._id !== id));
      setNotification({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete product',
        severity: 'error'
      });
      return false;
    }
  }
};