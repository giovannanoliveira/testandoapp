import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useCreatePremiumCheckout,
  useGetPremiumStatus,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { BottomTabBar } from '@/components/BottomTabBar';

const benefits = [
  'Recursos premium para decidir com mais segurança',
  'Experiência sem interrupções durante sua pesquisa',
  'Acesso a conteúdos exclusivos da comunidade',
];

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const checkout = useCreatePremiumCheckout();
  const premiumStatus = useGetPremiumStatus();
  const isPremium = premiumStatus.data?.isPremium === true;

  const handleCheckout = async () => {
    if (isPremium) return;
    try {
      const session = await checkout.mutateAsync();
      await WebBrowser.openBrowserAsync(session.url);
      await premiumStatus.refetch();
    } catch {
      Alert.alert(
        'Pagamento indisponível',
        'Não foi possível abrir o checkout da Stripe. Tente novamente em instantes.',
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 28, paddingBottom: (insets.bottom || 12) + 104 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.secondary }]}>ESCOLHA SEU PLANO</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Mais confiança para escolher onde morar
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Tenha acesso ao Plano Premium e tome decisões melhores antes de assinar seu próximo
          contrato.
        </Text>

        <View
          style={[
            styles.planCard,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius + 4,
            },
          ]}
        >
          <View style={styles.planHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="star" size={22} color={colors.primary} />
            </View>
            <View style={styles.planHeaderCopy}>
              <Text style={[styles.planName, { color: colors.primaryForeground }]}>
                Plano Premium
              </Text>
              <Text style={[styles.planDescription, { color: colors.primaryForeground }]}>
                {isPremium ? 'Plano ativo' : 'Pagamento único'}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.currency, { color: colors.primaryForeground }]}>R$</Text>
            <Text style={[styles.price, { color: colors.primaryForeground }]}>19,90</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefits}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Feather name="check-circle" size={17} color={colors.accent} />
                <Text style={[styles.benefit, { color: colors.primaryForeground }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quero contratar o Plano Premium"
            disabled={checkout.isPending || isPremium}
            onPress={handleCheckout}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.accent,
                opacity: pressed || checkout.isPending ? 0.72 : 1,
              },
            ]}
          >
            {checkout.isPending ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.ctaText, { color: colors.primary }]}>
                  {isPremium ? 'Premium ativo' : 'Quero contratar'}
                </Text>
                <Feather
                  name={isPremium ? 'check' : 'arrow-right'}
                  size={18}
                  color={colors.primary}
                />
              </>
            )}
          </Pressable>
        </View>

        <View style={[styles.securityNote, { backgroundColor: colors.card }]}>
          <Feather name="shield" size={19} color={colors.secondary} />
          <Text style={[styles.securityText, { color: colors.mutedForeground }]}>
            {isPremium
              ? 'Seu pagamento foi confirmado e o Plano Premium está ativo.'
              : 'Pagamento processado com segurança pela Stripe. Você não precisa compartilhar seus dados de cartão com o aplicativo.'}
          </Text>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="planos" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  title: {
    maxWidth: 340,
    fontSize: 29,
    lineHeight: 35,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
  },
  planCard: {
    padding: 20,
    gap: 18,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeaderCopy: { gap: 2 },
  planName: {
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
  },
  planDescription: {
    fontSize: 12,
    opacity: 0.76,
    fontFamily: 'Inter_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  currency: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    paddingBottom: 6,
  },
  price: {
    fontSize: 42,
    lineHeight: 47,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(247, 242, 234, 0.24)',
  },
  benefits: { gap: 12 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  benefit: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_500Medium',
  },
  cta: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  securityNote: {
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
});