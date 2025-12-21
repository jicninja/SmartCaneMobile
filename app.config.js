const withAndroidXFix = require("./plugins/withAndroidXFix");

export default {
  expo: {
    name: "SmartCane Mobile",
    slug: "SmartCaneMobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "smartcane",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.chafamaster.SmartCaneMobile",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          "This app uses Bluetooth to connect to your SmartCane device.",
        NSBluetoothPeripheralUsageDescription:
          "This app uses Bluetooth to communicate with your SmartCane device.",
        NSLocationWhenInUseUsageDescription:
          "This app needs access to your location to scan for nearby Bluetooth devices.",
        NSLocationAlwaysUsageDescription:
          "This app needs access to your location for navigation features.",
        NSMicrophoneUsageDescription:
          "This app needs microphone access for voice commands.",
        NSSpeechRecognitionUsageDescription:
          "This app needs speech recognition for voice commands.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.RECORD_AUDIO",
        "android.permission.VIBRATE",
      ],
      package: "com.chafamaster.SmartCaneMobile",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      withAndroidXFix,
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            buildToolsVersion: "35.0.0",
            minSdkVersion: 24,
            kotlinVersion: "2.0.21",
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            useAndroidX: true,
            enableJetifier: true,
          },
          ios: {
            deploymentTarget: "15.1",
          },
        },
      ],
      [
        "expo-audio",
        {
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "react-native-ble-plx",
        {
          isBackgroundEnabled: true,
          modes: ["peripheral", "central"],
          bluetoothAlwaysPermission:
            "Allow $(PRODUCT_NAME) to connect to your SmartCane device.",
        },
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow SmartCane to use your location for navigation.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
