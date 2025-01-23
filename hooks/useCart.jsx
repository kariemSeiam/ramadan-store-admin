// hooks/useCart.js
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/api';

export const useCart = () => {
  const [items, setItems] = useState(() => storageService.getItem(storageService.keys.CART) || []);
  const [loading, setLoading] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    storageService.setItem(storageService.keys.CART, items);
  }, [items]);

  const addItem = useCallback((item) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (existingItem) {
        return currentItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...currentItems, item];
    });
  }, []);

  const updateQuantity = useCallback((index, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], quantity: newQuantity };
      return updated;
    });
  }, []);

  const removeItem = useCallback((index) => {
    setItems(current => current.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    storageService.removeItem(storageService.keys.CART);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  return {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal
  };
};
