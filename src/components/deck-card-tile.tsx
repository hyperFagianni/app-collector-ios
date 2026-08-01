import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';
import { toGrayscaleUrl } from '@/lib/image';

type Props = {
  imageUrl: string;
  tileWidth: number;
  owned: boolean;
  onToggle: () => void;
};

export function DeckCardTile({ imageUrl, tileWidth, owned, onToggle }: Props) {
  const { colors } = useAppTheme();
  const source = owned ? toGrayscaleUrl(imageUrl) : imageUrl;

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.tile,
        {
          width: tileWidth,
          height: tileWidth * 1.46,
          borderColor: colors.border,
          backgroundColor: colors.backgroundElement,
        },
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: source }} style={styles.image} contentFit="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.7 },
  image: { width: '100%', height: '100%' },
});
