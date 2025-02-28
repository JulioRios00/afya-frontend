import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
  OutlinedInput,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { useS3Upload } from '@/lib/s3';
import { Product, Category } from '@/types';

interface ProductFormProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (formData: Omit<Product, '_id'>) => Promise<void>;
}

export default function ProductForm({ open, product, categories, onClose, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, '_id'>>({
    name: '',
    description: '',
    price: '',
    category_ids: [],
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>({});
  
  const { uploadToS3 } = useS3Upload();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_ids: product.category_ids,
        image_url: product.image_url || ''
      });
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_ids: [],
      image_url: ''
    });
    setImageFile(null);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name as keyof Product]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    
    const categoryIds = typeof value === 'string' ? value.split(',') : value;
    
    setFormData({ ...formData, category_ids: categoryIds });
    
    if (errors.category_ids) {
      setErrors({ ...errors, category_ids: '' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      if (errors.image_url) {
        setErrors({ ...errors, image_url: '' });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Product, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
	}
}