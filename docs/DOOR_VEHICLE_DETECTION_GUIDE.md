# Guía de Detección de Puertas y Vehículos con IA

## 🎯 Sistema de Detección Especializado para Smart Cane

Esta guía documenta el sistema de detección inteligente de puertas y vehículos desarrollado específicamente para personas con baja visibilidad.

---

## 📋 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Características Principales](#características-principales)
3. [Instalación](#instalación)
4. [Uso Básico](#uso-básico)
5. [Configuración Avanzada](#configuración-avanzada)
6. [Patrones de Feedback](#patrones-de-feedback)
7. [Optimización](#optimización)
8. [Troubleshooting](#troubleshooting)
9. [Casos de Uso](#casos-de-uso)

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────┐
│          DoorVehicleCamera Component            │
│  (React Native + Vision Camera + MediaPipe)     │
└────────────────┬────────────────────────────────┘
                 │
                 │ Frame Stream (30 FPS)
                 │
┌────────────────▼────────────────────────────────┐
│         MediaPipe Object Detection              │
│    (efficientdet_lite0.tflite - ~20MB)         │
└────────────────┬────────────────────────────────┘
                 │
                 │ Raw Detections
                 │
┌────────────────▼────────────────────────────────┐
│     DoorVehicleDetectionService (IA Core)       │
│                                                  │
│  • Clasificación (puertas vs vehículos)         │
│  • Cálculo de distancia                         │
│  • Análisis de posición                         │
│  • Nivel de peligro                             │
│  • Gestión de historial                         │
│  • Sistema de cooldown                          │
└────────────────┬────────────────────────────────┘
                 │
                 │ Analyzed Detection
                 │
┌────────────────▼────────────────────────────────┐
│            Feedback Multimodal                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Vibración│  │  Audio   │  │ Text-to- │     │
│  │  Háptica │  │ (Beeps)  │  │  Speech  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Captura**: Cámara captura frames a 30 FPS
2. **Procesamiento**: Cada 3er frame se procesa (optimización)
3. **Detección**: MediaPipe detecta objetos con 50%+ confianza
4. **Clasificación**: Service filtra vehículos y puertas
5. **Análisis**: Calcula distancia, posición, peligro
6. **Cooldown**: Verifica si debe alertar (evita spam)
7. **Feedback**: Ejecuta vibración + audio + voz

---

## ✨ Características Principales

### 🚗 Detección de Vehículos

**Tipos detectados:**
- 🚗 Automóviles
- 🚚 Camiones
- 🚌 Autobuses
- 🏍️ Motocicletas
- 🚲 Bicicletas

**Análisis inteligente:**
- ✅ Distancia estimada (inmediato, cerca, medio, lejos)
- ✅ Posición relativa (frente, izquierda, derecha, atrás)
- ✅ Nivel de peligro (crítico, alto, medio, bajo)
- ✅ Contador de vehículos múltiples
- ✅ Priorización por cercanía

**Feedback diferenciado:**
- 🔴 **Inmediato**: Vibración rápida repetida + "¡Peligro! Auto muy cerca!"
- 🟠 **Cerca**: Vibración intensa + "Atención, auto cerca"
- 🟡 **Medio**: Vibración moderada + "Auto a media distancia"
- 🟢 **Lejos**: Vibración suave + "Auto a lo lejos"

### 🚪 Detección de Puertas

**Tipos detectados:**
- 🚪 Puerta genérica
- 🚪↔️ Puerta automática
- 🔄 Puerta giratoria
- 🏛️ Entrada
- 🚶 Salida

**Análisis inteligente:**
- ✅ Ubicación exacta (frente, izquierda, derecha)
- ✅ Tipo de puerta identificado
- ✅ Distancia al usuario
- ✅ Prioridad baja (informativo, no peligro)

**Feedback diferenciado:**
- 🔵 **Izquierda**: Vibración con patrón izquierdo + "Puerta a tu izquierda"
- 🔵 **Derecha**: Vibración con patrón derecho + "Puerta a tu derecha"
- 🔵 **Frente**: Vibración central + "Puerta al frente"
- 🟣 **Automática**: Vibración especial + "Puerta automática al frente"

### 🧠 Sistema Inteligente de Alertas

**Anti-spam:**
- Cooldown de 2 segundos para vehículos
- Cooldown de 5 segundos para puertas
- Evita alertas repetitivas del mismo objeto

**Priorización:**
- Vehículos siempre tienen prioridad sobre puertas
- Objetos más cercanos tienen prioridad sobre lejanos
- Sistema de scoring 1-10 para priorizar alertas

**Adaptación contextual:**
- Múltiples vehículos = alerta más intensa
- Velocidad de voz varía según urgencia
- Pitch de voz más alto = más peligro

---

## 📦 Instalación

### Paso 1: Instalar Dependencias

```bash
# Vision Camera (cámara optimizada)
npx expo install react-native-vision-camera

# MediaPipe Plugin (IA)
npm install vision-camera-plugin-mediapipe

# Expo Speech (Text-to-Speech)
npx expo install expo-speech

# Reanimated (para worklets)
npx expo install react-native-reanimated
```

### Paso 2: Configurar Permisos

**app.config.js:**

```javascript
export default {
  expo: {
    // ... otras configs
    plugins: [
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: 'SmartCane necesita acceso a la cámara para detectar obstáculos y mejorar tu seguridad.',
          enableMicrophonePermission: false,
        },
      ],
    ],
    ios: {
      infoPlist: {
        NSCameraUsageDescription: 'SmartCane usa la cámara para detectar vehículos, puertas y obstáculos en tu camino.',
      },
    },
    android: {
      permissions: [
        'CAMERA',
      ],
    },
  },
};
```

### Paso 3: Prebuild

```bash
# Necesario para módulos nativos
npx expo prebuild

# Ejecutar
npx expo run:android
# o
npx expo run:ios
```

### Paso 4: Copiar Archivos

```
Copiar a tu proyecto:
- services/DoorVehicleDetectionService.ts
- components/DoorVehicleCamera.tsx
- services/AudioService.ts (del AUDIO_MIGRATION_GUIDE.md)
```

---

## 🚀 Uso Básico

### Implementación Simple

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DoorVehicleCamera } from '@/components/DoorVehicleCamera';

export default function DetectionScreen() {
  return (
    <View style={styles.container}>
      <DoorVehicleCamera />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Con Callback de Detecciones

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DoorVehicleCamera } from '@/components/DoorVehicleCamera';
import type { AnalyzedDetection } from '@/services/DoorVehicleDetectionService';

export default function DetectionScreen() {
  const handleDetection = (detection: AnalyzedDetection) => {
    console.log('Detectado:', detection.message);
    console.log('Tipo:', detection.type);
    console.log('Peligro:', detection.dangerLevel);
    console.log('Distancia:', detection.distance);
    
    // Guardar en historial, analytics, etc.
  };

  const handleError = (error: Error) => {
    console.error('Error en cámara:', error);
    // Mostrar mensaje al usuario
  };

  return (
    <View style={styles.container}>
      <DoorVehicleCamera
        onDetection={handleDetection}
        onError={handleError}
        showOverlay={true}
        showDebugInfo={false}
        autoStart={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Integración con Tab Navigation

```typescript
// app/(tabs)/detection.tsx
import { DoorVehicleCamera } from '@/components/DoorVehicleCamera';

export default function DetectionTab() {
  return <DoorVehicleCamera showOverlay={true} />;
}
```

---

## ⚙️ Configuración Avanzada

### Personalizar Umbrales de Detección

**services/DoorVehicleDetectionService.ts:**

```typescript
const CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    vehicle: 0.70,  // Aumentar para menos falsos positivos
    door: 0.50,     // Reducir para detectar más puertas
  },
  
  ALERT_COOLDOWN: {
    vehicle: 1500,  // Reducir para alertas más frecuentes
    door: 3000,     // Aumentar para menos spam
  },
  
  DISTANCE_THRESHOLDS: {
    immediate: 0.50, // Ajustar según necesidad
    near: 0.25,
    medium: 0.10,
    far: 0.0,
  },
};
```

### Ajustar Performance

**components/DoorVehicleCamera.tsx:**

```typescript
// Cambiar modelo de detección
const DETECTION_CONFIG = {
  maxResults: 5,              // Reducir para mejor performance
  scoreThreshold: 0.6,        // Aumentar para mayor precisión
  modelAsset: 'efficientdet_lite0.tflite', // Cambiar modelo
};

// Cambiar FPS
<Camera
  fps={20}  // Reducir para mejor batería
  // ...
/>

// Ajustar skip de frames
doorVehicleDetectionService.setFrameSkipCount(5); // Procesar 1 de cada 5
```

### Personalizar Patrones de Vibración

**services/DoorVehicleDetectionService.ts:**

```typescript
const VIBRATION_PATTERNS = {
  vehicleImmediate: [0, 200, 100, 200, 100, 200],  // Personalizar
  vehicleNear: [0, 300, 200, 300],
  // ... etc
};
```

### Configurar Text-to-Speech

```typescript
const CONFIG = {
  SPEECH_CONFIG: {
    critical: { rate: 1.3, pitch: 1.4 },  // Más rápido y agudo
    high: { rate: 1.2, pitch: 1.2 },
    medium: { rate: 1.0, pitch: 1.0 },
    low: { rate: 0.9, pitch: 0.9 },
  },
};
```

---

## 📳 Patrones de Feedback

### Tabla de Patrones de Vibración

| Escenario | Patrón | Duración Total |
|-----------|--------|----------------|
| Vehículo Inmediato | [0, 100, 50, 100, 50, 100, 50, 100] | ~550ms |
| Vehículo Cerca | [0, 150, 100, 150, 100] | ~500ms |
| Vehículo Medio | [0, 200, 150, 200] | ~550ms |
| Vehículo Lejos | [0, 250] | ~250ms |
| Múltiples Vehículos | [0, 50, 30, 50, 30, 50, 30, 50] | ~290ms |
| Puerta Frente | [0, 200, 100, 200] | ~500ms |
| Puerta Izquierda | [0, 100, 50, 100, 200] | ~450ms |
| Puerta Derecha | [0, 200, 100, 50, 100] | ~450ms |
| Puerta Automática | [0, 150, 150, 150] | ~450ms |

### Códigos de Color (Overlay)

| Nivel de Peligro | Color | Hex |
|------------------|-------|-----|
| Crítico | 🔴 Rojo | #FF0000 |
| Alto | 🟠 Naranja | #FF6600 |
| Medio | 🟡 Amarillo | #FFAA00 |
| Bajo | 🟢 Verde | #00AA00 |

### Iconos de Detección

| Tipo | Icono | Descripción |
|------|-------|-------------|
| Vehículo | 🚗 | Auto genérico |
| Puerta | 🚪 | Puerta genérica |

---

## ⚡ Optimización

### Performance

**Frame Processing:**
```typescript
// Procesar 1 de cada 3 frames = 10 FPS efectivo
// Balance perfecto: velocidad vs batería
doorVehicleDetectionService.setFrameSkipCount(3);
```

**Resolución de Cámara:**
```typescript
<Camera
  preset="medium"  // 'low' para mejor performance
  // ...
/>
```

### Batería

**Pausar cuando no se usa:**
```typescript
import { useIsFocused } from '@react-navigation/native';

export function DetectionScreen() {
  const isFocused = useIsFocused();
  
  return (
    <DoorVehicleCamera
      autoStart={isFocused}  // Solo activo cuando pantalla visible
    />
  );
}
```

**Modo Bajo Consumo:**
```typescript
import { useBatteryLevel } from '@/hooks/useBatteryLevel';

export function DetectionScreen() {
  const batteryLevel = useBatteryLevel();
  const lowPowerMode = batteryLevel < 0.20; // < 20%
  
  useEffect(() => {
    if (lowPowerMode) {
      // Reducir frecuencia de procesamiento
      doorVehicleDetectionService.setFrameSkipCount(6);
    }
  }, [lowPowerMode]);
  
  return <DoorVehicleCamera />;
}
```

### Memoria

**Limpiar historial periódicamente:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    doorVehicleDetectionService.clearHistory();
  }, 60000); // Cada minuto
  
  return () => clearInterval(interval);
}, []);
```

---

## 🐛 Troubleshooting

### Problema: "Frame processor error"

**Causa:** Worklet no configurado correctamente

**Solución:**
```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin', // ← DEBE estar al final
  ],
};
```

### Problema: Detecciones imprecisas

**Causa:** Threshold muy bajo o iluminación pobre

**Solución:**
```typescript
// Aumentar confianza mínima
const CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    vehicle: 0.75, // ↑ Aumentar
    door: 0.65,    // ↑ Aumentar
  },
};
```

### Problema: Alertas repetitivas

**Causa:** Cooldown muy corto

**Solución:**
```typescript
const CONFIG = {
  ALERT_COOLDOWN: {
    vehicle: 3000, // ↑ Aumentar a 3 segundos
    door: 7000,    // ↑ Aumentar a 7 segundos
  },
};
```

### Problema: Performance baja / lag

**Causas posibles:**
1. Procesando demasiados frames
2. Modelo muy pesado
3. Dispositivo antiguo

**Soluciones:**
```typescript
// 1. Procesar menos frames
doorVehicleDetectionService.setFrameSkipCount(5);

// 2. Reducir FPS de cámara
<Camera fps={20} />

// 3. Cambiar a modelo más ligero
const DETECTION_CONFIG = {
  modelAsset: 'ssd_mobilenet_v1.tflite', // Más rápido
};

// 4. Reducir resolución
<Camera preset="low" />

// 5. Reducir max results
const DETECTION_CONFIG = {
  maxResults: 3, // Solo 3 objetos
};
```

### Problema: Consumo alto de batería

**Solución:**
```typescript
// Pausar en segundo plano
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'background') {
      // Pausar cámara
    }
  });
  return () => subscription.remove();
}, []);
```

### Problema: App crashea

**Causa:** Memoria insuficiente

**Solución:**
```typescript
// Limpiar historial más frecuentemente
doorVehicleDetectionService.clearHistory();

