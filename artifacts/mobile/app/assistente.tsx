import React, { useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatComAssistente } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá! Posso ajudar você a entender as avaliações, comparar imóveis ou preparar perguntas antes de alugar. O que você gostaria de saber?',
};

export default function AssistenteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const chat = useChatComAssistente();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 20 : insets.bottom;

  const send = () => {
    const content = text.trim();
    if (!content || chat.isPending) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setText('');

    chat.mutate(
      {
        data: {
          messages: nextMessages
            .slice(-12)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        },
      },
      {
        onSuccess: (data) => {
          setMessages((current) => [
            ...current,
            {
              id: `${Date.now()}-assistant`,
              role: 'assistant',
              content: data.resposta,
            },
          ]);
        },
        onError: () => {
          setMessages((current) => [
            ...current,
            {
              id: `${Date.now()}-error`,
              role: 'assistant',
              content: 'Não consegui responder agora. Tente novamente em alguns instantes.',
            },
          ]);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: topPad + 8,
              borderBottomColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Assistente</Text>
            <View style={styles.status}>
              <View style={[styles.statusDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                Vizinhança Real
              </Text>
            </View>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: colors.accent }]}>
            <Feather name="message-circle" size={18} color={colors.primary} />
          </View>
        </View>

        <FlatList
          data={[...messages].reverse()}
          inverted
          keyExtractor={(item) => item.id}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messages}
          ListHeaderComponent={
            chat.isPending ? (
              <View
                style={[
                  styles.typingBubble,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
                  Analisando as avaliações…
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                  {
                    backgroundColor: isUser ? colors.primary : colors.card,
                    borderColor: isUser ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.composerWrap,
            {
              paddingBottom: botPad + 8,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View
            style={[
              styles.composer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="Pergunte sobre um imóvel…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              multiline
              maxLength={2000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={send}
            />
            <Pressable
              accessibilityLabel="Enviar mensagem"
              disabled={!text.trim() || chat.isPending}
              onPress={() => {
                send();
                inputRef.current?.focus();
              }}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    text.trim() && !chat.isPending ? colors.primary : colors.muted,
                },
              ]}
            >
              <Feather
                name="arrow-up"
                size={18}
                color={
                  text.trim() && !chat.isPending
                    ? colors.primaryForeground
                    : colors.mutedForeground
                }
              />
            </Pressable>
          </View>
          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            Confira informações importantes diretamente com o responsável pelo imóvel.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 74,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  headerSubtitle: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: { padding: 16, gap: 10 },
  bubble: { maxWidth: '84%', paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  typingBubble: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  typingText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  composerWrap: {
    paddingTop: 10,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  composer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 7,
    paddingVertical: 7,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 34,
    paddingTop: 7,
    paddingBottom: 5,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: { fontSize: 9, lineHeight: 13, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});