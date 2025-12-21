# Guía de Migración: De expo-av a react-native-sound

## 🎯 ¿Por qué migrar?

`expo-av` está siendo reemplazada por soluciones más modernas y específicas. Para sonidos cortos de feedback y notificaciones, `react-native-sound` es la mejor opción.

---

## 📦 Opciones de Bibliotecas

### 1. **react-native-sound** ⭐ RECOMENDADO para tu app

**Ideal para:**
- Sonidos cortos de feedback (< 10 segundos)
- Efectos de sonido (clicks, beeps, alertas)
- Notificaciones de audio
- Tu caso: vibraciones + sonidos de confirmación

**Ventajas:**
- Ligera y rápida
- Precarga sonidos para latencia mínima
- Perfecto para feedback háptico + audio
- Bajo consumo de memoria

**Instalación:**
```bash
npx expo install react-native-sound
npx expo prebuild
```

---

### 2. **react-native-track-player**

**Ideal para:**
- Reproducción de audio largo (música, podcasts)
- Audio en segundo plano
- Controles de reproducción en notificaciones
- Playlists

**NO recomendado** para tu app porque es demasiado complejo para sonidos cortos.

**Instalación:**
```bash
npx expo install react-native-track-player
npx expo prebuild
```

---

### 3. **expo-audio** (Nueva de Expo - En Beta)

**Estado:** En desarrollo activo para SDK 52+
- Reemplazo oficial de expo-av
- Aún en beta, esperar a versión estable
- Monitorear: https://docs.expo.dev/versions/latest/sdk/audio/

---

## 🔄 Migración Paso a Paso

### Paso 1: Instalar react-native-sound

```bash
# Instalar la biblioteca
npx expo install react-native-sound

# Instalar tipos TypeScript
yarn add -D @types/react-native-sound

# Prebuild (necesario porque es módulo nativo)
npx expo prebuild
```

### Paso 2: Configurar Android (android/app/src/main/AndroidManifest.xml)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- No requiere permisos especiales para reproducción -->
</manifest>
```

### Paso 3: Configurar iOS (Info.plist)

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string> <!-- Solo si necesitas audio en segundo plano -->
</array>
```

### Paso 4: Organizar tus Sonidos

```
assets/
  sounds/
    success.mp3
    error.mp3
    notification.mp3
    alert.mp3
    danger.mp3
    confirmation.mp3
    disconnect.mp3
    connect.mp3
```

**Formatos recomendados:**
- **iOS**: .mp3, .aac, .wav
- **Android**: .mp3, .ogg, .wav
- **Recomendado**: MP3 a 128kbps (buen balance calidad/tamaño)

### Paso 5: Crear un Servicio de Audio

Crea `services/AudioService.ts`:

```typescript
import Sound from 'react-native-sound';

// Configurar categoría de audio
Sound.setCategory('Playback', false);

export enum SoundType {
  SUCCESS = 'success',
  ERROR = 'error',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  DANGER = 'danger',
  CONFIRMATION = 'confirmation',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}

class AudioService {
  private sounds: Map<SoundType, Sound> = new Map();
  private enabled: boolean = true;

  /**
   * Inicializar y precargar todos los sonidos
   */
  async init(): Promise<void> {
    return new Promise((resolve) => {
      const soundFiles = {
        [SoundType.SUCCESS]: require('../assets/sounds/success.mp3'),
        [SoundType.ERROR]: require('../assets/sounds/error.mp3'),
        [SoundType.NOTIFICATION]: require('../assets/sounds/notification.mp3'),
        [SoundType.ALERT]: require('../assets/sounds/alert.mp3'),
        [SoundType.DANGER]: require('../assets/sounds/danger.mp3'),
        [SoundType.CONFIRMATION]: require('../assets/sounds/confirmation.mp3'),
        [SoundType.CONNECT]: require('../assets/sounds/connect.mp3'),
        [SoundType.DISCONNECT]: require('../assets/sounds/disconnect.mp3'),
      };

      let loadedCount = 0;
      const totalSounds = Object.keys(soundFiles).length;

      Object.entries(soundFiles).forEach(([type, file]) => {
        const sound = new Sound(file, (error) => {
          if (error) {
            console.error(`Error loading ${type} sound:`, error);
          }
          
          loadedCount++;
          this.sounds.set(type as SoundType, sound);

          if (loadedCount === totalSounds) {
            resolve();
          }
        });
      });
    });
  }

  /**
   * Reproducir un sonido
   */
  play(soundType: SoundType, volume: number = 1.0): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundType);
    if (sound) {
      sound.setVolume(volume);
      sound.play((success) => {
        if (!success) {
          console.error(`Failed to play ${soundType} sound`);
        }
      });
    }
  }

  /**
   * Habilitar/deshabilitar audio
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verificar si está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Liberar recursos de memoria
   */
  release(): void {
    this.sounds.forEach((sound) => {
      sound.release();
    });
    this.sounds.clear();
  }

  /**
   * Detener todos los sonidos
   */
  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }
}

// Exportar instancia única (Singleton)
export const audioService = new AudioService();
```

