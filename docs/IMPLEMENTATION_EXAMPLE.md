# 🚀 Ejemplo de Implementación Completa - SmartCane App

## Cómo integrar todas las mejoras en tu app

---

## 📁 Estructura de Archivos Actualizada

```
SmartCaneMobile/
├── app/
│   ├── index.tsx                    ← Pantalla principal (mejorada)
│   ├── detection.tsx                ← Nueva: Pantalla de detección AI
│   ├── settings.tsx                 ← Nueva: Configuración
│   └── _layout.tsx
├── components/
│   ├── Bluetooth.tsx                ← Ya mejorado
│   ├── AccessibleModal.tsx          ← Nuevo: Modales accesibles
│   ├── DetectionStream.tsx          ← Nuevo: Vista de detección
│   ├── ThemedView.tsx
│   └── ThemedText.tsx
├── services/
│   ├── AudioManager.ts              ← Nuevo: Gestión de audio
│   ├── AIDetectionService.ts        ← Nuevo: Detección con AI
│   └── GPSService.ts                ← Nuevo: Ubicación
├── hooks/
│   ├── useVoiceCommands.ts          ← Nuevo: Comandos de voz
│   └── useColorScheme.ts
└── docs/
    └── UI_UX_GUIDELINES.md          ← Nueva: Guía completa
```

---

## 🔧 Paso 1: Instalar Dependencias

```bash
# Instalación de paquetes necesarios
npx expo install expo-speech expo-haptics expo-location

# Para reconocimiento de voz (requiere prebuild)
npm install @react-native-voice/voice

# Para AI/ML (TensorFlow Lite)
npx expo install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

**Actualizar `package.json`:**
```json
{
  "dependencies": {
    "expo-speech": "~13.0.0",
    "expo-haptics": "~15.0.7",
    "expo-location": "~18.0.5",
    "@react-native-voice/voice": "^3.2.4",
    "@tensorflow/tfjs": "^4.11.0"
  }
}
```

---

## 🎯 Paso 2: Actualizar la Pantalla Principal

**Reemplaza `app/index.tsx` con:**

```typescript
import { StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { AudioManager } from "@/services/AudioManager";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useVoiceCommands, createDefaultVoiceCommands } from "@/hooks/useVoiceCommands";

export default function HomeScreen(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [distance, setDistance] = useState(0);

  // Voice commands setup
  const voiceCommands = createDefaultVoiceCommands({
    onWhereAmI: () => {
      AudioManager.announce(
        "Estás en Avenida Principal, cerca de Plaza Mayor",
        "medium",
        "info"
      );
    },
    onWhatsAhead: () => {
      AudioManager.announce(
        "Acera libre, sin obstáculos detectados",
        "medium",
        "info"
      );
    },
    onRepeat: () => {
      AudioManager.repeatLast();
    },
    onEmergency: handleEmergency,
  });

  const { startListening } = useVoiceCommands(voiceCommands);

  useEffect(() => {
    // Announce screen on load
    AudioManager.announce(
      "Pantalla principal. Toque dos veces en cualquier lugar para activar comandos de voz",
      "medium"
    );
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setShowConnectionError(true);
    }
  }, [isConnected]);

  const handleEmergency = (): void => {
    AudioManager.announce(
      "Alerta de emergencia activada",
      "critical",
      "error"
    );
    // TODO: Llamar a contacto de emergencia
  };

  const handleReconnect = async (): Promise<void> => {
    AudioManager.announce("Intentando reconectar", "medium", "info");
    // TODO: Lógica de reconexión
    setShowConnectionError(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        style={styles.container}
        onPress={startListening}
        accessibilityLabel="Activar comandos de voz"
      >
        <ThemedView style={styles.container}>
          {/* Connection Status */}
          <ThemedView
            style={[
              styles.statusCard,
              isConnected ? styles.connected : styles.disconnected,
            ]}
          >
            <ThemedText type="title">{isConnected ? "●" : "○"}</ThemedText>
            <ThemedText type="subtitle">
              {isConnected ? "CONECTADO" : "DESCONECTADO"}
            </ThemedText>
          </ThemedView>

          {/* Distance Display */}
          {isConnected && distance > 0 && (
            <ThemedView style={styles.distanceCard}>
              <ThemedText style={styles.distance}>{distance}</ThemedText>
              <ThemedText type="subtitle">CM</ThemedText>
            </ThemedView>
          )}

          {/* Emergency Button */}
          <Pressable
            style={styles.emergencyButton}
            onPress={handleEmergency}
          >
            <ThemedText style={styles.emergencyIcon}>🚨</ThemedText>
            <ThemedText type="title">EMERGENCIA</ThemedText>
          </Pressable>
        </ThemedView>
      </Pressable>

      {/* Connection Error Modal */}
      <AccessibleModal
        visible={showConnectionError}
        type="error"
        title="CONEXIÓN PERDIDA"
        message="El bastón inteligente no está conectado. Verifique que esté encendido."
        primaryButton={{
          label: "RECONECTAR",
          onPress: handleReconnect,
        }}
        secondaryButton={{
          label: "CANCELAR",
          onPress: () => setShowConnectionError(false),
        }}
      />
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
    padding: 20,
    gap: 20,
  },
  statusCard: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 4,
    minHeight: 120,
  },
  connected: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
  },
  disconnected: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
  },
  distanceCard: {
    flex: 1,
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#2196f3",
  },
  distance: {
    fontSize: 96,
    fontWeight: "bold",
    color: "#1976d2",
  },
  emergencyButton: {
    backgroundColor: "#ffcdd2",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#d32f2f",
    minHeight: 150,
  },
  emergencyIcon: {
    fontSize: 64,
  },
});
```

---

## 🔊 Paso 3: Usar AudioManager en Toda la App

**En cualquier componente:**

```typescript
import { AudioManager } from "@/services/AudioManager";

