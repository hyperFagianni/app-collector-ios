import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

type Props = {
  rarity: string;
  quantity: number;
  onChange: (delta: number) => void;
};

export function RarityQuantityRow({ rarity, quantity, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.row, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
    >
      <ThemedText type="default" style={styles.label}>
        {rarity}
      </ThemedText>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(-1)}
          disabled={quantity <= 0}
          style={[
            styles.button,
            { backgroundColor: colors.backgroundSelected, borderColor: colors.goldMuted },
            quantity <= 0 && { borderColor: colors.border },
          ]}
        >
          <ThemedText type="smallBold" themeColor={quantity <= 0 ? 'textSecondary' : 'gold'}>
            −
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.quantity}>
          {quantity}
        </ThemedText>
        <Pressable
          onPress={() => onChange(1)}
          style={[styles.button, { backgroundColor: colors.backgroundSelected, borderColor: colors.goldMuted }]}
        >
          <ThemedText type="smallBold" themeColor="gold">
            +
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    marginBottom: Spacing.two,
    borderWidth: 1,
  },
  label: { flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quantity: { minWidth: 24, textAlign: 'center' },
});
