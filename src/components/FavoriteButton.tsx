'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { useAppSelector } from '@/store/hooks';

type FavoriteButtonProps = {
  type: 'trip' | 'car' | 'landmark';
  id: string;
  isFavorite: boolean;
  favoriteId?: string;
  onToggle?: (isFavorite: boolean) => void;
  className?: string;
  size?: number;
  variant?: 'overlay' | 'light';
};

export function FavoriteButton({
  type,
  id,
  isFavorite: initialFavorite,
  favoriteId: initialFavoriteId,
  onToggle,
  className = '',
  size = 24,
  variant = 'overlay',
}: FavoriteButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [favoriteId, setFavoriteId] = useState(initialFavoriteId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite);
    setFavoriteId(initialFavoriteId);
  }, [initialFavorite, initialFavoriteId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await api.delete(endpoints.favorites.remove(favoriteId));
        setIsFavorite(false);
        setFavoriteId(undefined);
        onToggle?.(false);
      } else {
        const body = type === 'trip' ? { tripId: id } : type === 'car' ? { carId: id } : { landmarkId: id };
        const { data } = await api.post(endpoints.favorites.add(), body);
        setIsFavorite(true);
        setFavoriteId(data.data?.id);
        onToggle?.(true);
      }
    } catch {
      // ignore - could show toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full p-1.5 transition-colors disabled:opacity-70 ${
        variant === 'light'
          ? 'hover:bg-slate-100 dark:hover:bg-slate-800'
          : 'hover:bg-white/20'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <Loader2
          size={size}
          strokeWidth={2}
          className={`animate-spin ${
            variant === 'light'
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-white'
          }`}
          aria-hidden
        />
      ) : (
        <Heart
          size={size}
          strokeWidth={2}
          className={
            isFavorite
              ? 'fill-red-500 text-red-500'
              : variant === 'light'
                ? 'text-slate-600 dark:text-slate-400'
                : 'text-white'
          }
          aria-hidden
        />
      )}
    </button>
  );
}