// Anuncio crítico (obstáculo)
AudioManager.announce(
  "Alerta: Obstáculo a 50 centímetros",
  "critical",
  "error"
);

// Anuncio de alta prioridad (persona)
AudioManager.announce(
  "Persona caminando a tu derecha",
  "high",
  "warning"
);

// Información normal
AudioManager.announce(
  "Conectado al bastón",
  "medium",
  "success"
);

// Ajustar velocidad de voz
AudioManager.increaseSpeechRate(); // Más rápido
AudioManager.decreaseSpeechRate(); // Más lento
```

---

## 📳 Paso 4: Usar Patrones Hápticos

**Crear archivo `constants/HapticPatterns.ts`:**

```typescript
export const SmartCaneHaptics = {
  // Obstáculos
  obstacle_immediate: [50, 50, 50, 50, 50, 50],
  obstacle_near: [100, 100, 100, 100],
  obstacle_medium: [200, 150, 200],
  
  // Detecciones
  person: [150, 100, 150],
  vehicle: [100, 50, 100, 50, 100],
  animal: [200, 100, 100, 100, 200],
  
  // Estados
  connected: [100, 100, 100],
  disconnected: [500, 200, 500],
};

export function playPattern(pattern: number[]): void {
  Vibration.vibrate(pattern);
}
```

**Usar en componentes:**

```typescript
import { playPattern, SmartCaneHaptics } from "@/constants/HapticPatterns";

// Al detectar persona
playPattern(SmartCaneHaptics.person);
AudioManager.announce("Persona detectada", "high", "warning");
```

---

## 🎤 Paso 5: Implementar Comandos de Voz

**En tu componente principal:**

```typescript
import { useVoiceCommands, createDefaultVoiceCommands } from "@/hooks/useVoiceCommands";

function MyComponent() {
  const commands = createDefaultVoiceCommands({
    onWhereAmI: () => {
      // Obtener ubicación GPS y anunciar
      getCurrentLocation().then(loc => {
        AudioManager.announce(
          `Estás en ${loc.address}`,
          "medium"
        );
      });
    },
    onWhatsAhead: () => {
      // Obtener detecciones de cámara
      getDetections().then(objects => {
        const description = objects
          .map(obj => `${obj.type} a ${obj.distance} metros`)
          .join(", ");
        AudioManager.announce(description, "medium");
      });
    },
    onEmergency: () => {
      callEmergencyContact();
    },
  });

  const { startListening, isListening } = useVoiceCommands(commands);

  return (
    <Pressable onLongPress={startListening}>
      {/* Tu contenido */}
    </Pressable>
  );
}
```

---

## 🤖 Paso 6: Integrar Detección AI

**Crear `services/AIDetectionService.ts`:**

```typescript
import * as tf from '@tensorflow/tfjs';
import { DetectedObject } from '@/types';

class AIDetectionService {
  private model: tf.LayersModel | null = null;

  async loadModel(): Promise<void> {
    // Cargar modelo TensorFlow Lite
    this.model = await tf.loadLayersModel('path/to/model.json');
  }

  async detectObjects(imageData: ImageData): Promise<DetectedObject[]> {
    if (!this.model) return [];

    // Procesar imagen
    const tensor = tf.browser.fromPixels(imageData);
    const predictions = await this.model.predict(tensor) as tf.Tensor;
    
    // Convertir predictions a objetos detectados
    return this.parsePredictions(predictions);
  }

  private parsePredictions(predictions: tf.Tensor): DetectedObject[] {
    // Parsear y filtrar detecciones
    // Retornar solo objetos relevantes
    return [];
  }
}

export const AIDetection = new AIDetectionService();
```

---

## 📱 Paso 7: Actualizar Componente Bluetooth

**Integrar AudioManager en `components/Bluetooth.tsx`:**

```typescript
import { AudioManager } from "@/services/AudioManager";

