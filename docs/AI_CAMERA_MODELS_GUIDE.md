# Guía de Modelos AI para Streaming de Cámara en React Native

## 🎥 Smart Cane Mobile - Procesamiento de Video con IA

---

## Contexto: ¿Por qué IA en la Cámara?

Para tu aplicación de bastón inteligente, la IA con cámara puede proporcionar:

- 🚧 **Detección de obstáculos** en tiempo real (escaleras, bordillos, objetos)
- 🚦 **Reconocimiento de señales** de tránsito y señalización
- 📝 **Lectura de texto** (OCR) en letreros, carteles, menús
- 🚪 **Detección de puertas** y entradas
- 👥 **Identificación de personas** para navegación en multitudes
- 🌳 **Clasificación de objetos** del entorno
- 🎯 **Navegación asistida** con comprensión del contexto

---

## 🏆 Top 3 Soluciones Recomendadas

### 1. ⭐ **MediaPipe + Vision Camera** (MI RECOMENDACIÓN)

**Stack completo:**
- `react-native-vision-camera` v4+ (cámara)
- `vision-camera-plugin-mediapipe` (plugin)
- MediaPipe Tasks (modelos)

#### ✅ Ventajas
- **Optimizado para móviles**: Diseñado específicamente para dispositivos móviles
- **Bajo consumo**: GPU acceleration nativa
- **Múltiples capacidades**: Object detection, pose detection, face detection, segmentation
- **Latencia ultra baja**: < 50ms en dispositivos modernos
- **Google mantiene**: Actualizaciones constantes
- **Licencia permisiva**: Apache 2.0
- **Modelos pre-entrenados**: Listos para usar
- **React Native nativo**: Frame processors en C++/JSI

#### ❌ Desventajas
- Requiere Expo prebuild
- Curva de aprendizaje moderada
- Tamaño de app aumenta (~20-30MB)

#### 📦 Instalación

```bash
# Instalar vision camera
npx expo install react-native-vision-camera

# Instalar plugin de MediaPipe
npm install vision-camera-plugin-mediapipe

# Prebuild
npx expo prebuild
```

#### 🔧 Configuración Básica

**app.json / app.config.js:**
```javascript
{
  "expo": {
    "plugins": [
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "$(PRODUCT_NAME) necesita acceso a la cámara para detectar obstáculos",
          "enableMicrophonePermission": false
        }
      ]
    ]
  }
}
```

#### 💻 Código de Implementación

**components/AICamera.tsx:**

```typescript
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useFrameProcessor 
} from 'react-native-vision-camera';
import { 
  ObjectDetection,
  ObjectDetectionResult 
} from 'vision-camera-plugin-mediapipe';
import { audioService, SoundType } from '@/services/AudioService';

interface AIDetectionCameraProps {
  onObjectDetected?: (objects: ObjectDetectionResult[]) => void;
}

export const AIDetectionCamera: React.FC<AIDetectionCameraProps> = ({
  onObjectDetected
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const device = useCameraDevice('back');

  // Solicitar permisos
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Frame processor - procesa cada frame en tiempo real
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // Detectar objetos en el frame
    const results = ObjectDetection.detect(frame, {
      maxResults: 5,
      scoreThreshold: 0.5, // 50% de confianza mínima
      modelAsset: 'efficientdet_lite0.tflite'
    });

    // Procesar resultados
    if (results.length > 0) {
      // Filtrar objetos peligrosos
      const dangerousObjects = results.filter(obj => 
        ['stairs', 'car', 'bicycle', 'person'].includes(obj.label)
      );

      if (dangerousObjects.length > 0) {
        // Vibración de alerta
        runOnJS(handleDangerDetected)(dangerousObjects);
      }

      // Callback con todos los objetos
      if (onObjectDetected) {
        runOnJS(onObjectDetected)(results);
      }
    }
  }, [onObjectDetected]);

  const handleDangerDetected = (objects: ObjectDetectionResult[]) => {
    // Audio feedback
    audioService.play(SoundType.DANGER);
    
    // Vibración de peligro
    Vibration.vibrate([0, 50, 50, 50, 50, 50]);
    
    // Actualizar UI
    setDetectedObjects(objects.map(obj => obj.label));
  };

  if (!hasPermission) {
    return <Text>Esperando permisos de cámara...</Text>;
  }

  if (!device) {
    return <Text>No se encontró cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      {/* Overlay con objetos detectados */}
      <View style={styles.overlay}>
        {detectedObjects.map((obj, index) => (
          <Text 
            key={index} 
            style={styles.detectionText}
            accessible={true}
            accessibilityLabel={`Objeto detectado: ${obj}`}
          >
            ⚠️ {obj}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  detectionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
```

