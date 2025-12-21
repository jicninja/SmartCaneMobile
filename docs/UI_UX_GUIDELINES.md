# 🎨 UI/UX Guidelines para SmartCane App

## 📱 Aplicación para Personas No Videntes

Esta guía establece los principios de diseño para la aplicación SmartCane, optimizada para usuarios con discapacidad visual.

---

## 🎯 Principios Fundamentales

### 1. **AUDIO-FIRST DESIGN**
La interfaz visual es **secundaria**. El audio es la interfaz principal.

**Implementación:**
- ✅ Todo elemento interactivo debe anunciarse automáticamente
- ✅ Usar Text-to-Speech (TTS) para toda la retroalimentación
- ✅ Sistema de cola de audio con prioridades
- ✅ Velocidad de voz ajustable (0.5x a 2.0x)

### 2. **HAPTIC FEEDBACK OBLIGATORIO**
Cada acción debe tener retroalimentación táctil.

**Patrones recomendados:**
```typescript
Obstáculo cercano: [50, 100, 50, 100, 50] // Rápido y urgente
Persona detectada: [200, 100, 200]         // 2 vibraciones largas
Vehículo: [100, 50, 100, 50, 100, 50]     // Patrón rápido repetido
Conexión perdida: [500, 200, 500]          // Muy largo y distintivo
Éxito: [100]                                // Una sola vibración
```

### 3. **MÁXIMO CONTRASTE**
Solo usar tema claro con contraste máximo.

**Colores recomendados:**
- Fondo: `#FFFFFF` (blanco puro)
- Texto principal: `#000000` (negro puro)
- Éxito: `#4CAF50` sobre `#E8F5E9`
- Error: `#D32F2F` sobre `#FFEBEE`
- Advertencia: `#F57C00` sobre `#FFF3E0`
- Info: `#1976D2` sobre `#E3F2FD`

### 4. **TAMAÑOS MÍNIMOS**
Para usuarios con visión parcial.

**Especificaciones:**
- Botones: **mínimo 80dp de altura**
- Texto normal: **mínimo 20sp**
- Texto importante: **mínimo 28sp**
- Títulos: **mínimo 32sp**
- Íconos: **mínimo 48dp**
- Áreas táctiles: **mínimo 60x60dp**

---

## 🔊 Sistema de Audio

### Jerarquía de Prioridades

#### CRÍTICO (Interrumpe todo)
- ⚠️ Obstáculos < 2 metros
- 🚗 Vehículos en movimiento
- ❌ Errores de conexión
- 🔋 Batería crítica (<10%)

**Características:**
- Detiene cualquier anuncio actual
- Retroalimentación háptica de error
- Se repite si no hay acción del usuario

#### ALTO (Cola prioritaria)
- 👤 Personas cercanas (1-3m)
- 🚦 Intersecciones/cruces
- 📍 Cambios de dirección GPS
- ⚡ Cambios de estado importantes

**Características:**
- Prioridad sobre mensajes normales
- Haptic de warning
- Se encola al frente

#### MEDIO (Cola normal)
- 🐕 Animales detectados
- 🏢 Descripción de entorno
- ✅ Confirmaciones de acciones
- 📊 Información de estado

#### BAJO (Se omite si hay cola)
- 🔋 Estado de batería normal
- 📡 Información de sensores
- ℹ️ Tips y sugerencias

### Ejemplo de Uso

```typescript
// CRÍTICO: Obstáculo inmediato
AudioManager.announce(
  "Alerta: Obstáculo a 50 centímetros",
  "critical",
  "error"
);

// ALTO: Persona detectada
AudioManager.announce(
  "Persona caminando a tu derecha, 2 metros",
  "high",
  "warning"
);

// MEDIO: Descripción de entorno
AudioManager.announce(
  "Estás en una acera, tienda a tu izquierda",
  "medium",
  "info"
);
```

---

## 📳 Patrones de Vibración

### Diseño de Patrones

Cada tipo de evento debe tener un patrón único y memorable:

