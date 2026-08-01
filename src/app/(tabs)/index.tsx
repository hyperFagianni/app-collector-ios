import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardGridTile } from '@/components/card-grid-tile';
import { CategoryHeader } from '@/components/category-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND_RED, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { getCollection } from '@/lib/storage';
import { sortForHome } from '@/lib/grouping';

const COLUMNS = 3;

export default function HomeScreen() {
  const router = useRouter();
  const { colors, scheme, toggleScheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [sections, setSections] = useState(sortForHome({}));

  useFocusEffect(
    useCallback(() => {
      getCollection().then((collection) => setSections(sortForHome(collection)));
    }, []),
  );

  const isEmpty = sections.length === 0;
  const tileWidth = (width - Spacing.four * 2 - Spacing.two * (COLUMNS - 1)) / COLUMNS;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="display" style={{ color: BRAND_RED }}>
              Duel Album
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              La tua collezione di carte
            </ThemedText>
          </View>
          <View style={styles.themeToggle}>
            <ThemedText type="small" themeColor="textSecondary">
              {scheme === 'dark' ? '🌙' : '☀️'}
            </ThemedText>
            <Switch
              value={scheme === 'light'}
              onValueChange={toggleScheme}
              trackColor={{ false: colors.backgroundSelected, true: colors.goldMuted }}
              thumbColor={colors.gold}
            />
          </View>
        </View>

        {isEmpty ? (
          <View style={styles.empty}>
            <ThemedText type="title" style={styles.emptyTitle}>
              Nessuna carta ancora
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
              Premi + per aggiungere la tua prima carta alla collezione.
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            {sections.map((section) => (
              <View key={section.category}>
                <CategoryHeader category={section.category} style={styles.sectionHeader} />

                <View style={styles.grid}>
                  {section.data.map((card) => (
                    <CardGridTile
                      key={card.id}
                      card={card}
                      tileWidth={tileWidth}
                      onPress={() => router.push(`/card/${card.id}`)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable style={[styles.fab, { backgroundColor: colors.gold, shadowColor: colors.gold }]} onPress={() => router.push('/add')}>
          <ThemedText type="display" themeColor="background" style={styles.fabPlus}>
            +
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerText: { flex: 1 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  sectionHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  listContent: { paddingBottom: Spacing.six * 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.five },
  emptyTitle: { marginBottom: Spacing.two },
  emptyBody: { textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.five,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPlus: { fontSize: 30, lineHeight: 34, marginTop: -2 },
});