### Paso 6: Inicializar en App.tsx

```typescript
import { useEffect } from 'react';
import { audioService } from './services/AudioService';

export default function App() {
  useEffect(() => {
    // Inicializar servicio de audio
    audioService.init().then(() => {
      console.log('Audio service initialized');
    });

    // Limpiar al desmontar
    return () => {
      audioService.release();
    };
  }, []);

  return (
    // ... resto de tu app
  );
}
```

### Paso 7: Usar en Componentes

```typescript
import { audioService, SoundType } from '@/services/AudioService';
import { Vibration } from 'react-native';

// En tu componente Bluetooth
const handleConnect = async () => {
  try {
    await connectToDevice();
    
    // Feedback combinado: audio + vibración
    audioService.play(SoundType.CONNECT);
    Vibration.vibrate(500);
    
    console.log('Connected successfully');
  } catch (error) {
    // Feedback de error
    audioService.play(SoundType.ERROR);
    Vibration.vibrate([0, 100, 50, 100]);
  }
};
```

---

## 🎨 Comparación: expo-av vs react-native-sound

| Característica | expo-av | react-native-sound |
|---------------|---------|-------------------|
| Tamaño | ~200kb | ~50kb |
| Latencia | Media | Muy baja (precarga) |
| Sonidos cortos | ✅ | ✅✅ Optimizado |
| Audio largo | ✅✅ | ⚠️ No recomendado |
| Video | ✅ | ❌ |
| Managed Expo | ✅ | ❌ (requiere prebuild) |
| Bare Workflow | ✅ | ✅ |
| Mantenimiento | ⚠️ Limitado | ✅ Activo |

---

## 🔊 Crear Sonidos de Feedback

### Herramientas Recomendadas

1. **Audacity** (Gratis)
   - Editar y crear sonidos
   - Exportar a MP3/WAV
   - https://www.audacityteam.org/

2. **Freesound.org**
   - Biblioteca de sonidos gratuitos
   - Buscar: "beep", "notification", "alert"
   - https://freesound.org/

3. **SFXR / jsfxr**
   - Generador de efectos de sonido retro
   - Perfecto para beeps y confirmaciones
   - https://sfxr.me/

### Características de Buenos Sonidos de Feedback

- **Duración**: 100-500ms (muy cortos)
- **Volumen**: Consistente entre todos
- **Frecuencia**: 440-880 Hz para alertas
- **Sin reverb**: Respuesta inmediata
- **Distintivos**: Cada sonido debe ser único

---

## 🧪 Testing

### Test de Audio Service