// En connectToDevice()
const connectToDevice = async (): Promise<void> => {
  AudioManager.announce("Conectando al bastón", "medium", "info");
  
  try {
    await device.connect();
    setConnected(true);
    AudioManager.announce("Conectado exitosamente", "medium", "success");
  } catch (error) {
    AudioManager.announce(
      "Error de conexión. Intente nuevamente",
      "high",
      "error"
    );
  }
};

// Al recibir distancia
const onDistanceUpdate = (distance: number): void => {
  setDistance(distance);
  
  if (distance < 100) {
    AudioManager.announce(
      `Alerta: Obstáculo a ${distance} centímetros`,
      "critical",
      "error"
    );
    playPattern(SmartCaneHaptics.obstacle_immediate);
  }
};
```

---

## ⚙️ Paso 8: Configurar Permisos

**Actualizar `app.config.js`:**

```javascript
export default {
  expo: {
    // ... configuración existente
    android: {
      permissions: [
        // Bluetooth
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        
        // Ubicación
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        
        // Micrófono (para voz)
        "android.permission.RECORD_AUDIO",
        
        // Cámara
        "android.permission.CAMERA",
      ],
    },
    ios: {
      infoPlist: {
        NSBluetoothAlwaysUsageDescription: "Para conectar con el bastón",
        NSLocationWhenInUseUsageDescription: "Para navegación",
        NSMicrophoneUsageDescription: "Para comandos de voz",
        NSCameraUsageDescription: "Para detección de objetos",
        NSSpeechRecognitionUsageDescription: "Para comandos de voz",
      },
    },
  },
};
```

---

## 🎨 Paso 9: Aplicar Estilos Accesibles

**Crear `constants/AccessibleStyles.ts`:**

```typescript
import { StyleSheet } from "react-native";

export const AccessibleStyles = StyleSheet.create({
  // Botones grandes
  largeButton: {
    minHeight: 80,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Textos grandes
  largeText: {
    fontSize: 24,
    lineHeight: 32,
  },
  hugeText: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "bold",
  },
  
  // Alto contraste
  highContrast: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  
  // Estados visuales claros
  success: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
    borderWidth: 4,
  },
  error: {
    backgroundColor: "#ffebee",
    borderColor: "#d32f2f",
    borderWidth: 4,
  },
  warning: {
    backgroundColor: "#fff3e0",
    borderColor: "#f57c00",
    borderWidth: 4,
  },
});
```

---

## ✅ Checklist de Implementación

### Fase 1: Básico (Ya está)
- [x] Tema siempre claro
- [x] SafeAreaView en todas las pantallas
- [x] Componente Bluetooth mejorado
- [x] Sin console.log

### Fase 2: Audio y Haptics
- [ ] Integrar AudioManager en toda la app
- [ ] Implementar patrones hápticos
- [ ] Anuncios automáticos al conectar/desconectar
- [ ] Anuncios de distancia crítica

### Fase 3: Voz
- [ ] Implementar reconocimiento de voz
- [ ] Comandos básicos de navegación
- [ ] Comandos de control
- [ ] Comandos de configuración

### Fase 4: Detección AI
- [ ] Integrar modelo TensorFlow
- [ ] Detección de personas
- [ ] Detección de vehículos
- [ ] Detección de obstáculos
- [ ] Sistema de prioridades

### Fase 5: GPS
- [ ] Integrar servicio de ubicación
- [ ] Anuncios de ubicación
- [ ] Detección de intersecciones
- [ ] Puntos de interés cercanos

### Fase 6: Emergencias
- [ ] Botón de emergencia funcional
- [ ] Llamada a contacto de emergencia
- [ ] Envío de ubicación
- [ ] Alertas automáticas

---

## 🧪 Testing

### Test con Usuarios
```typescript
// Test de accesibilidad
import { render, fireEvent } from '@testing-library/react-native';

test('Botón de emergencia accesible', () => {
  const { getByLabelText } = render(<HomeScreen />);
  const button = getByLabelText('Botón de emergencia');
  
  expect(button).toBeTruthy();
  expect(button.props.accessibilityRole).toBe('button');
});
```

### Test Manual
1. **Con VoiceOver (iOS) / TalkBack (Android) activado**
2. **Con pantalla apagada** (solo audio)
3. **En ambiente ruidoso**
4. **Caminando** (test real)

---

## 📚 Recursos Adicionales

- **Documentación:** Ver `docs/UI_UX_GUIDELINES.md`
- **AudioManager:** Ver `services/AudioManager.ts`
- **Modal Accesible:** Ver `components/AccessibleModal.tsx`
- **Voice Commands:** Ver `hooks/useVoiceCommands.ts`

---

## 🚀 Próximos Pasos Inmediatos

1. Instalar dependencias de audio y haptics
2. Integrar AudioManager en pantalla principal
3. Agregar modales de error con AccessibleModal
4. Implementar patrones hápticos básicos
5. Testear con usuarios ciegos

---

**¿Necesitas ayuda con alguna implementación específica?**
Puedo ayudarte a crear cualquier componente o servicio adicional que necesites.