#### 🎯 Modelos Disponibles en MediaPipe

1. **Object Detection** (Detección de objetos)
   - EfficientDet-Lite0: Rápido, baja latencia
   - EfficientDet-Lite2: Balance precisión/velocidad
   - MobileNet-SSD: Muy rápido, menos preciso

2. **Image Segmentation** (Segmentación)
   - DeepLab v3: Segmentación semántica
   - Selfie Segmentation: Personas vs fondo

3. **Face Detection** (Detección de rostros)
   - BlazeFace: Ultra rápido

4. **Pose Detection** (Detección de poses)
   - BlazePose: Detección de esqueleto humano

5. **Hands Detection** (Detección de manos)
   - MediaPipe Hands: Gestos con las manos

---

### 2. **TensorFlow Lite + Vision Camera**

**Stack:**
- `react-native-vision-camera`
- `react-native-fast-tflite`
- Modelos TFLite personalizados

#### ✅ Ventajas
- **Máxima flexibilidad**: Usa cualquier modelo TFLite
- **Personalizable**: Entrena tus propios modelos
- **Gran ecosistema**: Muchos modelos pre-entrenados
- **Optimizado**: GPU/NNAPI acceleration en Android, CoreML en iOS
- **Control total**: Sobre preprocessing y postprocessing

#### ❌ Desventajas
- Más complejo de configurar
- Necesitas conocimiento de ML para personalización
- Más grande que MediaPipe

#### 📦 Instalación

```bash
npx expo install react-native-vision-camera
npm install react-native-fast-tflite

npx expo prebuild
```

#### 💻 Ejemplo de Uso

```typescript
import { useFrameProcessor } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';

export function TFLiteCamera() {
  // Cargar modelo
  const model = useTensorflowModel(
    require('../assets/models/ssd_mobilenet_v1.tflite')
  );

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    if (model.state !== 'loaded') return;

    // Ejecutar inferencia
    const output = model.run(frame);
    
    // Procesar resultados
    const detections = parseDetections(output);
    
    if (detections.length > 0) {
      runOnJS(handleDetections)(detections);
    }
  }, [model]);

  return (
    <Camera
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
    />
  );
}
```

#### 🎯 Modelos TFLite Recomendados

1. **SSD MobileNet V2** 
   - Propósito: Detección de objetos general
   - Velocidad: ~40ms/frame
   - Precisión: Media-Alta
   - Tamaño: ~20MB

2. **YOLOv8n (Nano)**
   - Propósito: Detección rápida
   - Velocidad: ~25ms/frame
   - Precisión: Alta
   - Tamaño: ~6MB

3. **MobileNet V3**
   - Propósito: Clasificación de imágenes
   - Velocidad: ~15ms/frame
   - Precisión: Alta
   - Tamaño: ~5MB

---

### 3. **YOLO + Vision Camera** (Para casos avanzados)

**Stack:**
- `react-native-vision-camera`
- Custom YOLO implementation o `react-native-pytorch-core`
- Modelos YOLO (v8, v9, v10)

#### ✅ Ventajas
- **Estado del arte**: Mejor precisión en detección
- **Muy rápido**: Especialmente YOLO Nano
- **Flexible**: Múltiples tareas (detection, segmentation, pose)
- **Comunidad activa**: Ultralytics mantiene YOLO

#### ❌ Desventajas
- Implementación más compleja
- Requiere conversión de modelos (PyTorch → TFLite)
- Mayor consumo de batería
- Curva de aprendizaje alta

#### 📦 Instalación

```bash
npx expo install react-native-vision-camera
npm install react-native-pytorch-core

# O usar TFLite con modelos YOLO convertidos
npm install react-native-fast-tflite
```

