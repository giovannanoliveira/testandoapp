import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avaliacao, Imovel, getMediaGeral } from '@/data/mock';
import { StarRating } from './StarRating';

interface SearchCardProps {
  imovel: Imovel;
  extraReviews?: Avaliacao[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function SearchCard({
  imovel,
  extraReviews = [],
  isFavorite = false,
  onToggleFavorite,
}: SearchCardProps) {
  const colors = useColors();
  const allReviews = [...imovel.avaliacoes, ...extraReviews];
  const media = getMediaGeral(allReviews);
  const n = allReviews.length;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '12' }]}>
        <Feather name="home" size={20} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.nome, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {imovel.nome}
        </Text>
        <Text
          style={[styles.endereco, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {imovel.endereco} · {imovel.bairro}
        </Text>
        {n > 0 && (
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(media)} size={12} />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
              {media.toFixed(1)} · {n} {n === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </View>
        )}
        {n === 0 && (
          <Text style={[styles.noReview, { color: colors.mutedForeground }]}>
            Sem avaliações ainda
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onToggleFavorite && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remover da comparação' : 'Adicionar à comparação'}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
          >
            <Feather
              name="heart"
              size={20}
              color={isFavorite ? colors.lowScore : colors.mutedForeground}
              fill={isFavorite ? colors.lowScore : 'transparent'}
            />
          </Pressable>
        )}
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  nome: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  endereco: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  noReview: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
});