// Reducir maxResults
maxResults: 3,

// Reducir resolución
preset: "low",
```

---

## 📊 Casos de Uso

### Caso 1: Navegación Urbana

**Escenario:** Usuario caminando en la ciudad con tráfico

**Configuración recomendada:**
```typescript
const CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    vehicle: 0.70,  // Alta precisión para vehículos
    door: 0.50,     // Normal para puertas
  },
  ALERT_COOLDOWN: {
    vehicle: 1500,  // Alertas frecuentes de vehículos
    door: 5000,     // Menos spam de puertas
  },
};

// Priorizar vehículos
doorVehicleDetectionService.setFrameSkipCount(2); // Alta frecuencia
```

**Resultado:**
- Detección rápida de autos, buses, bicicletas
- Alertas inmediatas para peligros
- Información de puertas cuando relevante

### Caso 2: Navegación en Interiores

**Escenario:** Usuario dentro de edificios, centros comerciales

**Configuración recomendada:**
```typescript
const CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    vehicle: 0.80,  // Muy alto (pocos vehículos en interior)
    door: 0.45,     // Más sensible a puertas
  },
  ALERT_COOLDOWN: {
    vehicle: 3000,
    door: 3000,     // Reducir para detectar más puertas
  },
};
```

**Resultado:**
- Foco en detección de puertas
- Menos alertas de vehículos (falsos positivos)
- Identificación de entradas/salidas

### Caso 3: Modo Ahorro de Batería

**Escenario:** Batería baja, uso prolongado

**Configuración recomendada:**
```typescript
// Procesar menos frames
doorVehicleDetectionService.setFrameSkipCount(6);

