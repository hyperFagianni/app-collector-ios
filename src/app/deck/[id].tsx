import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeckCardTile } from '@/components/deck-card-tile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND_BLUE, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { getDecks, setDeckOwnedFlags } from '@/lib/storage';
import { Deck, DeckSection } from '@/lib/types';

const COLUMNS = 4;

const SECTION_LABELS: Record<DeckSection, string> = {
  main: 'Main Deck',
  extra: 'Extra Deck',
  side: 'Side Deck',
};

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [ownedFlags, setOwnedFlags] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDecks().then((decks) => {
      const found = decks.find((d) => d.id === id) ?? null;
      setDeck(found);
      setOwnedFlags(found?.ownedFlags ?? {});
    });
  }, [id]);

  const tileWidth = (width - Spacing.four * 2 - Spacing.two * (COLUMNS - 1)) / COLUMNS;

  function toggle(key: string) {
    setOwnedFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    if (!deck) return;
    setSaving(true);
    await setDeckOwnedFlags(deck.id, ownedFlags);
    setSaving(false);
  }

  if (!deck) {
    return (
      <ThemedView style={styles.flex}>
        <Stack.Screen options={{ title: '' }} />
        <SafeAreaView style={styles.flex}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerNote}>
            Caricamento…
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const sections: DeckSection[] = ['main', 'extra', 'side'];

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: deck.title }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {sections.map((section) => {
            const entries = deck[section];
            if (entries.length === 0) return null;
            return (
              <View key={section}>
                <ThemedText type="subtitle" themeColor="purple" style={styles.sectionLabel}>
                  {SECTION_LABELS[section]}
                </ThemedText>
                <View style={styles.grid}>
                  {entries.flatMap((entry) =>
                    Array.from({ length: entry.quantity }, (_, copyIndex) => {
                      const key = `${section}:${entry.cardId}:${copyIndex}`;
                      return (
                        <DeckCardTile
                          key={key}
                          imageUrl={entry.imageUrl}
                          tileWidth={tileWidth}
                          owned={!!ownedFlags[key]}
                          onToggle={() => toggle(key)}
                        />
                      );
                    }),
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.editButton, { borderColor: colors.border }]}
            onPress={() => router.push(`/deck-add?deckId=${deck.id}`)}
          >
            <ThemedText type="smallBold" themeColor="textSecondary">
              Modifica
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveButton, { backgroundColor: BRAND_BLUE }, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="smallBold" themeColor="background">
              Salva
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  sectionLabel: { marginBottom: Spacing.two, marginTop: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  centerNote: { textAlign: 'center', marginTop: Spacing.six },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  disabled: { opacity: 0.6 },
});
