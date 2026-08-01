import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';
import { OwnedCard } from '@/lib/types';

type Props = {
  card: OwnedCard;
  tileWidth: number;
  onPress: () => void;
};

export function CardGridTile({ card, tileWidth, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
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
      <Image source={{ uri: card.imageUrl }} style={styles.image} contentFit="cover" />
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