// Reducir FPS
<Camera fps={15} preset="low" />

// Aumentar cooldowns
const CONFIG = {
  ALERT_COOLDOWN: {
    vehicle: 3000,
    door: 8000,
  },
};
```

**Resultado:**
- Duración de batería 2-3x más larga
- Detección suficiente para seguridad
- Performance aceptable

### Caso 4: Modo Noche

**Escenario:** Uso nocturno con poca iluminación

**Configuración recomendada:**
```typescript
const CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    vehicle: 0.80,  // Más estricto (peor iluminación)
    door: 0.70,     // Más estricto
  },
};

// Activar flash si disponible (opcional)
<Camera
  torch="on"  // Linterna encendida
/>
```

**Consideraciones:**
- MediaPipe funciona peor con poca luz
- Considerar usar sensores del bastón principalmente
- Cámara como complemento

---

## 📈 Estadísticas y Monitoreo

### Obtener Estadísticas

```typescript
import { doorVehicleDetectionService } from '@/services/DoorVehicleDetectionService';

const stats = doorVehicleDetectionService.getStatistics();

console.log('Total detecciones:', stats.totalDetections);
console.log('Vehículos:', stats.vehicleCount);
console.log('Puertas:', stats.doorCount);
console.log('Confianza promedio:', stats.averageConfidence);
```

### Monitoreo en Tiempo Real

```typescript
export function DetectionStatsPanel() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = doorVehicleDetectionService.getStatistics();
      setStats(currentStats);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View>
      <Text>Detecciones: {stats?.totalDetections}</Text>
      <Text>Vehículos: {stats?.vehicleCount}</Text>
      <Text>Puertas: {stats?.doorCount}</Text>
      <Text>Confianza: {(stats?.averageConfidence * 100).toFixed(1)}%</Text>
    </View>
  );
}
```

---

## 🎓 Mejores Prácticas

### 1. Siempre Proporciona Feedback Multimodal

```typescript
// ✅ CORRECTO: Audio + Vibración + Voz
audioService.play(SoundType.DANGER);
Vibration.vibrate(pattern);
Speech.speak(message);

