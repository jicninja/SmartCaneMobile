import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BluetoothManager } from "@/components/Bluetooth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";

/**
 * Home screen with Bluetooth connectivity for SmartCane device
 */
export default function HomeScreen(): JSX.Element {
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(
    null
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <MaterialIcons name="10k" size={50} color="#0a7ea4" />
          <ThemedText type="title" style={styles.title}>
            Bluetooth
          </ThemedText>
        </ThemedView>
        {connectedDeviceId && (
          <ThemedView style={styles.deviceInfo}>
            <ThemedText type="defaultSemiBold" style={styles.deviceLabel}>
              Dispositivo Conectado:
            </ThemedText>
            <ThemedText style={styles.deviceId}>{connectedDeviceId}</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.content}>
          <BluetoothManager onDeviceConnected={setConnectedDeviceId} />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
  },
  title: {
    textAlign: "center",
  },
  deviceInfo: {
    backgroundColor: "#e8f5f9",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  deviceLabel: {
    fontSize: 14,
    color: "#666",
  },
  deviceId: {
    fontSize: 16,
    color: "#0a7ea4",
    fontFamily: "monospace",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
