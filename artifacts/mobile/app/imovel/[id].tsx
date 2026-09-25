import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGetImovel } from '@workspace/api-client-react';
import {
  Avaliacao,
  CATEGORIAS,
  Categoria,
  getMediaCategoria,
  getMediaGeral,
} from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewCard } from '@/components/ReviewCard';
import { StarRating } from '@/components/StarRating';

const CATEGORIA_LABELS: Record<Categoria, string> = {
  apartamento: 'Apartamento',
  condominio: 'Condomínio',
  proprietario: 'Proprietário',
  imobiliaria: 'Imobiliária',
};

function CategoryCell({
  categoria,
  media,
  colors,
}: {
  categoria: Categoria;
  media: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        cellStyles.cell,
        { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius },
      ]}
    >
      <Text style={[cellStyles.label, { color: colors.mutedForeground }]}>
        {CATEGORIA_LABELS[categoria]}
      </Text>
      {media > 0 ? (
        <>
          <Text style={[cellStyles.score, { color: colors.primary }]}>{media.toFixed(1)}</Text>
          <StarRating value={Math.round(media)} size={13} />
        </>
      ) : (
        <Text style={[cellStyles.noData, { color: colors.mutedForeground }]}>Sem dados</Text>
      )}
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: 'Inter_500Medium',
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  noData: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});

export default function ImovelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [filterCategory, setFilterCategory] = useState<Categoria | 'todas'>('todas');
  const [showFilter, setShowFilter] = useState(false);

  const imovelId = Number(id);
  const { data: imovel, isLoading } = useGetImovel(imovelId);
  const allReviews: Avaliacao[] = useMemo(() => imovel?.avaliacoes ?? [], [imovel]);

  const displayedReviews = useMemo(() => {
    if (filterCategory === 'todas') return allReviews;
    return allReviews.filter((r) => r.notas[filterCategory] !== undefined);
  }, [allReviews, filterCategory]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!imovel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.customHeader, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            {isLoading ? 'Carregando…' : 'Imóvel não encontrado.'}
          </Text>
        </View>
      </View>
    );
  }

  const handleAvaliar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!user) {
      router.push('/(auth)/login');
    } else {
      router.push(`/avaliar/${imovel.id}`);
    }
  };

  const mediaGeral = getMediaGeral(allReviews);

  const renderHeader = () => (
    <View>
      {/* Custom Header */}
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {imovel.nome}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]} numberOfLines={1}>
            {imovel.bairro} · {imovel.cidade}
          </Text>
        </View>
        <Pressable
          style={[styles.filterBtn, { borderColor: colors.border }]}
          onPress={() => setShowFilter(true)}
          hitSlop={8}
        >
          <Feather
            name="sliders"
            size={18}
            color={filterCategory !== 'todas' ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {/* Category Grid 2×2 */}
      <View style={[styles.section, { paddingHorizontal: 20, paddingTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Como é morar aqui?</Text>
        {allReviews.length > 0 && (
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Média geral {mediaGeral.toFixed(1)} · {allReviews.length}{' '}
            {allReviews.length === 1 ? 'avaliação' : 'avaliações'}
          </Text>
        )}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <CategoryCell
              categoria="apartamento"
              media={getMediaCategoria(allReviews, 'apartamento')}
              colors={colors}
            />
            <View style={{ width: 8 }} />
            <CategoryCell
              categoria="condominio"
              media={getMediaCategoria(allReviews, 'condominio')}
              colors={colors}
            />
          </View>
          <View style={{ height: 8 }} />
          <View style={styles.gridRow}>
            <CategoryCell
              categoria="proprietario"
              media={getMediaCategoria(allReviews, 'proprietario')}
              colors={colors}
            />
            <View style={{ width: 8 }} />
            <CategoryCell
              categoria="imobiliaria"
              media={getMediaCategoria(allReviews, 'imobiliaria')}
              colors={colors}
            />
          </View>
        </View>
      </View>

      {/* Reviews Section Title */}
      <View style={[styles.section, { paddingHorizontal: 20, paddingTop: 24 }]}>
        <View style={styles.reviewsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {filterCategory === 'todas'
              ? 'Avaliações'
              : `${CATEGORIA_LABELS[filterCategory as Categoria]}`}
          </Text>
          {filterCategory !== 'todas' && (
            <Pressable
              onPress={() => setFilterCategory('todas')}
              style={[styles.clearFilter, { borderColor: colors.border }]}
            >
              <Text style={[styles.clearFilterText, { color: colors.mutedForeground }]}>
                Limpar filtro
              </Text>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        {displayedReviews.length === 0 && (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Feather name="message-square" size={28} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhuma avaliação nesta categoria ainda.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayedReviews}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <ReviewCard review={item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: botPad + 100 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB — Avaliar */}
      <View style={[styles.fabContainer, { bottom: botPad + 20 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: 30 },
          ]}
          onPress={handleAvaliar}
        >
          <Feather name="edit-3" size={18} color={colors.primaryForeground} />
          <Text style={[styles.fabText, { color: colors.primaryForeground }]}>
            Avaliar este imóvel
          </Text>
        </Pressable>
      </View>

      {/* Filter Bottom Sheet */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilter(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.filterSheet,
            {
              backgroundColor: colors.card,
              paddingBottom: botPad + 16,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.filterTitle, { color: colors.foreground }]}>
            Filtrar avaliações
          </Text>
          <View style={styles.filterOptions}>
            {(['todas', ...CATEGORIAS.map((c) => c.key)] as Array<'todas' | Categoria>).map(
              (cat) => {
                const label = cat === 'todas' ? 'Todas as categorias' : CATEGORIA_LABELS[cat];
                const active = filterCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: active ? colors.primary : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                    onPress={() => {
                      setFilterCategory(cat);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: active ? colors.primaryForeground : colors.foreground },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
          <View style={styles.filterActions}>
            <Pressable
              style={[
                styles.filterActionBtn,
                styles.filterClearBtn,
                { borderColor: colors.border, borderRadius: colors.radius },
              ]}
              onPress={() => {
                setFilterCategory('todas');
                setShowFilter(false);
              }}
            >
              <Text style={[styles.filterActionText, { color: colors.mutedForeground }]}>
                Limpar filtro
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterActionBtn,
                styles.filterApplyBtn,
                { backgroundColor: colors.primary, borderRadius: colors.radius },
              ]}
              onPress={() => setShowFilter(false)}
            >
              <Text style={[styles.filterActionText, { color: colors.primaryForeground }]}>
                Aplicar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {},
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  sectionSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  grid: { marginTop: 8 },
  gridRow: { flexDirection: 'row' },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearFilterText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 24 },
  reviewItem: { paddingHorizontal: 20, marginBottom: 0 },
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    left: 20,
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43,43,40,0.4)',
  },
  filterSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  filterTitle: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  filterOptions: { gap: 8 },
  filterOption: {
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  filterOptionText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  filterActions: { flexDirection: 'row', gap: 10 },
  filterActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  filterClearBtn: { borderWidth: 1 },
  filterApplyBtn: {},
  filterActionText: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