```typescript
import { audioService, SoundType } from '@/services/AudioService';

describe('AudioService', () => {
  beforeAll(async () => {
    await audioService.init();
  });

  afterAll(() => {
    audioService.release();
  });

  it('should play success sound', () => {
    expect(() => {
      audioService.play(SoundType.SUCCESS);
    }).not.toThrow();
  });

  it('should respect enabled state', () => {
    audioService.setEnabled(false);
    expect(audioService.isEnabled()).toBe(false);
    
    audioService.setEnabled(true);
    expect(audioService.isEnabled()).toBe(true);
  });
});
```

---

## 🐛 Troubleshooting

### Problema: "Sound not found"

**Solución:**
```typescript
// Asegúrate de usar require() y no import
const sound = new Sound(require('./path/to/sound.mp3'), ...);

// NO uses:
const sound = new Sound('./path/to/sound.mp3', ...);
```

### Problema: "Sound not playing on Android"

**Solución:**
```bash
# Rebuild la app
npx expo prebuild --clean
npx expo run:android
```

### Problema: "Multiple sounds overlapping"

**Solución:**
```typescript
// Detener sonido anterior antes de reproducir uno nuevo
sound.stop(() => {
  sound.play();
});
```

### Problema: "Memory leak"

**Solución:**
```typescript
// Siempre liberar recursos
useEffect(() => {
  return () => {
    audioService.release();
  };
}, []);
```

---

## 📱 Ejemplo Completo: Botón Accesible con Audio

```typescript
import React from 'react';
import { TouchableOpacity, Text, Vibration } from 'react-native';
import { audioService, SoundType } from '@/services/AudioService';

interface AccessibleButtonWithAudioProps {
  label: string;
  onPress: () => void;
  soundType?: SoundType;
  vibrationPattern?: number[];
}

export const AccessibleButtonWithAudio: React.FC<AccessibleButtonWithAudioProps> = ({
  label,
  onPress,
  soundType = SoundType.CONFIRMATION,
  vibrationPattern = [0, 50],
}) => {
  const handlePress = () => {
    // 1. Audio feedback
    audioService.play(soundType);
    
    // 2. Haptic feedback
    Vibration.vibrate(vibrationPattern);
    
    // 3. Acción
    onPress();
  };

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={handlePress}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};
```

---

## ✅ Checklist de Migración

- [ ] Instalar `react-native-sound`
- [ ] Instalar `@types/react-native-sound`
- [ ] Ejecutar `expo prebuild`
- [ ] Crear carpeta `assets/sounds/`
- [ ] Agregar archivos de sonido MP3
- [ ] Crear `AudioService.ts`
- [ ] Inicializar servicio en App.tsx
- [ ] Reemplazar llamadas a `expo-av`
- [ ] Probar en iOS
- [ ] Probar en Android
- [ ] Verificar que no haya memory leaks
- [ ] Actualizar tests
- [ ] Remover `expo-av` de package.json

---

## 🔄 Matriz de Migración

| expo-av | react-native-sound |
|---------|-------------------|
| `Audio.Sound()` | `new Sound()` |
| `sound.loadAsync()` | Precargar en init |
| `sound.playAsync()` | `sound.play()` |
| `sound.stopAsync()` | `sound.stop()` |
| `sound.setVolumeAsync()` | `sound.setVolume()` |
| `sound.unloadAsync()` | `sound.release()` |

---

## 📚 Recursos

- [react-native-sound GitHub](https://github.com/zmxv/react-native-sound)
- [Documentación oficial](https://github.com/zmxv/react-native-sound/blob/master/README.md)
- [Freesound - Sonidos gratuitos](https://freesound.org/)
- [Audacity - Editor de audio](https://www.audacityteam.org/)

---

## 🚀 Próximos Pasos

1. **Implementar AudioService**: Copia el código del servicio
2. **Crear sonidos**: Descarga o crea tus sonidos de feedback
3. **Integrar en Bluetooth**: Agrega feedback de audio a las conexiones
4. **Testear**: Prueba todos los sonidos en ambas plataformas
5. **Optimizar**: Ajusta volúmenes y duraciones según feedback de usuarios

---

**Última actualización**: Noviembre 2025
**Proyecto**: Smart Cane Mobile

