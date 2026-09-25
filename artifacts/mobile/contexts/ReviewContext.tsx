import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avaliacao } from '@/data/mock';

const REVIEWS_KEY = '@vizinhanca_reviews';

interface ReviewContextType {
  userReviews: Avaliacao[];
  addReview: (review: Avaliacao) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [userReviews, setUserReviews] = useState<Avaliacao[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(REVIEWS_KEY).then((value) => {
      if (value) setUserReviews(JSON.parse(value) as Avaliacao[]);
    });
  }, []);

  const addReview = useCallback(
    async (review: Avaliacao) => {
      const updated = [...userReviews, review];
      setUserReviews(updated);
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    },
    [userReviews],
  );

  return (
    <ReviewContext.Provider value={{ userReviews, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewProvider');
  return ctx;
}
