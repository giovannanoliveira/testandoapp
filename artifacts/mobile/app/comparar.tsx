import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompareImoveis } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function CompararScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteIds, clearFavorites } = useFavorites();
  const comparison = useCompareImoveis();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (favoriteIds.length >= 2) {
      comparison.mutate({ data: { imovelIds: favoriteIds } });
    }
    // The selection is intentionally the only trigger for a fresh comparison.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteIds]);

  const retry = () => comparison.mutate({ data: { imovelIds: favoriteIds } });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Comparar imóveis</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {favoriteIds.length} selecionados
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Limpar comparação"
          onPress={async () => {
            await clearFavorites();
            router.back();
          }}
          hitSlop={10}
        >
          <Feather name="trash-2" size={19} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {favoriteIds.length < 2 ? (
        <View style={styles.centered}>
          <Feather name="heart" size={32} color={colors.secondary} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Escolha pelo menos 2 imóveis
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Toque no coração dos cards da busca para montar sua comparação.
          </Text>
        </View>
      ) : comparison.isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Lendo as avaliações e comparando…
          </Text>
        </View>
      ) : comparison.isError || !comparison.data ? (
        <View style={styles.centered}>
          <Feather name="alert-circle" size={30} color={colors.lowScore} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Não foi possível comparar agora
          </Text>
          <Pressable
            onPress={retry}
            style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.overview,
              { backgroundColor: colors.accent, borderRadius: colors.radius },
            ]}
          >
            <View style={styles.overviewLabel}>
              <Feather name="compass" size={16} color={colors.primary} />
              <Text style={[styles.eyebrow, { color: colors.primary }]}>VISÃO GERAL</Text>
            </View>
            <Text style={[styles.overviewText, { color: colors.foreground }]}>
              {comparison.data.visaoGeral}
            </Text>
            <View style={[styles.recommendation, { borderTopColor: colors.secondary }]}>
              <Feather name="check-circle" size={18} color={colors.primary} />
              <Text style={[styles.recommendationText, { color: colors.primary }]}>
                {comparison.data.recomendacao}
              </Text>
            </View>
          </View>

          {comparison.data.imoveis.map((imovel, index) => (
            <View
              key={imovel.id}
              style={[
                styles.propertyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.propertyHeader}>
                <View style={styles.propertyTitleWrap}>
                  <Text style={[styles.propertyIndex, { color: colors.secondary }]}>
                    OPÇÃO {index + 1}
                  </Text>
                  <Text style={[styles.propertyName, { color: colors.foreground }]}>
                    {imovel.nome}
                  </Text>
                  <Text style={[styles.address, { color: colors.mutedForeground }]}>
                    {imovel.endereco}
                  </Text>
                </View>
                <View style={[styles.score, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>
                    {imovel.mediaGeral > 0 ? imovel.mediaGeral.toFixed(1) : '—'}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>média</Text>
                </View>
              </View>

              <View style={styles.insightBlock}>
                <View style={styles.insightTitle}>
                  <Feather name="thumbs-up" size={15} color={colors.secondary} />
                  <Text style={[styles.insightHeading, { color: colors.foreground }]}>
                    Pontos positivos
                  </Text>
                </View>
                {imovel.pontosPositivos.map((item) => (
                  <Text key={item} style={[styles.bullet, { color: colors.mutedForeground }]}>
                    • {item}
                  </Text>
                ))}
              </View>

              <View style={styles.insightBlock}>
                <View style={styles.insightTitle}>
                  <Feather name="alert-triangle" size={15} color={colors.lowScore} />
                  <Text style={[styles.insightHeading, { color: colors.foreground }]}>
                    Pontos de atenção
                  </Text>
                </View>
                {imovel.pontosNegativos.map((item) => (
                  <Text key={item} style={[styles.bullet, { color: colors.mutedForeground }]}>
                    • {item}
                  </Text>
                ))}
              </View>

              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                Baseado em {imovel.totalAvaliacoes}{' '}
                {imovel.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
              </Text>
            </View>
          ))}

          <Text style={[styles.aiNote, { color: colors.mutedForeground }]}>
            {comparison.data.geradoPorIa
              ? 'Resumo gerado por IA com base nas avaliações publicadas.'
              : 'Resumo objetivo com base nas avaliações publicadas.'}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  centered: {
    flex: 1,
    paddingHorizontal: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  retryButton: { paddingHorizontal: 20, paddingVertical: 12, marginTop: 6 },
  retryText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 20, gap: 14 },
  overview: { padding: 18, gap: 12 },
  overviewLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  eyebrow: { fontSize: 11, letterSpacing: 0.7, fontFamily: 'Inter_600SemiBold' },
  overviewText: { fontSize: 16, lineHeight: 24, fontFamily: 'Inter_500Medium' },
  recommendation: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  recommendationText: { flex: 1, fontSize: 13, lineHeight: 19, fontFamily: 'Inter_600SemiBold' },
  propertyCard: { borderWidth: 1, padding: 17, gap: 16 },
  propertyHeader: { flexDirection: 'row', gap: 14 },
  propertyTitleWrap: { flex: 1, gap: 3 },
  propertyIndex: { fontSize: 10, letterSpacing: 0.7, fontFamily: 'Inter_600SemiBold' },
  propertyName: { fontSize: 17, lineHeight: 22, fontFamily: 'Inter_600SemiBold' },
  address: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  score: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  scoreLabel: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  insightBlock: { gap: 7 },
  insightTitle: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  insightHeading: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  bullet: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular', paddingLeft: 2 },
  reviewCount: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  aiNote: { fontSize: 11, lineHeight: 16, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});