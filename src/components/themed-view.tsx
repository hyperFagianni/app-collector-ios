import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useAppTheme } from '@/contexts/theme-context';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const { colors } = useAppTheme();
  return <View style={[{ backgroundColor: colors[type ?? 'background'] }, style]} {...otherProps} />;
}
