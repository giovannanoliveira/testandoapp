import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FAVORITES_KEY = '@vizinhanca_favorites';
export const MAX_COMPARE_PROPERTIES = 4;

type ToggleResult = 'added' | 'removed' | 'limit';

interface FavoritesContextValue {
  favoriteIds: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => Promise<ToggleResult>;
  clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((value) => {
      if (!value) return;
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((id): id is number => typeof id === 'number'));
      }
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite: async (id) => {
        if (!favoriteIds.includes(id) && favoriteIds.length >= MAX_COMPARE_PROPERTIES) {
          return 'limit';
        }
        const updated = favoriteIds.includes(id)
          ? favoriteIds.filter((favoriteId) => favoriteId !== id)
          : [...favoriteIds, id];
        setFavoriteIds(updated);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        return favoriteIds.includes(id) ? 'removed' : 'added';
      },
      clearFavorites: async () => {
        setFavoriteIds([]);
        await AsyncStorage.removeItem(FAVORITES_KEY);
      },
    }),
    [favoriteIds],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}