// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useOrders = () => {
  const { userInfo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userInfo?.phone_number) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderApi.getUserOrders(userInfo.phone_number);
      setOrders(fetchedOrders);
      return fetchedOrders;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.phone_number]);

  const createOrder = useCallback(async (cartItems) => {

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        phone_number: userInfo.phone_number,
        cart_items: cartItems.map(item => ({
          color: item.id,
          quantity: item.quantity
        }))
      };

      const newOrder = await orderApi.createOrder(orderData);
      setOrders(current => [newOrder, ...current]);
      return newOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userInfo?.phone_number]);

  // Fetch orders on user auth change
  useEffect(() => {
    if (userInfo?.phone_number) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [userInfo?.phone_number, fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder
  };
};