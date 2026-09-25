import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

type Tab = 'explorar' | 'planos';

export function BottomTabBar({ activeTab }: { activeTab: Tab }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 12;

  return (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: bottomInset,
        },
      ]}
    >
      <TabButton
        active={activeTab === 'explorar'}
        icon="search"
        label="Explorar"
        colors={colors}
        onPress={() => router.replace('/')}
      />
      <TabButton
        active={activeTab === 'planos'}
        icon="star"
        label="Planos"
        colors={colors}
        onPress={() => router.replace('/planos')}
      />
    </View>
  );
}

function TabButton({
  active,
  icon,
  label,
  colors,
  onPress,
}: {
  active: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  const color = active ? colors.primary : colors.mutedForeground;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name={icon} size={20} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 68,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 9,
  },
  tab: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});