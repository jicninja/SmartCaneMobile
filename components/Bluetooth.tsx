import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Vibration,
} from 'react-native';
import { BleManager, type Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import { ThemedText } from './ThemedText';

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
  const [beep, setBeep] = useState();

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Bluetooth permission denied');
      }
    }
  };

  useEffect(() => {
    requestPermissions();
    playBeep();

    return () => {
      manager.destroy();
    };
  }, [manager]);

  const scanForDevices = () => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        return;
      }

      // Filtrar por nombre o UUID de tu dispositivo ESP32

      if (scannedDevice && scannedDevice?.localName === 'SmartCane') {
        setDevice(scannedDevice);
        manager.stopDeviceScan();
      }
    });
  };

  const connectToDevice = async () => {
    if (device) {
      try {
        await device.connect();
        setConnected(true);
        readData();
        console.log('Conectado a', device.name);
      } catch (error) {
        setConnected(false);
        console.error('Error al conectar:', error);
      }
    }
  };

  const playBeep = async () => {
    const pattern = getDistancePattern(distance);

    if (!pattern.length) {
      return;
    }

    const beepDuration = pattern[1];

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/beep.mp3') // Asegúrate de tener un archivo beep.mp3 en la carpeta assets
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
    //manager.stopDeviceScan();

    setInterval(async () => {
      try {
        const isConnected = await device.isConnected();

        if (!isConnected) {
          await device.connect();
        }

        await device.discoverAllServicesAndCharacteristics();

        const characteristic = await device.readCharacteristicForService(
          '180D',
          '2A37'
        );

        const value = Buffer.from(characteristic.value, 'base64').toString();
        const numValue = Number(value);

        console.log('Valor de la característica:', characteristic.value, value);

        setDistance(numValue);

        const pattern = getDistancePattern(numValue);

        if (pattern.length) {
          Vibration.vibrate(pattern);
        }

        /*


        if (numValue < 20) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (numValue < 200) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (numValue < 300) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        */
      } catch (err) {
        console.log('error aca');
      }
    }, 1000);
  };

  return (
    <View>
      <ThemedText>Conectado: {connected ? 'Sí' : 'No'}</ThemedText>
      <Button title="Escanear dispositivos" onPress={scanForDevices} />
      <Button title="Conectar" onPress={connectToDevice} disabled={!device} />

      {connected && device ? (
        <ThemedText>Distancia: {distance}</ThemedText>
      ) : null}
    </View>
  );
};

export { BluetoothManager };
