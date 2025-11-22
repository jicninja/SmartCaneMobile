import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Vibration,
} from "react-native";
import { BleManager, type Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { Audio } from "expo-av";
import { ThemedText } from "./ThemedText";

const getDistancePattern = (dist: number) => {
  let pattern: number[] = [];

  if (dist <= 100) {
    pattern = [100, 50];
  } else if (dist <= 200) {
    pattern = [100, 1000];
  } else if (dist <= 300) {
    pattern = [100, 2000];
  } else {
    pattern = [];
  }

  return pattern;
};

const BluetoothManager = () => {
  const [manager] = useState(new BleManager());
  const [distance, setDistance] = useState(0);
  const [device, setDevice] = useState<Device>();
  const [connected, setConnected] = useState(false);
  const [beep, setBeep] = useState<Audio.Sound | undefined>();
  const [bluetoothState, setBluetoothState] = useState<string>("Unknown");

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        // Android 12+ (API 31+) requiere permisos específicos
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

        if (!allGranted) {
          console.log("Bluetooth permissions denied");
          return false;
        }
      } else {
        // Android 11 o menor
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission denied");
          return false;
        }
      }
    }

    // En iOS, los permisos se solicitan automáticamente al usar BLE
    return true;
  };

  useEffect(() => {
    // Solicitar permisos al montar el componente
    requestPermissions().catch(console.error);

    // Monitorear el estado del Bluetooth
    const subscription = manager.onStateChange((state) => {
      setBluetoothState(state);
      console.log("Estado de Bluetooth:", state);
    }, true);

    return () => {
      subscription.remove();
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, [manager]);

  const scanForDevices = async () => {
    // Verificar permisos antes de escanear
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.log("No se otorgaron los permisos necesarios");
      return;
    }

    // Verificar el estado del Bluetooth
    const state = await manager.state();
    if (state !== "PoweredOn") {
      console.log("Bluetooth no está encendido. Estado:", state);
      return;
    }

    console.log("Iniciando escaneo de dispositivos...");

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error("Error al escanear:", error);
        return;
      }

      // Filtrar por nombre o UUID de tu dispositivo ESP32
      if (scannedDevice && scannedDevice?.localName === "SmartCane") {
        console.log("Dispositivo SmartCane encontrado:", scannedDevice.id);
        setDevice(scannedDevice);
        manager.stopDeviceScan();
      }
    });
  };

  const connectToDevice = async () => {
    if (!device) {
      console.log("No hay dispositivo seleccionado");
      return;
    }

    try {
      console.log("Conectando a", device.localName || device.id);

      const connectedDevice = await device.connect();

      setConnected(true);
      console.log("Conectado exitosamente a", device.localName);

      // Configurar desconexión automática
      connectedDevice.onDisconnected((error, disconnectedDevice) => {
        console.log("Dispositivo desconectado:", disconnectedDevice?.id);
        setConnected(false);
        setDistance(0);
      });

      // Iniciar lectura de datos
      await readData();
    } catch (error) {
      setConnected(false);
      console.error("Error al conectar:", error);
    }
  };

  const playBeep = async () => {
    const pattern = getDistancePattern(distance);

    if (!pattern.length) {
      return;
    }

    const beepDuration = pattern[1];

    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sounds/beep.mp3") // Asegúrate de tener un archivo beep.mp3 en la carpeta assets
    );
    setBeep(sound);

    await sound.playAsync();

    setTimeout(() => {
      sound.stopAsync(); // Detener el sonido después de un tiempo
    }, beepDuration);
  };

  useEffect(() => {
    if (distance > 0) {
      //playBeep();
    }
  }, [distance]);

  const readData = async () => {
    if (!device) return;

    try {
      await device.discoverAllServicesAndCharacteristics();

      // Monitorear la característica en lugar de usar polling
      device.monitorCharacteristicForService(
        "180D", // UUID del servicio (Heart Rate Service)
        "2A37", // UUID de la característica
        (error, characteristic) => {
          if (error) {
            console.error("Error al leer característica:", error);
            setConnected(false);
            return;
          }

          if (characteristic?.value) {
            const value = Buffer.from(
              characteristic.value,
              "base64"
            ).toString();
            const numValue = Number(value);

            console.log("Distancia recibida:", numValue);
            setDistance(numValue);

            const pattern = getDistancePattern(numValue);

            if (pattern.length) {
              Vibration.vibrate(pattern);
            }
          }
        }
      );
    } catch (err) {
      console.error("Error al configurar monitoreo:", err);
      setConnected(false);
    }
  };

  return (
    <View>
      <ThemedText>Estado Bluetooth: {bluetoothState}</ThemedText>
      <ThemedText>Conectado: {connected ? "Sí" : "No"}</ThemedText>
      {device && <ThemedText>Dispositivo: {device.localName}</ThemedText>}

      <Button
        title="Escanear dispositivos"
        onPress={scanForDevices}
        disabled={bluetoothState !== "PoweredOn"}
      />
      <Button title="Conectar" onPress={connectToDevice} disabled={!device} />

      {connected && device ? (
        <ThemedText>Distancia: {distance} cm</ThemedText>
      ) : null}
    </View>
  );
};

export { BluetoothManager };
