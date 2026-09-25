import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function LoginScreen() {
  useWarmUpBrowser();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'mobile' }),
      });
      if (!createdSessionId || !setActive) {
        setError('Não foi possível concluir o cadastro com o Google.');
        return;
      }
      await setActive({ session: createdSessionId });
      router.replace('/');
    } catch {
      setError('O acesso com Google foi cancelado ou não pôde ser concluído.');
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 8,
          paddingBottom: botPad + 24,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: colors.accent }]}>
          <Feather name="home" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.wordmark, { color: colors.primary }]}>Vizinhança Real</Text>
        <Text
          accessibilityRole="header"
          aria-level={1}
          style={[styles.title, { color: colors.foreground }]}
        >
          Descubra como é realmente morar ali antes de assinar
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Avalie imóveis onde você já morou e ajude outras pessoas a decidir com mais segurança.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Entrar ou cadastrar com o Google"
          disabled={loading}
          onPress={handleGoogle}
          style={({ pressed }) => [
            styles.googleButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              opacity: pressed || loading ? 0.72 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View
                style={[
                  styles.googleMark,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text style={[styles.googleLetter, { color: colors.googleBlue }]}>G</Text>
              </View>
              <Text style={[styles.googleText, { color: colors.foreground }]}>
                Entrar ou cadastrar com o Google
              </Text>
            </>
          )}
        </Pressable>

        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          Ao continuar, você concorda em usar o app de forma responsável e publicar apenas relatos
          verdadeiros.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  wordmark: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  title: {
    maxWidth: 320,
    fontSize: 25,
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  description: {
    maxWidth: 330,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginBottom: 18,
  },
  googleButton: {
    width: '100%',
    minHeight: 56,
    paddingHorizontal: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLetter: { fontSize: 16, fontWeight: '700' },
  googleText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  error: { fontSize: 12, lineHeight: 18, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  terms: {
    maxWidth: 320,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
  },
});