#### 🎯 Modelos YOLO Recomendados

1. **YOLOv8n** (Nano)
   - Más rápido para móviles
   - ~6MB
   - 30-50 FPS en dispositivos modernos

2. **YOLOv8s** (Small)
   - Balance velocidad/precisión
   - ~11MB
   - 20-30 FPS

---

## 📊 Comparación de Soluciones

| Característica | MediaPipe | TensorFlow Lite | YOLO |
|---------------|-----------|-----------------|------|
| **Facilidad de uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Velocidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Precisión** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tamaño app** | +20MB | +15MB | +25MB |
| **Batería** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Personalización** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentación** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mantenimiento** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Recomendación por Caso de Uso

### Para Smart Cane Mobile: **MediaPipe** ⭐

**Razones:**

1. ✅ **Optimizado para accesibilidad**: Modelos ligeros, respuesta rápida
2. ✅ **Bajo consumo**: Importante para uso prolongado
3. ✅ **Fácil integración**: Menos complejidad = menos bugs
4. ✅ **Soporte de Google**: Mantenimiento garantizado
5. ✅ **Modelos listos**: No necesitas entrenar modelos
6. ✅ **Múltiples capacidades**: Objetos, texto (OCR), rostros

### Casos de uso específicos:

```typescript
// 1. Detección de obstáculos → MediaPipe Object Detection
// 2. Lectura de texto → MediaPipe Text Recognition / OCR
// 3. Detección de personas → MediaPipe Face/Pose Detection
// 4. Clasificación de objetos → MediaPipe Image Classification
```

---

## 🚀 Plan de Implementación Recomendado

### Fase 1: Setup Básico (Día 1-2)

```bash
# 1. Instalar dependencias
npx expo install react-native-vision-camera
npm install vision-camera-plugin-mediapipe

# 2. Configurar permisos
# Editar app.config.js (ver arriba)

# 3. Prebuild
npx expo prebuild

# 4. Probar cámara básica
npx expo run:android
```

### Fase 2: Integración MediaPipe (Día 3-5)

1. Crear componente `AICamera.tsx`
2. Implementar frame processor con detección
3. Agregar feedback háptico + audio
4. Testear con objetos reales

### Fase 3: Optimización (Día 6-7)

1. Ajustar threshold de detección
2. Filtrar falsos positivos
3. Optimizar consumo de batería
4. Agregar configuraciones de usuario

### Fase 4: Features Avanzadas (Semana 2)

1. OCR para lectura de texto
2. Detección de señales de tránsito
3. Modo de navegación indoor
4. Histórico de detecciones

---

## 💻 Ejemplo Completo de Implementación

### 1. Servicio de IA

**services/AIVisionService.ts:**

