import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Avaliacao, CATEGORIAS, Categoria, timeAgo } from '@/data/mock';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Avaliacao;
}

const CATEGORIA_LABELS: Record<Categoria, string> = {
  apartamento: 'Apartamento',
  condominio: 'Condomínio',
  proprietario: 'Proprietário',
  imobiliaria: 'Imobiliária',
};

export function ReviewCard({ review }: ReviewCardProps) {
  const colors = useColors();
  const ratedCategories = CATEGORIAS.filter((c) => review.notas[c.key] !== undefined);
  const ago = timeAgo(review.data);
  const isOld = ago.includes('antiga');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
            {review.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.userName, { color: colors.foreground }]}>{review.userName}</Text>
          <Text
            style={[
              styles.timeAgo,
              { color: isOld ? colors.lowScore : colors.mutedForeground },
            ]}
          >
            {ago}
          </Text>
        </View>
      </View>

      {/* Category Ratings */}
      {ratedCategories.map(({ key }) => {
        const notaData = review.notas[key];
        if (!notaData) return null;
        return (
          <View key={key} style={styles.categoryBlock}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryLabel, { color: colors.mutedForeground }]}>
                {CATEGORIA_LABELS[key]}
              </Text>
              <StarRating value={notaData.nota} size={13} />
            </View>
            {notaData.comentario ? (
              <Text style={[styles.comentario, { color: colors.foreground }]}>
                "{notaData.comentario}"
              </Text>
            ) : null}
          </View>
        );
      })}

      {/* O que eu gostaria de saber — highlight block */}
      <View
        style={[
          styles.highlightBlock,
          { backgroundColor: colors.accent + '60', borderColor: colors.secondary },
        ]}
      >
        <Text style={[styles.highlightLabel, { color: colors.accentForeground }]}>
          O que eu gostaria de saber antes de alugar
        </Text>
        <Text style={[styles.highlightText, { color: colors.foreground }]}>
          {review.oQueGostariaDeSaber}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  categoryBlock: {
    gap: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'Inter_500Medium',
  },
  comentario: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  highlightBlock: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'Inter_600SemiBold',
  },
  highlightText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
});
