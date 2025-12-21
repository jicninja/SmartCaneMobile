import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Vibration,
  StyleSheet,
} from "react-native";
import { BleManager, type Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { ThemedText } from "./ThemedText";
import { soundService } from "@/services/SoundService";
import { AudioManager } from "@/services/AudioManager";

interface VibrationPattern {
  pattern: number[];
  beepDuration: number;
}

const getDistancePattern = (dist: number): VibrationPattern => {
  if (dist <= 100) {
    return { pattern: [100, 50], beepDuration: 50 };
  } else if (dist <= 200) {
    return { pattern: [100, 1000], beepDuration: 1000 };
  } else if (dist <= 300) {
    return { pattern: [100, 2000], beepDuration: 2000 };
  }

  return { pattern: [], beepDuration: 0 };
};

interface BluetoothManagerProps {
  onDeviceConnected?: (deviceId: string | null) => void;
}

const BluetoothManager = ({
  onDeviceConnected,
}: BluetoothManagerProps): JSX.Element => {
  const [manager] = useState(new BleManager());
  const [distance, setDistance] = useState<number>(0);
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastAnnouncedDistance, setLastAnnouncedDistance] = useState<number>(0);

  /**
   * Request Bluetooth and location permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted =
          granted["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED;

        return allGranted;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }

    return true;
  };

  useEffect(() => {
    void requestPermissions();
    // Sound service is initialized in _layout.tsx, no need to initialize here

    const subscription = manager.onStateChange((state) => {
      setBluetoothState(state);
    }, true);

    // Test AudioManager on mount
    AudioManager.announce("Aplicación lista", "low", "info").catch((error) => {
      console.error("Error testing AudioManager:", error);
    });

    return () => {
      subscription.remove();
      manager.stopDeviceScan();
      manager.destroy();
      // Don't release sound service here, it's managed globally in _layout.tsx
    };
  }, [manager]);

  const scanForDevices = async (): Promise<void> => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      AudioManager.announce(
        "Permisos de Bluetooth no concedidos",
        "high",
        "error"
      ).catch((error) => {
        console.error("Error announcing permissions:", error);
      });
      return;
    }

    const state = await manager.state();
    if (state !== State.PoweredOn) {
      AudioManager.announce(
        "Bluetooth no está encendido",
        "high",
        "error"
      ).catch((error) => {
        console.error("Error announcing bluetooth state:", error);
      });
      return;
    }

    setIsScanning(true);

    // Announce scanning start
    AudioManager.announce("Escaneando dispositivos", "medium", "info").catch(
      (error) => {
        console.error("Error announcing scan start:", error);
      }
    );

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        setIsScanning(false);
        AudioManager.announce(
          "Error al escanear dispositivos",
          "high",
          "error"
        ).catch((err) => {
          console.error("Error announcing scan error:", err);
        });
        return;
      }

      if (scannedDevice?.localName === "SmartCane") {
        setDevice(scannedDevice);
        manager.stopDeviceScan();
        setIsScanning(false);
        AudioManager.announce(
          "Dispositivo SmartCane encontrado",
          "high",
          "success"
        ).catch((err) => {
          console.error("Error announcing device found:", err);
        });
      }
    });
  };

  const connectToDevice = async (): Promise<void> => {
    if (!device) {
      return;
    }

    try {
      const connectedDevice = await device.connect();
      setConnected(true);

      // Notify parent component about device connection
      if (onDeviceConnected) {
        onDeviceConnected(connectedDevice.id);
      }

      // Announce connection first (TTS is more important)
      AudioManager.announce(
        "Dispositivo conectado exitosamente",
        "high",
        "success"
      ).catch((error) => {
        console.error("Error announcing connection:", error);
      });

      // Play connection sound after a short delay
      setTimeout(() => {
        soundService.playConnect().catch((error) => {
          console.error("Error playing connect sound:", error);
        });
      }, 500);

      connectedDevice.onDisconnected(() => {
        setConnected(false);
        setDistance(0);
        if (onDeviceConnected) {
          onDeviceConnected(null);
        }
        // Announce disconnection first
        AudioManager.announce(
          "Dispositivo desconectado",
          "medium",
          "info"
        ).catch((error) => {
          console.error("Error announcing disconnection:", error);
        });

        // Play disconnect sound after a short delay
        setTimeout(() => {
          soundService.playDisconnect().catch((error) => {
            console.error("Error playing disconnect sound:", error);
          });
        }, 500);
      });

      await readData();
    } catch (error) {
      setConnected(false);
      if (onDeviceConnected) {
        onDeviceConnected(null);
      }
    }
  };

  const readData = async (): Promise<void> => {
    if (!device) return;

    try {
      await device.discoverAllServicesAndCharacteristics();

      device.monitorCharacteristicForService(
        "180D",
        "2A37",
        (error, characteristic) => {
          if (error) {
            setConnected(false);
            return;
          }

          if (characteristic?.value) {
            try {
              const value = Buffer.from(
                characteristic.value,
                "base64"
              ).toString();
              const numValue = Number(value);

              // Only update if value is valid
              if (isNaN(numValue) || numValue < 0) {
                return;
              }

              setDistance(numValue);

              const { pattern } = getDistancePattern(numValue);

              if (pattern.length > 0) {
                // Vibrate
                Vibration.vibrate(pattern);

                // Play alert sound (non-blocking)
                soundService.playAlert(numValue).catch((error) => {
                  console.error("Error playing alert sound:", error);
                });

                // Announce distance with TTS (only if distance changed significantly)
                const distanceDiff = Math.abs(numValue - lastAnnouncedDistance);
                if (distanceDiff >= 50 || lastAnnouncedDistance === 0) {
                  let message: string;
                  let priority: "critical" | "high" | "medium" = "medium";

                  if (numValue <= 100) {
                    message = `¡Objeto muy cercano! A ${Math.round(
                      numValue
                    )} centímetros`;
                    priority = "critical";
                  } else if (numValue <= 200) {
                    message = `Objeto cercano a ${Math.round(
                      numValue
                    )} centímetros`;
                    priority = "high";
                  } else {
                    message = `Objeto detectado a ${Math.round(
                      numValue
                    )} centímetros`;
                    priority = "medium";
                  }

                  // Announce with TTS
                  AudioManager.announce(
                    message,
                    priority,
                    "warning",
                    false
                  ).catch((error) => {
                    console.error("Error announcing distance:", error);
                  });

                  setLastAnnouncedDistance(numValue);
                }
              } else {
                // Reset last announced distance when no object is detected
                if (lastAnnouncedDistance > 0) {
                  setLastAnnouncedDistance(0);
                }
              }
            } catch (error) {
              console.error("Error processing distance data:", error);
            }
          }
        }
      );
    } catch (err) {
      setConnected(false);
    }
  };

  const getBluetoothStateText = (): string => {
    switch (bluetoothState) {
      case State.PoweredOn:
        return "Encendido";
      case State.PoweredOff:
        return "Apagado";
      case State.Unauthorized:
        return "Sin autorización";
      case State.Unsupported:
        return "No soportado";
      default:
        return "Desconocido";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusSection}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Estado Bluetooth:
        </ThemedText>
        <ThemedText style={styles.value}>{getBluetoothStateText()}</ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.label}>
          Conectado:
        </ThemedText>
        <ThemedText style={styles.value}>{connected ? "Sí" : "No"}</ThemedText>

        {device && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Dispositivo:
            </ThemedText>
            <ThemedText style={styles.value}>{device.localName}</ThemedText>
          </>
        )}
      </View>

      <View style={styles.buttonSection}>
        <Button
          title={isScanning ? "Escaneando..." : "ESCANEAR DISPOSITIVOS"}
          onPress={scanForDevices}
          disabled={bluetoothState !== State.PoweredOn || isScanning}
        />
        <Button
          title="CONECTAR"
          onPress={connectToDevice}
          disabled={!device || connected}
        />
      </View>

      {connected && (
        <View style={styles.distanceSection}>
          <ThemedText type="subtitle" style={styles.distanceLabel}>
            Distancia
          </ThemedText>
          <ThemedText type="title" style={styles.distanceValue}>
            {distance} cm
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  statusSection: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  value: {
    color: "#0a7ea4",
  },
  buttonSection: {
    gap: 12,
  },
  distanceSection: {
    backgroundColor: "#e8f5f9",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  distanceLabel: {
    marginBottom: 8,
  },
  distanceValue: {
    color: "#0a7ea4",
  },
});

export { BluetoothManager };
export type { BluetoothManagerProps };
