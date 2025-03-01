import api from '@/lib/api';
import { Order, Product } from '@/types';
import { Dispatch, SetStateAction } from 'react';

const apiMethods = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async createOrder(order: Omit<Order, '_id'>): Promise<Order> {
    try {
      const response = await api.post<Order>('/orders', order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async updateOrder(id: string, order: Omit<Order, '_id'>): Promise<Order> {
    try {
      const response = await api.put<Order>(`/orders/${id}`, order);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

export const orderController = {
  ...apiMethods,
  
  fetchOrders: async (
    setOrders: Dispatch<SetStateAction<Order[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      const data = await apiMethods.getOrders();
      setOrders(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to load orders',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  },
  
  saveOrder: async (
    formData: Omit<Order, '_id'>,
    editingOrder: Order | null,
    orders: Order[],
    setOrders: Dispatch<SetStateAction<Order[]>>,
    setOpenForm: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      if (editingOrder) {
        const updatedOrder = await apiMethods.updateOrder(editingOrder._id, formData);
        setOrders(orders.map(o => o._id === editingOrder._id ? updatedOrder : o));
        setNotification({
          open: true,
          message: 'Order updated successfully',
          severity: 'success'
        });
      } else {
        const newOrder = await apiMethods.createOrder(formData);
        setOrders([...orders, newOrder]);
        setNotification({
          open: true,
          message: 'Order created successfully',
          severity: 'success'
        });
      }
      setOpenForm(false);
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to save order',
        severity: 'error'
      });
      return false;
    }
  },
  
  deleteOrder: async (
    id: string,
    orders: Order[],
    setOrders: Dispatch<SetStateAction<Order[]>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      await apiMethods.deleteOrder(id);
      setOrders(orders.filter(order => order._id !== id));
      setNotification({
        open: true,
        message: 'Order deleted successfully',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete order',
        severity: 'error'
      });
      return false;
    }
  },
  
  calculateTotal: (productIds: string[], products: Product[]): string => {
    const total = productIds.reduce((sum, productId) => {
      const product = products.find(p => p._id === productId);
      return sum + (product ? parseFloat(product.price) : 0);
    }, 0);
    return total.toFixed(2);
  }
};