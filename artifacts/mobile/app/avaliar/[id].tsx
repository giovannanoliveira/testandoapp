import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetImovelQueryKey,
  getListAvaliacoesQueryKey,
  getListImoveisQueryKey,
  useCreateAvaliacao,
  useGetImovel,
} from '@workspace/api-client-react';
import { CATEGORIAS, Categoria, NotaCategoria } from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import { StarRating } from '@/components/StarRating';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

const CATEGORIA_LABELS: Record<Categoria, string> = {
  apartamento: 'Apartamento',
  condominio: 'Condomínio',
  proprietario: 'Proprietário',
  imobiliaria: 'Imobiliária',
};

type NotasState = Partial<Record<Categoria, NotaCategoria>>;

export default function AvaliarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const imovelId = Number(id);
  const { data: imovel } = useGetImovel(imovelId);
  const createAvaliacao = useCreateAvaliacao();

  const [notas, setNotas] = useState<NotasState>({});
  const [oQueGostaria, setOQueGostaria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const setNota = (categoria: Categoria, nota: number) => {
    Haptics.selectionAsync();
    setNotas((prev) => ({
      ...prev,
      [categoria]: { ...(prev[categoria] ?? {}), nota },
    }));
  };

  const setComentario = (categoria: Categoria, comentario: string) => {
    setNotas((prev) => ({
      ...prev,
      [categoria]: { ...(prev[categoria] ?? { nota: 0 }), comentario },
    }));
  };

  const isValid =
    Object.values(notas).some((n) => n && n.nota > 0) && oQueGostaria.trim().length >= 20;

  const handleSubmit = async () => {
    if (!isValid || !user || isSubmitting) return;
    setIsSubmitting(true);

    const cleanNotas: Partial<Record<Categoria, NotaCategoria>> = {};
    CATEGORIAS.forEach(({ key }) => {
      const n = notas[key];
      if (n && n.nota > 0) cleanNotas[key] = n;
    });

    try {
      await createAvaliacao.mutateAsync({
        data: {
          imovelId,
          notas: cleanNotas,
          oQueGostariaDeSaber: oQueGostaria.trim(),
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetImovelQueryKey(imovelId) }),
        queryClient.invalidateQueries({ queryKey: getListImoveisQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListAvaliacoesQueryKey() }),
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar a avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
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
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nova avaliação</Text>
          {imovel && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {imovel.nome}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Avalie cada aspecto do imóvel. Pelo menos uma categoria é obrigatória.
        </Text>

        {/* Category Ratings */}
        {CATEGORIAS.map(({ key }) => {
          const nota = notas[key]?.nota ?? 0;
          const comentario = notas[key]?.comentario ?? '';
          return (
            <View
              key={key}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: nota > 0 ? colors.secondary : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
                  {CATEGORIA_LABELS[key]}
                </Text>
                <StarRating value={nota} onValueChange={(v) => setNota(key, v)} size={26} interactive />
              </View>
              {nota > 0 && (
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.input,
                      borderRadius: colors.radius - 4,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder={`Comentário sobre ${CATEGORIA_LABELS[key].toLowerCase()} (opcional, máx. 500 caracteres)`}
                  placeholderTextColor={colors.mutedForeground}
                  value={comentario}
                  onChangeText={(t) => setComentario(key, t)}
                  multiline
                  maxLength={500}
                  returnKeyType="done"
                />
              )}
            </View>
          );
        })}

        {/* O que eu gostaria de saber — required highlight block */}
        <View
          style={[
            styles.highlightCard,
            {
              backgroundColor: colors.accent + '50',
              borderColor: colors.secondary,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.highlightLabel, { color: colors.accentForeground }]}>
            O que você gostaria de saber antes de alugar?
          </Text>
          <Text style={[styles.highlightHint, { color: colors.mutedForeground }]}>
            Obrigatório · mínimo 20 caracteres
          </Text>
          <TextInput
            style={[
              styles.highlightInput,
              {
                color: colors.foreground,
                borderColor: colors.secondary,
                borderRadius: colors.radius - 4,
                backgroundColor: colors.card,
              },
            ]}
            placeholder="Ex: O elevador quebra com frequência. A pressão d'água no 10º andar é fraca de manhã…"
            placeholderTextColor={colors.mutedForeground}
            value={oQueGostaria}
            onChangeText={setOQueGostaria}
            multiline
            returnKeyType="done"
          />
          <Text
            style={[
              styles.charCount,
              {
                color: oQueGostaria.length < 20 ? colors.lowScore : colors.secondary,
              },
            ]}
          >
            {oQueGostaria.length} caracteres {oQueGostaria.length < 20 ? `(faltam ${20 - oQueGostaria.length})` : ''}
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: isValid ? colors.primary : colors.muted,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          <Text
            style={[
              styles.submitText,
              { color: isValid ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {isSubmitting ? 'Publicando…' : 'Publicar avaliação'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {},
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  intro: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  categoryCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  commentInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'Inter_400Regular',
  },
  highlightCard: {
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    lineHeight: 20,
  },
  highlightHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  highlightInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Inter_400Regular',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  submitBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
