import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RarityQuantityRow } from '@/components/rarity-quantity-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { getCardRarities, searchCards } from '@/lib/ygoprodeck';
import { upsertCardRarities } from '@/lib/storage';
import { ApiCard } from '@/lib/types';

export default function AddCardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchCards(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const rarities = useMemo(
    () => (selectedCard ? getCardRarities(selectedCard) : []),
    [selectedCard],
  );

  function selectCard(card: ApiCard) {
    setSelectedCard(card);
    setQuantities({});
  }

  async function handleFinish() {
    if (selectedCard) {
      const hasAny = Object.values(quantities).some((qty) => qty > 0);
      if (hasAny) {
        await upsertCardRarities(
          {
            id: String(selectedCard.id),
            name: selectedCard.name,
            type: selectedCard.type,
            imageUrl: selectedCard.card_images[0]?.image_url ?? '',
          },
          quantities,
        );
      }
    }
    router.back();
  }

  if (selectedCard) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <View style={styles.detailHeader}>
            <Image
              source={{ uri: selectedCard.card_images[0]?.image_url }}
              style={styles.cardImage}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.cardName}>
              {selectedCard.name}
            </ThemedText>
          </View>

          {rarities.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerNote}>
              Nessuna rarità nota per questa carta.
            </ThemedText>
          ) : (
            <FlatList
              data={rarities}
              keyExtractor={(rarity) => rarity}
              contentContainerStyle={styles.rarityList}
              renderItem={({ item: rarity }) => (
                <RarityQuantityRow
                  rarity={rarity}
                  quantity={quantities[rarity] ?? 0}
                  onChange={(delta) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [rarity]: Math.max(0, (prev[rarity] ?? 0) + delta),
                    }))
                  }
                />
              )}
            />
          )}

          <View style={styles.footer}>
            <Pressable
              style={[styles.backButton, { borderColor: colors.border }]}
              onPress={() => setSelectedCard(null)}
            >
              <ThemedText type="smallBold" themeColor="textSecondary">
                Indietro
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.finishButton, { backgroundColor: colors.gold }]}
              onPress={handleFinish}
            >
              <ThemedText type="smallBold" themeColor="background">
                Fine
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca una carta (es. Mago Nero)"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            autoFocus
          />
          {loading && <ActivityIndicator color={colors.gold} style={styles.spinner} />}
        </View>

        {!loading && query.trim().length > 0 && results.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerNote}>
            Nessuna carta trovata.
          </ThemedText>
        )}

        <FlatList
          data={results}
          keyExtractor={(card) => String(card.id)}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.resultRow, { borderBottomColor: colors.border }]}
              onPress={() => selectCard(item)}
            >
              <Image
                source={{ uri: item.card_images[0]?.image_url_small }}
                style={styles.resultThumb}
                contentFit="contain"
              />
              <ThemedText type="default" style={styles.resultName}>
                {item.name}
              </ThemedText>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  input: { flex: 1, paddingVertical: Spacing.three, fontSize: 16 },
  spinner: { marginLeft: Spacing.two },
  centerNote: { textAlign: 'center', marginTop: Spacing.five },
  resultsList: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.five },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  resultThumb: { width: 36, height: 52, borderRadius: 3 },
  resultName: { flex: 1 },
  detailHeader: { alignItems: 'center', paddingTop: Spacing.three, paddingHorizontal: Spacing.four },
  cardImage: { width: 160, height: 233, borderRadius: 8, marginBottom: Spacing.three },
  cardName: { textAlign: 'center', marginBottom: Spacing.three },
  rarityList: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  backButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  finishButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
});