```typescript
export const SmartCaneHapticPatterns = {
  // OBSTÁCULOS
  obstacle_immediate: [50, 50, 50, 50, 50, 50],     // Muy urgente
  obstacle_near: [100, 100, 100, 100],              // Urgente
  obstacle_medium: [200, 150, 200],                 // Moderado
  
  // DETECCIONES
  person: [150, 100, 150],                          // 2 pulsos
  vehicle: [100, 50, 100, 50, 100],                 // Rápido y continuo
  animal: [200, 100, 100, 100, 200],                // Patrón irregular
  intersection: [300, 200, 300, 200, 300],          // 3 pulsos largos
  
  // ESTADOS
  connected: [100, 100, 100],                       // 3 cortos
  disconnected: [500, 200, 500],                    // 2 muy largos
  battery_low: [200, 100, 200, 100, 200, 500],      // Patrón descendente
  
  // ACCIONES
  action_success: [100],                            // 1 corto
  action_error: [50, 50, 50, 50, 50],              // Múltiples cortos
  emergency_activated: [200, 100, 200, 100, 200, 100], // Continuo
};
```

---

## 🎤 Comandos de Voz

### Comandos Esenciales

#### Navegación
- **"¿Dónde estoy?"** → Ubicación GPS + descripción de entorno
- **"¿Qué hay adelante?"** → Objetos en dirección de marcha
- **"Describe alrededor"** → Descripción 360° del entorno
- **"Repetir"** → Repite último mensaje

#### Control
- **"Pausar"** → Pausa detección de objetos
- **"Continuar"** → Reanuda detección
- **"Emergencia"** → Activa alerta de emergencia
- **"Llamar [contacto]"** → Llamada de emergencia

#### Configuración
- **"Más rápido"** → ↑ Velocidad de voz
- **"Más lento"** → ↓ Velocidad de voz
- **"Modo silencioso"** → Solo alertas críticas
- **"Modo normal"** → Todas las alertas
- **"Ayuda"** → Lista comandos disponibles

### Implementación de Voice Recognition

```typescript
// Usar react-native-voice o expo-speech-recognition
import Voice from '@react-native-voice/voice';

Voice.onSpeechResults = (e) => {
  const recognizedText = e.value[0];
  processVoiceCommand(recognizedText);
};

// Activación por palabra clave
const WAKE_WORD = "bastón"; // "Bastón, ¿dónde estoy?"
```

---

## 📱 Estructura de Pantallas

### Pantalla Principal (Home)

```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │    ● CONECTADO            │  │  ← Estado (grande)
│  │    (verde, 120dp alto)    │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │        150                │  │  ← Distancia (enorme)
│  │     CENTÍMETROS           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                  │
│  [ 🔊 REPETIR ]                  │  ← Repetir último
│                                  │
│  ┌───────────────────────────┐  │
│  │    🚨 EMERGENCIA          │  │  ← Botón grande
│  │    (rojo, 150dp alto)     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Pantalla de Detección AI (Stream)

```
┌─────────────────────────────────┐
│  📹 [Vista de cámara opcional]  │  ← Pequeña o invisible
│                                  │
│  🚨 ALERTA ACTIVA               │  ← Alerta actual
│                                  │
│  👤 Persona - 2.5m - derecha    │
│  🚗 Vehículo - 8m - adelante    │  ← Objetos detectados
│  🐕 Animal - 4m - izquierda     │     (lista simple)
│                                  │
│  [ ⏸️ PAUSAR DETECCIÓN ]         │  ← Control
│                                  │
│  🔊 Última alerta:              │
│  "Persona cruzando frente a ti" │  ← Transcript
└─────────────────────────────────┘
```

### Pantalla de Configuración

```
┌─────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN               │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Velocidad de voz        │    │
│  │ [ - ] 100% [ + ]        │    │  ← Controles grandes
│  └─────────────────────────┘    │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Alertas                 │    │
│  │ [●] Personas            │    │
│  │ [●] Vehículos           │    │  ← Switches grandes
│  │ [○] Animales            │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 🤖 Integración de AI (Detección de Objetos)

### Sistema de Detección

```typescript
interface DetectedObject {
  type: 'person' | 'vehicle' | 'animal' | 'obstacle' | 'intersection';
  distance: number; // en metros
  direction: 'front' | 'left' | 'right' | 'behind';
  confidence: number; // 0-1
  movement: 'static' | 'approaching' | 'moving_away';
  priority: Priority;
}
```

### Priorización de Anuncios

```typescript
function shouldAnnounce(object: DetectedObject): boolean {
  // Siempre anunciar si es cercano y en movimiento
  if (object.distance < 2 && object.movement === 'approaching') {
    return true;
  }
  
  // Vehículos siempre si están cerca
  if (object.type === 'vehicle' && object.distance < 10) {
    return true;
  }
  
  // Personas si están muy cerca
  if (object.type === 'person' && object.distance < 3) {
    return true;
  }
  
  return false;
}
```

### Anuncios Inteligentes

No anunciar todo, solo lo relevante:

