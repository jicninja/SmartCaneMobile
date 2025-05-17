import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BluetoothManager } from '@/components/Bluetooth';

export default function HomeScreen() {
  return (
    <ThemedView>
      <ThemedText style={styles.titleContainer}>Bluetooth</ThemedText>
      <BluetoothManager />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
});