```typescript
import { ObjectDetectionResult } from 'vision-camera-plugin-mediapipe';

export enum DetectionCategory {
  DANGER = 'danger',      // Obstáculos peligrosos
  WARNING = 'warning',    // Advertencias
  INFO = 'info',          // Información general
}

interface DetectionRule {
  labels: string[];
  category: DetectionCategory;
  message: string;
  vibrationPattern: number[];
  soundType: string;
}

export class AIVisionService {
  private rules: DetectionRule[] = [
    {
      labels: ['stairs', 'escalator'],
      category: DetectionCategory.DANGER,
      message: 'Escaleras detectadas adelante',
      vibrationPattern: [0, 50, 50, 50, 50, 50],
      soundType: 'danger',
    },
    {
      labels: ['car', 'truck', 'bus', 'bicycle', 'motorcycle'],
      category: DetectionCategory.DANGER,
      message: 'Vehículo cercano',
      vibrationPattern: [0, 100, 50, 100, 50, 100],
      soundType: 'danger',
    },
    {
      labels: ['person'],
      category: DetectionCategory.WARNING,
      message: 'Persona adelante',
      vibrationPattern: [0, 200],
      soundType: 'notification',
    },
    {
      labels: ['door', 'gate'],
      category: DetectionCategory.INFO,
      message: 'Puerta detectada',
      vibrationPattern: [0, 100],
      soundType: 'confirmation',
    },
    {
      labels: ['bench', 'chair'],
      category: DetectionCategory.INFO,
      message: 'Asiento disponible',
      vibrationPattern: [0, 150],
      soundType: 'notification',
    },
  ];

  /**
   * Procesar detecciones y clasificarlas
   */
  processDetections(
    detections: ObjectDetectionResult[]
  ): DetectionRule | null {
    // Ordenar por score (confianza)
    const sorted = [...detections].sort((a, b) => b.score - a.score);

    // Buscar coincidencia con reglas (prioridad: danger > warning > info)
    for (const detection of sorted) {
      const rule = this.rules.find(r => 
        r.labels.includes(detection.label.toLowerCase())
      );
      
      if (rule) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Calcular distancia estimada basada en bounding box
   */
  estimateDistance(detection: ObjectDetectionResult): 'near' | 'medium' | 'far' {
    const boxArea = detection.boundingBox.width * detection.boundingBox.height;
    
    if (boxArea > 0.3) return 'near';      // Ocupa >30% del frame
    if (boxArea > 0.1) return 'medium';    // Ocupa >10% del frame
    return 'far';                           // Ocupa <10% del frame
  }

  /**
   * Obtener descripción de audio para screen readers
   */
  getAccessibilityDescription(
    detections: ObjectDetectionResult[]
  ): string {
    if (detections.length === 0) {
      return 'No se detectaron obstáculos';
    }

    const objects = detections.map(d => d.label).join(', ');
    return `Detectado: ${objects}`;
  }
}

export const aiVisionService = new AIVisionService();
```

### 2. Componente de Cámara Inteligente

**components/SmartCaneCamera.tsx:**

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Vibration } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useFrameProcessor 
} from 'react-native-vision-camera';
import { ObjectDetection } from 'vision-camera-plugin-mediapipe';
import { runOnJS } from 'react-native-reanimated';
import { audioService, SoundType } from '@/services/AudioService';
import { 
  aiVisionService, 
  DetectionCategory 
} from '@/services/AIVisionService';
import * as Speech from 'expo-speech';

