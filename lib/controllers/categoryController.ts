import api from '@/lib/api';
import { Category } from '@/types';
import { Dispatch, SetStateAction } from 'react';

const apiMethods = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await api.post<Category>('/categories', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    try {
      const response = await api.put<Category>(`/categories/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};


type NotificationState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};


export const categoryController = {
  ...apiMethods,

  fetchCategories: async (
    setCategories: Dispatch<SetStateAction<Category[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      const data = await apiMethods.getCategories();
      setCategories(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to load categories',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  },
  

  saveCategory: async (
    categoryName: string,
    editingCategory: Category | null,
    categories: Category[],
    setCategories: Dispatch<SetStateAction<Category[]>>,
    setOpenForm: Dispatch<SetStateAction<boolean>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ): Promise<boolean> => {
    if (!categoryName.trim()) {
      return false;
    }

    try {
      if (editingCategory) {

        const updatedCategory = await apiMethods.updateCategory(
          editingCategory._id, 
          categoryName
        );
        setCategories(categories.map(cat => 
          cat._id === editingCategory._id ? updatedCategory : cat
        ));
        setNotification({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      } else {

        const newCategory = await apiMethods.createCategory(categoryName);
        setCategories([...categories, newCategory]);
        setNotification({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
      }
      
      setOpenForm(false);
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to save category',
        severity: 'error'
      });
      return false;
    }
  },
  
  deleteCategory: async (
    id: string,
    categories: Category[],
    setCategories: Dispatch<SetStateAction<Category[]>>,
    setNotification: Dispatch<SetStateAction<NotificationState>>
  ) => {
    try {
      await apiMethods.deleteCategory(id);
      setCategories(categories.filter(category => category._id !== id));
      setNotification({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete category',
        severity: 'error'
      });
      return false;
    }
  }
};