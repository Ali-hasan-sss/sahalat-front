'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { useAppSelector } from '@/store/hooks';

export type FavoriteItem = {
  id: string;
  type: 'trip' | 'car' | 'landmark';
  trip?: { id: string; title: string; titleAr?: string | null; basePrice: number; durationDays: number; image?: string };
  car?: { id: string; name: string; nameAr?: string | null; basePricePerDay: number; image?: string };
  landmark?: { id: string; name: string; nameAr?: string | null; location?: string | null; image?: string };
};

export function useFavorites() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    api
      .get(endpoints.favorites.list())
      .then(({ data }) => setItems(data.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorited = useCallback(
    (type: 'trip' | 'car' | 'landmark', id: string) => {
      return items.some((f) => {
        if (type === 'trip') return f.trip?.id === id;
        if (type === 'car') return f.car?.id === id;
        return f.landmark?.id === id;
      });
    },
    [items]
  );

  const getFavoriteId = useCallback(
    (type: 'trip' | 'car' | 'landmark', id: string) => {
      const found = items.find((f) => {
        if (type === 'trip') return f.trip?.id === id;
        if (type === 'car') return f.car?.id === id;
        return f.landmark?.id === id;
      });
      return found?.id;
    },
    [items]
  );

  return { items, loading, refetch: fetchFavorites, isFavorited, getFavoriteId };
}