// ❌ INCORRECTO: Solo uno
Speech.speak(message);
```

### 2. Prioriza Seguridad sobre Información

```typescript
// Vehículos SIEMPRE tienen prioridad
if (vehicles.length > 0) {
  return this.analyzeVehicles(vehicles);
}
// Puertas solo si no hay vehículos
if (doors.length > 0) {
  return this.analyzeDoors(doors);
}
```

### 3. Usa Cooldowns para Evitar Spam

```typescript
// Verifica antes de alertar
if (!this.shouldAlert(key, type)) {
  return null; // Skip alerta
}
```

### 4. Optimiza para Batería

```typescript
// Pausa cuando no está en uso
const isFocused = useIsFocused();
<DoorVehicleCamera autoStart={isFocused} />
```

### 5. Maneja Errores Gracefully

```typescript
<DoorVehicleCamera
  onError={(error) => {
    // Log error
    console.error(error);
    // Mostrar UI amigable
    showErrorToast('Error en cámara');
    // Fallback a sensores del bastón
    switchToSensorMode();
  }}
/>
```

---

## 📚 Recursos Adicionales

### Documentación Relacionada

- `ACCESSIBILITY_GUIDELINES.md` - Guía completa de accesibilidad
- `AUDIO_MIGRATION_GUIDE.md` - Configuración de audio
- `AI_CAMERA_MODELS_GUIDE.md` - Modelos de IA disponibles

### Referencias Externas

- [MediaPipe Object Detection](https://developers.google.com/mediapipe/solutions/vision/object_detector)
- [Vision Camera Docs](https://react-native-vision-camera.com/)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)
- [React Native Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

---

## 🔮 Próximas Mejoras

### Roadmap

**v1.1 (Próximo):**
- [ ] Tracking de movimiento de vehículos
- [ ] Detección de dirección (acercándose/alejándose)
- [ ] Histórico de rutas con obstáculos

**v1.2:**
- [ ] OCR para lectura de señales
- [ ] Detección de semáforos
- [ ] Reconocimiento de pasos de cebra

**v1.3:**
- [ ] Modo indoor mejorado
- [ ] Detección de escaleras
- [ ] Mapeo de espacios interiores

**v2.0:**
- [ ] IA personalizada entrenada con datos reales
- [ ] Integración con GPS para contexto
- [ ] Modo social (detectar amigos/familia)

---

## 📞 Soporte

**Issues comunes:** Ver sección [Troubleshooting](#troubleshooting)

**Performance:** Ver sección [Optimización](#optimización)

**Bugs:** Reportar con logs y configuración del dispositivo

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Autor:** Smart Cane Mobile Team  
**Licencia:** MIT

