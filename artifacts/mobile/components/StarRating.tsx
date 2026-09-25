import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StarRatingProps {
  value: number; // 0–5
  onValueChange?: (value: number) => void;
  size?: number;
  interactive?: boolean;
}

export function StarRating({
  value,
  onValueChange,
  size = 18,
  interactive = false,
}: StarRatingProps) {
  const colors = useColors();

  const starColor =
    value >= 4 ? colors.secondary : value >= 3 ? colors.primary : value > 0 ? colors.lowScore : colors.border;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => interactive && onValueChange?.(star)}
          disabled={!interactive}
          style={interactive ? styles.touchable : undefined}
          hitSlop={interactive ? 4 : 0}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? starColor : colors.border}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  touchable: {
    padding: 4,
  },
});