**✅ Anunciar:**
- Objetos en camino directo
- Objetos acercándose
- Cambios de estado (objeto que aparece/desaparece)
- Intersecciones y cruces

**❌ NO Anunciar:**
- Objetos estáticos lejanos (>5m)
- Objetos que se alejan
- Actualizaciones cada frame
- Información redundante

---

## 🗺️ Integración GPS

### Anuncios de Ubicación

```typescript
// Anunciar solo cuando sea útil
const locationAnnouncements = {
  // Automático
  approaching_intersection: "Intersección adelante en 10 metros",
  at_intersection: "Estás en una intersección. Calle [nombre]",
  changed_street: "Ahora estás en [calle]",
  
  // Por comando de voz
  where_am_i: "[dirección], cerca de [punto de referencia]",
  whats_around: "[descripción de negocios/lugares cercanos]",
};
```

---

## ⚠️ Modales de Error

### Errores Comunes

#### Pérdida de Conexión Bluetooth
```typescript
<AccessibleModal
  visible={!isConnected}
  type="error"
  title="CONEXIÓN PERDIDA"
  message="El bastón inteligente se ha desconectado. Verifique que esté encendido y cerca."
  primaryButton={{
    label: "RECONECTAR",
    onPress: () => reconnect()
  }}
  secondaryButton={{
    label: "CANCELAR",
    onPress: () => goBack()
  }}
/>
```

#### Batería Baja
```typescript
<AccessibleModal
  visible={batteryLevel < 20}
  type="warning"
  title="BATERÍA BAJA"
  message={`Batería del bastón al ${batteryLevel}%. Cargue pronto el dispositivo.`}
  primaryButton={{
    label: "ENTENDIDO",
    onPress: () => dismiss()
  }}
/>
```

#### Error de GPS
```typescript
<AccessibleModal
  visible={!hasGPS}
  type="error"
  title="GPS NO DISPONIBLE"
  message="Activela ubicación para usar funciones de navegación."
  primaryButton={{
    label: "ACTIVAR GPS",
    onPress: () => openSettings()
  }}
/>
```

---

## 🎯 Métricas de Usabilidad

### KPIs para Accesibilidad

1. **Tiempo de respuesta de audio:** < 500ms
2. **Tasa de reconocimiento de voz:** > 95%
3. **Latencia de detección de objetos:** < 200ms
4. **Claridad de anuncios:** Test con usuarios
5. **Fatiga auditiva:** Máximo 100 anuncios/minuto

### Testing con Usuarios

**Obligatorio:**
- ✅ Test con usuarios ciegos reales
- ✅ Test con diferentes acentos (español)
- ✅ Test en ambientes ruidosos
- ✅ Test de larga duración (>30 min)

---

## 📚 Referencias y Recursos

### Estándares de Accesibilidad
- **WCAG 2.1** (Web Content Accessibility Guidelines)
- **Android Accessibility** - Material Design
- **iOS Accessibility** - Human Interface Guidelines

### Bibliotecas Recomendadas
```json
{
  "expo-speech": "~13.0.0",           // Text-to-speech
  "expo-haptics": "~15.0.0",          // Vibración
  "@react-native-voice/voice": "^3.2.4", // Voice recognition
  "react-native-tts": "^4.1.0",       // Alternative TTS
  "@tensorflow/tfjs": "^4.11.0",      // AI/ML
  "react-native-geolocation": "^3.0.0" // GPS
}
```

### Mejores Prácticas
1. **Siempre testear con el dispositivo real**, no simulador
2. **Incluir usuarios ciegos en el proceso de diseño**
3. **Iterar basándose en feedback real**
4. **Mantener la UI simple y predecible**
5. **Priorizar rendimiento sobre estética**

---

## 🚀 Próximos Pasos

### Implementación Inmediata
- [ ] Integrar AudioManager en toda la app
- [ ] Implementar AccessibleModal para todos los errores
- [ ] Agregar comandos de voz básicos
- [ ] Configurar patrones hápticos

### Fase 2
- [ ] Integración con cámaras del bastón
- [ ] Sistema de detección AI con TensorFlow
- [ ] Integración GPS con puntos de interés
- [ ] Sistema de emergencia con contactos

### Fase 3
- [ ] Machine Learning para personalización
- [ ] Historial de rutas y lugares
- [ ] Modo indoor con beacons
- [ ] Integración con otros servicios (Uber, etc.)

---

**Última actualización:** 2025
**Autor:** AI Assistant
**Versión:** 1.0

