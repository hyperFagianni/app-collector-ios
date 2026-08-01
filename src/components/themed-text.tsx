import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'display' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'link';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const { colors } = useAppTheme();
  const defaultColor: ThemeColor = type === 'link' ? 'gold' : 'text';

  return (
    <Text
      style={[
        { color: colors[themeColor ?? defaultColor] },
        type === 'default' && styles.default,
        type === 'display' && styles.display,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  display: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 1,
  },
  title: {
    fontFamily: Fonts.displaySemi,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: Fonts.displaySemi,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    lineHeight: 20,
  },
});
