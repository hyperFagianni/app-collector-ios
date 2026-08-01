import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PriceChart } from '@/components/price-chart';
import { RarityQuantityRow } from '@/components/rarity-quantity-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { adjustRarityCopies, appendPriceSnapshot, getCollection, getPriceHistory } from '@/lib/storage';
import { fetchCardById, getCardRarities, getCurrentPrice } from '@/lib/ygoprodeck';
import { OwnedCard, PriceSnapshot } from '@/lib/types';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [card, setCard] = useState<OwnedCard | null>(null);
  const [allRarities, setAllRarities] = useState<string[]>([]);
  const [history, setHistory] = useState<PriceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const collection = await getCollection();
      const owned = collection[id] ?? null;
      if (cancelled) return;
      setCard(owned);

      const [apiCard, storedHistory] = await Promise.all([
        fetchCardById(id).catch(() => null),
        getPriceHistory(id),
      ]);
      if (cancelled) return;

      if (apiCard) {
        setAllRarities(getCardRarities(apiCard));
        const price = getCurrentPrice(apiCard);
        if (price !== null) {
          const updatedHistory = await appendPriceSnapshot(id, price);
          if (!cancelled) setHistory(updatedHistory);
        } else if (!cancelled) {
          setHistory(storedHistory);
        }
      } else if (!cancelled) {
        setHistory(storedHistory);
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleChange(rarity: string, delta: number) {
    const updated = await adjustRarityCopies(id, rarity, delta);
    setCard(updated[id] ?? null);
  }

  if (loading || !card) {
    return (
      <ThemedView style={styles.flex}>
        <Stack.Screen options={{ title: '' }} />
        <SafeAreaView style={styles.flex}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerNote}>
            {loading ? 'Caricamento…' : 'Carta non trovata nella collezione.'}
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const rarityList = allRarities.length > 0 ? allRarities : Object.keys(card.rarities);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: card.name }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: card.imageUrl }} style={styles.image} contentFit="contain" />
          </View>

          <PriceChart history={history} />

          <ThemedText type="subtitle" themeColor="purple" style={styles.sectionLabel}>
            Copie possedute
          </ThemedText>
          {rarityList.map((rarity) => (
            <RarityQuantityRow
              key={rarity}
              rarity={rarity}
              quantity={card.rarities[rarity] ?? 0}
              onChange={(delta) => handleChange(rarity, delta)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  imageWrap: { alignItems: 'center', marginBottom: Spacing.four },
  image: { width: 200, height: 292, borderRadius: 10 },
  sectionLabel: { marginBottom: Spacing.two },
  centerNote: { textAlign: 'center', marginTop: Spacing.six },
});
