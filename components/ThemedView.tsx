import { View, type ViewProps } from "react-native";
import { Colors } from "@/constants/Colors";

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
}

export function ThemedView({
  style,
  lightColor,
  ...otherProps
}: ThemedViewProps): JSX.Element {
  const backgroundColor = lightColor ?? Colors.light.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
