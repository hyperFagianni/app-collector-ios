import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { CATEGORY_COLORS } from '@/lib/grouping';
import { Category } from '@/lib/types';

const OUTLINE_OFFSETS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

type Props = {
  category: Category;
  style?: object;
};

/** XYZ is rendered as black fill with a crisp white outline (RN Text has no native stroke support). */
export function CategoryHeader({ category, style }: Props) {
  if (category === 'XYZ') {
    return (
      <View style={style}>
        <View style={styles.outlineWrap}>
          <Text style={[styles.label, styles.ghost]}>{category}</Text>
          {OUTLINE_OFFSETS.map(([dx, dy], index) => (
            <Text
              key={index}
              style={[styles.label, styles.layer, { color: '#FFFFFF', left: dx, top: dy }]}
            >
              {category}
            </Text>
          ))}
          <Text style={[styles.label, styles.layer, { color: '#000000', left: 0, top: 0 }]}>
            {category}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Text style={[styles.label, { color: CATEGORY_COLORS[category] }, style]}>{category}</Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.displaySemi,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  outlineWrap: { position: 'relative' },
  ghost: { opacity: 0 },
  layer: { position: 'absolute' },
});