export const SmartCaneCamera: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [lastDetection, setLastDetection] = useState<string>('');
  const [detectionTime, setDetectionTime] = useState<number>(0);
  
  const device = useCameraDevice('back');

  // Solicitar permisos
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Throttle para evitar demasiadas alertas
  const shouldProcessDetection = useCallback((label: string): boolean => {
    const now = Date.now();
    const timeSinceLastDetection = now - detectionTime;
    
    // Si es la misma detección y han pasado menos de 3 segundos, ignorar
    if (label === lastDetection && timeSinceLastDetection < 3000) {
      return false;
    }
    
    return true;
  }, [lastDetection, detectionTime]);

  // Handler de detecciones
  const handleDetections = useCallback((results: any[]) => {
    if (results.length === 0) return;

    // Procesar con el servicio de IA
    const rule = aiVisionService.processDetections(results);
    
    if (!rule) return;
    
    // Verificar throttle
    if (!shouldProcessDetection(rule.message)) return;

    // Actualizar estado
    setLastDetection(rule.message);
    setDetectionTime(Date.now());

    // Feedback háptico
    Vibration.vibrate(rule.vibrationPattern);

    // Feedback de audio
    if (rule.category === DetectionCategory.DANGER) {
      audioService.play(SoundType.DANGER);
    } else if (rule.category === DetectionCategory.WARNING) {
      audioService.play(SoundType.ALERT);
    } else {
      audioService.play(SoundType.NOTIFICATION);
    }

    // Text-to-Speech
    Speech.speak(rule.message, {
      language: 'es-ES',
      pitch: rule.category === DetectionCategory.DANGER ? 1.2 : 1.0,
      rate: rule.category === DetectionCategory.DANGER ? 1.1 : 1.0,
    });
  }, [shouldProcessDetection]);

  // Frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // Ejecutar detección cada N frames (optimización)
    if (frame.timestamp % 5 !== 0) return;

    try {
      const results = ObjectDetection.detect(frame, {
        maxResults: 5,
        scoreThreshold: 0.6, // 60% confianza mínima
        modelAsset: 'efficientdet_lite0.tflite'
      });

      if (results.length > 0) {
        runOnJS(handleDetections)(results);
      }
    } catch (error) {
      console.error('Error in frame processor:', error);
    }
  }, [handleDetections]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text 
          style={styles.messageText}
          accessible={true}
          accessibilityRole="text"
        >
          Solicitando permisos de cámara...
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>
          No se encontró cámara disponible
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
      />
      
      {/* Overlay con última detección */}
      {lastDetection && (
        <View 
          style={styles.detectionOverlay}
          accessible={true}
          accessibilityLabel={`Última detección: ${lastDetection}`}
          accessibilityRole="alert"
        >
          <Text style={styles.detectionText}>
            {lastDetection}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messageText: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
    padding: 20,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  detectionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
```

---

## ⚡ Optimizaciones de Performance

### 1. Procesamiento Selectivo de Frames

```typescript
// Procesar 1 de cada 5 frames (12 FPS en lugar de 60 FPS)
if (frame.timestamp % 5 !== 0) return;
```

### 2. Resolución Reducida

```typescript
<Camera
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
  pixelFormat="yuv"
  // Reducir resolución para mejor performance
  fps={30}
  video={true}
  preset="medium" // 'low', 'medium', 'high'
/>
```

### 3. Throttling de Detecciones

```typescript
// Evitar alertas repetitivas del mismo objeto
const DETECTION_COOLDOWN = 3000; // 3 segundos
```

### 4. Background Processing

```typescript
// Usar worklet threads para no bloquear UI
'worklet';
```

---

## 🔋 Optimización de Batería

### Estrategias:

1. **Modo de bajo consumo**
   ```typescript
   // Reducir FPS cuando batería < 20%
   const fps = batteryLevel < 0.2 ? 15 : 30;
   ```

2. **Detección on-demand**
   ```typescript
   // Activar cámara solo cuando el usuario lo solicite
   const [cameraActive, setCameraActive] = useState(false);
   ```

3. **Pausar en segundo plano**
   ```typescript
   useEffect(() => {
     const subscription = AppState.addEventListener('change', (state) => {
       setIsActive(state === 'active');
     });
     return () => subscription.remove();
   }, []);
   ```

---

## 📱 Tamaños de App

| Configuración | iOS | Android |
|--------------|-----|---------|
| Sin AI | ~15MB | ~20MB |
| + MediaPipe | ~35MB | ~45MB |
| + TFLite | ~30MB | ~40MB |
| + YOLO | ~40MB | ~50MB |

---

## ✅ Checklist de Implementación

- [ ] Instalar `react-native-vision-camera`
- [ ] Instalar `vision-camera-plugin-mediapipe`
- [ ] Configurar permisos en app.config.js
- [ ] Ejecutar `expo prebuild`
- [ ] Crear componente AICamera
- [ ] Implementar frame processor
- [ ] Integrar con AudioService
- [ ] Agregar feedback háptico
- [ ] Implementar Text-to-Speech
- [ ] Crear AIVisionService
- [ ] Definir reglas de detección
- [ ] Testear en dispositivo real
- [ ] Optimizar performance
- [ ] Agregar configuraciones de usuario
- [ ] Probar en diferentes condiciones de luz
- [ ] Validar consumo de batería

---

## 🐛 Troubleshooting

### Problema: "Frame processor error"
**Solución:** Asegúrate de usar `'worklet'` al inicio del frame processor.

### Problema: "Latencia alta"
**Solución:** Reduce FPS, procesa menos frames, usa modelo más ligero.

### Problema: "App crashes"
**Solución:** Verifica memoria disponible, reduce resolución de cámara.

### Problema: "Detecciones imprecisas"
**Solución:** Aumenta `scoreThreshold`, prueba otro modelo, mejora iluminación.

---

## 📚 Recursos

- [Vision Camera Docs](https://react-native-vision-camera.com/)
- [MediaPipe Tasks](https://developers.google.com/mediapipe/solutions/vision/object_detector)
- [TFLite Models](https://www.tensorflow.org/lite/models)
- [YOLO Ultralytics](https://github.com/ultralytics/ultralytics)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)

---

**Última actualización**: Noviembre 2025
**Proyecto**: Smart Cane Mobile
**Recomendación**: MediaPipe + Vision Camera ⭐

