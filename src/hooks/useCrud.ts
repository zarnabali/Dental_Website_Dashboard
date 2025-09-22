import { useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UseCrudOptions {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useCrud = ({ endpoint, onSuccess, onError }: UseCrudOptions) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint);
      if (response.data.success) {
        setItems(response.data.data || []);
        onSuccess?.(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch items');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch items';
      setError(errorMessage);
      onError?.(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  const createItem = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(endpoint, data);
      if (response.data.success) {
        const newItem = response.data.data;
        setItems(prev => [newItem, ...prev]);
        onSuccess?.(response.data);
        toast.success('Item created successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create item';
      setError(errorMessage);
      onError?.(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  const updateItem = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`${endpoint}/${id}`, data);
      if (response.data.success) {
        const updatedItem = response.data.data;
        setItems(prev => prev.map(item => 
          item._id === id ? updatedItem : item
        ));
        onSuccess?.(response.data);
        toast.success('Item updated successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update item';
      setError(errorMessage);
      onError?.(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`${endpoint}/${id}`);
      if (response.data.success) {
        setItems(prev => prev.filter(item => item._id !== id));
        onSuccess?.(response.data);
        toast.success('Item deleted successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete item';
      setError(errorMessage);
      onError?.(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  const getItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${endpoint}/${id}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch item');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch item';
      setError(errorMessage);
      onError?.(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, onError]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
  };
};


