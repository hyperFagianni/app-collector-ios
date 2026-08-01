import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { PriceSnapshot } from '@/lib/types';

type Props = {
  history: PriceSnapshot[];
};

function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

export function PriceChart({ history }: Props) {
  const { colors } = useAppTheme();
  const latest = history[history.length - 1];

  if (history.length < 2) {
    return (
      <View
        style={[
          styles.singlePoint,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
        ]}
      >
        <ThemedText type="small" themeColor="textSecondary">
          Prezzo attuale (Cardmarket)
        </ThemedText>
        <ThemedText type="display" themeColor="gold" style={styles.priceLarge}>
          {latest ? `€${latest.price.toFixed(2)}` : 'N/D'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Il grafico storico si costruirà con le prossime aperture dell'app.
        </ThemedText>
      </View>
    );
  }

  const data = history.map((snapshot) => ({
    value: snapshot.price,
    label: formatDayMonth(snapshot.date),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        Prezzo Cardmarket · storico locale
      </ThemedText>
      <ThemedText type="display" themeColor="gold" style={styles.priceLarge}>
        €{latest.price.toFixed(2)}
      </ThemedText>
      <LineChart
        data={data}
        height={160}
        thickness={2}
        color={colors.gold}
        startFillColor={colors.purple}
        endFillColor={colors.background}
        startOpacity={0.5}
        endOpacity={0.05}
        areaChart
        hideDataPoints={data.length > 12}
        dataPointsColor={colors.gold}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        noOfSections={4}
        initialSpacing={8}
        spacing={Math.max(28, 260 / data.length)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  singlePoint: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.one,
  },
  priceLarge: { marginVertical: Spacing.one },
});
