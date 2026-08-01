import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND_BLUE, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';
import { resolveSectionText } from '@/lib/decklist';
import { getDecks, upsertDeck } from '@/lib/storage';
import { Deck, DeckCardEntry, UnresolvedLine } from '@/lib/types';

const PLACEHOLDER = '2x Ancient Gear Fortress\n3x Geartown\n1x Ancient Gear Tanker';

function entriesToText(entries: DeckCardEntry[]): string {
  return entries.map((entry) => `${entry.quantity}x ${entry.name}`).join('\n');
}

export default function DeckAddScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();

  const [existingDeck, setExistingDeck] = useState<Deck | null>(null);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [mainText, setMainText] = useState('');
  const [extraText, setExtraText] = useState('');
  const [sideText, setSideText] = useState('');
  const [saving, setSaving] = useState(false);
  const [unresolved, setUnresolved] = useState<UnresolvedLine[]>([]);

  useEffect(() => {
    if (!deckId) return;
    getDecks().then((decks) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return;
      setExistingDeck(deck);
      setTitle(deck.title);
      setCoverImage(deck.imageUrl);
      setMainText(entriesToText(deck.main));
      setExtraText(entriesToText(deck.extra));
      setSideText(entriesToText(deck.side));
    });
  }, [deckId]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setUnresolved([]);

    try {
      const [main, extra, side] = await Promise.all([
        resolveSectionText('main', mainText),
        resolveSectionText('extra', extraText),
        resolveSectionText('side', sideText),
      ]);

      const allUnresolved = [...main.unresolved, ...extra.unresolved, ...side.unresolved];
      if (allUnresolved.length > 0) setUnresolved(allUnresolved);

      const firstCardImage =
        main.entries[0]?.imageUrl ?? extra.entries[0]?.imageUrl ?? side.entries[0]?.imageUrl ?? '';

      const deck: Deck = {
        id: existingDeck?.id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        imageUrl: coverImage ?? firstCardImage,
        main: main.entries,
        extra: extra.entries,
        side: side.entries,
        ownedFlags: existingDeck?.ownedFlags ?? {},
      };

      await upsertDeck(deck);
      if (allUnresolved.length === 0) router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titolo del mazzo"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.titleInput,
              { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
          />

          <Pressable
            style={[styles.imagePicker, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            onPress={pickImage}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <ThemedText type="small" themeColor="textSecondary" style={styles.imagePlaceholderText}>
                Scegli un'immagine di copertina (opzionale — altrimenti uso la prima carta del mazzo)
              </ThemedText>
            )}
          </Pressable>

          <ThemedText type="subtitle" themeColor="purple" style={styles.sectionLabel}>
            Main Deck
          </ThemedText>
          <TextInput
            value={mainText}
            onChangeText={setMainText}
            placeholder={PLACEHOLDER}
            placeholderTextColor={colors.textSecondary}
            style={[styles.textarea, { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            multiline
          />

          <ThemedText type="subtitle" themeColor="purple" style={styles.sectionLabel}>
            Extra Deck
          </ThemedText>
          <TextInput
            value={extraText}
            onChangeText={setExtraText}
            placeholder={PLACEHOLDER}
            placeholderTextColor={colors.textSecondary}
            style={[styles.textarea, { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            multiline
          />

          <ThemedText type="subtitle" themeColor="purple" style={styles.sectionLabel}>
            Side Deck
          </ThemedText>
          <TextInput
            value={sideText}
            onChangeText={setSideText}
            placeholder={PLACEHOLDER}
            placeholderTextColor={colors.textSecondary}
            style={[styles.textarea, { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            multiline
          />

          {unresolved.length > 0 && (
            <View style={[styles.warningBox, { borderColor: colors.gold }]}>
              <ThemedText type="smallBold" themeColor="gold">
                Non trovate ({unresolved.length}):
              </ThemedText>
              {unresolved.map((line, index) => (
                <ThemedText key={index} type="small" themeColor="textSecondary">
                  {line.raw}
                </ThemedText>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: BRAND_BLUE }, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <ThemedText type="smallBold" themeColor="background">
                Salva
              </ThemedText>
            )}
          </Pressable>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  titleInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 18,
  },
  imagePicker: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholderText: { textAlign: 'center' },
  sectionLabel: { marginTop: Spacing.two },
  textarea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  footer: { padding: Spacing.four },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  disabled: { opacity: 0.6 },
});
