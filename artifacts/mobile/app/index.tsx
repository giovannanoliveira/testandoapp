import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListImoveis } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Imovel, fuzzySearch } from '@/data/mock';
import { SearchCard } from '@/components/SearchCard';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useFavorites } from '@/contexts/FavoritesContext';

const RECENTS_KEY = '@vizinhanca_recents';
const MAX_RECENTS = 5;

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: imoveis = [], isLoading } = useListImoveis();
  const [query, setQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    AsyncStorage.getItem(RECENTS_KEY).then((val) => {
      if (val) setRecentIds(JSON.parse(val) as string[]);
    });
  }, []);

  const saveRecent = useCallback(
    async (id: string) => {
      const updated = [id, ...recentIds.filter((r) => r !== id)].slice(0, MAX_RECENTS);
      setRecentIds(updated);
      await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    },
    [recentIds],
  );

  const filteredResults = useMemo<Imovel[]>(() => {
    if (!query.trim()) return imoveis;
    return fuzzySearch(query, imoveis);
  }, [query, imoveis]);

  const showFuzzy = query.trim().length > 0 && filteredResults.length === 0 && !isLoading;
  const topFuzzy = useMemo(() => {
    if (!showFuzzy) return [];
    return fuzzySearch(query, imoveis).slice(0, 3);
  }, [showFuzzy, query, imoveis]);

  const recentImoveis = useMemo(
    () =>
      recentIds
        .map((id) => imoveis.find((i) => String(i.id) === id))
        .filter(Boolean) as Imovel[],
    [recentIds, imoveis],
  );

  const handleSelect = (imovel: Imovel) => {
    saveRecent(String(imovel.id));
    router.push(`/imovel/${imovel.id}`);
  };

  const handleToggleFavorite = async (id: number) => {
    const result = await toggleFavorite(id);
    if (result === 'limit') {
      Alert.alert(
        'Limite da comparação',
        'Você pode comparar até 4 imóveis por vez. Remova um coração para escolher outro.',
      );
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: topPad + 24 }]}>
      {/* Wordmark */}
      <Text style={[styles.wordmark, { color: colors.primary }]}>Vizinhança Real</Text>
      <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
        Descubra como é realmente morar ali antes de assinar.
      </Text>

      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.card,
            borderColor: query ? colors.secondary : colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="search" size={18} color={colors.secondary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          placeholder="Buscar endereço ou condomínio"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {favoriteIds.length > 0 && (
        <Pressable
          disabled={favoriteIds.length < 2}
          onPress={() => router.push('/comparar')}
          style={({ pressed }) => [
            styles.compareBanner,
            {
              backgroundColor: colors.accent,
              borderRadius: colors.radius,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View style={[styles.compareIcon, { backgroundColor: colors.card }]}>
            <Feather name="heart" size={17} color={colors.primary} />
          </View>
          <View style={styles.compareCopy}>
            <Text style={[styles.compareTitle, { color: colors.primary }]}>
              {favoriteIds.length < 2
                ? 'Escolha mais 1 imóvel'
                : `Comparar ${favoriteIds.length} imóveis`}
            </Text>
            <Text style={[styles.compareSubtitle, { color: colors.mutedForeground }]}>
              Veja os pontos positivos e negativos lado a lado
            </Text>
          </View>
          <Feather
            name={favoriteIds.length < 2 ? 'plus' : 'arrow-right'}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      )}

      {/* Section title */}
      {!query && recentImoveis.length > 0 && (
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Buscas recentes
        </Text>
      )}
      {!query && recentImoveis.length === 0 && (
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Todos os imóveis
        </Text>
      )}
      {query.length > 0 && filteredResults.length > 0 && (
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {filteredResults.length} {filteredResults.length === 1 ? 'resultado' : 'resultados'}
        </Text>
      )}

      {/* Fuzzy empty state */}
      {showFuzzy && (
        <View style={styles.fuzzyState}>
          <Text style={[styles.fuzzyTitle, { color: colors.foreground }]}>
            Nenhum resultado exato
          </Text>
          <Text style={[styles.fuzzySubtitle, { color: colors.mutedForeground }]}>
            Você quis dizer um desses?
          </Text>
          {topFuzzy.map((imovel) => (
            <Pressable
              key={imovel.id}
              onPress={() => handleSelect(imovel)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <SearchCard
                imovel={imovel}
                isFavorite={isFavorite(Number(imovel.id))}
                onToggleFavorite={() => handleToggleFavorite(Number(imovel.id))}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  const data = query ? filteredResults : recentImoveis.length > 0 ? recentImoveis : imoveis;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={showFuzzy ? [] : data}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.cardWrapper, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleSelect(item)}
          >
            <SearchCard
              imovel={item}
              isFavorite={isFavorite(Number(item.id))}
              onToggleFavorite={() => handleToggleFavorite(Number(item.id))}
            />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 168 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEnabled
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir assistente"
        onPress={() => router.push('/assistente')}
        style={({ pressed }) => [
          styles.assistantButton,
          {
            bottom: botPad + 88,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Feather name="message-circle" size={22} color={colors.primaryForeground} />
        <Text style={[styles.assistantLabel, { color: colors.primaryForeground }]}>
          Pergunte
        </Text>
      </Pressable>
      <BottomTabBar activeTab="explorar" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
  cardWrapper: {},
  assistantButton: {
    position: 'absolute',
    right: 20,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  assistantLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  compareBanner: {
    minHeight: 72,
    padding: 13,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  compareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareCopy: { flex: 1, gap: 2 },
  compareTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  compareSubtitle: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular' },
  fuzzyState: {
    gap: 10,
    marginTop: 8,
  },
  fuzzyTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  fuzzySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
});
