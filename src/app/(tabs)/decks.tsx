import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND_RED, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { sortDecksForList } from '@/lib/grouping';
import { deleteDeck, getDecks } from '@/lib/storage';
import { Deck } from '@/lib/types';

export default function DecksScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [decks, setDecks] = useState<Deck[]>([]);
  const sections = sortDecksForList(decks);

  const refresh = useCallback(() => {
    getDecks().then(setDecks);
  }, []);

  useFocusEffect(refresh);

  function confirmDelete(deck: Deck) {
    Alert.alert(`Eliminare "${deck.title}"?`, 'Questa azione non può essere annullata.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => deleteDeck(deck.id).then(refresh),
      },
    ]);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <ThemedText type="display" style={{ color: BRAND_RED }}>
            Mazzi
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Le tue decklist
          </ThemedText>
        </View>

        {decks.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="title" style={styles.emptyTitle}>
              Nessun mazzo ancora
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
              Premi + per creare la tua prima decklist.
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {sections.map((section) => (
              <View key={section.format}>
                <ThemedText type="subtitle" themeColor="purple" style={styles.sectionHeader}>
                  {section.format}
                </ThemedText>
                {section.data.map((deck) => (
                  <ReanimatedSwipeable
                    key={deck.id}
                    friction={2}
                    rightThreshold={40}
                    overshootRight={false}
                    containerStyle={styles.swipeContainer}
                    renderRightActions={(progress) => (
                      <DeleteAction progress={progress} onPress={() => confirmDelete(deck)} />
                    )}
                  >
                    <Pressable
                      style={[styles.row, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                      onPress={() => router.push(`/deck/${deck.id}`)}
                    >
                      <Image source={{ uri: deck.imageUrl }} style={styles.thumb} contentFit="cover" />
                      <View style={styles.rowText}>
                        <ThemedText type="title">{deck.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {deck.main.length + deck.extra.length + deck.side.length} carte diverse
                        </ThemedText>
                      </View>
                    </Pressable>
                  </ReanimatedSwipeable>
                ))}
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable
          style={[styles.fab, { backgroundColor: colors.gold, shadowColor: colors.gold }]}
          onPress={() => router.push('/deck-add')}
        >
          <ThemedText type="display" themeColor="background" style={styles.fabPlus}>
            +
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function DeleteAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(progress.value, 1) }],
  }));

  return (
    <Animated.View style={[styles.deleteAction, animatedStyle]}>
      <Pressable style={styles.deleteActionButton} onPress={onPress}>
        <ThemedText type="small" themeColor="background">
          Elimina
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  swipeContainer: { marginBottom: Spacing.three, borderRadius: 12 },
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six * 2 },
  sectionHeader: { paddingTop: Spacing.three, paddingBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteActionButton: {
    backgroundColor: BRAND_RED,
    height: '100%',
    minWidth: 88,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  rowText: { flex: 1, gap: Spacing.half },
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
