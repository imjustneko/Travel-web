import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setFavorites([]); return; }
    try {
      setLoading(true);
      const res = await api.get('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.favorites || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const addFavorite = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      await api.post('/api/favorites', { itemId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFavorites();
      return true;
    } catch { return false; }
  };

  const removeFavorite = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      await api.delete(`/api/favorites/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(f => (f.item?._id || f.item) !== itemId));
      return true;
    } catch { return false; }
  };

  const isFavorite = (itemId) =>
    favorites.some(f => (f.item?._id || f.item) === itemId);

  const toggleFavorite = async (itemId) =>
    isFavorite(itemId) ? removeFavorite(itemId) : addFavorite(itemId);

  return { favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
};
