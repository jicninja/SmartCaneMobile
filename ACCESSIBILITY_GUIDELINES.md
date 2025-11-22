# Guía de Desarrollo: Aplicación Móvil para Personas con Baja Visibilidad

## 📱 Smart Cane Mobile - Guía de Accesibilidad

---

## 1. Principios Fundamentales de Accesibilidad

### 1.1 Diseño Inclusivo
- **Diseña para todos**: La accesibilidad debe ser parte del diseño desde el inicio, no una característica añadida posteriormente
- **Testea con usuarios reales**: Involucra a personas con discapacidad visual en el proceso de desarrollo
- **Considera diferentes niveles de visión**: Baja visión, ceguera parcial, ceguera total, sensibilidad al contraste
- **Múltiples canales de feedback**: Audio, háptico (vibración), y visual trabajando en conjunto

### 1.2 Modalidades de Interacción
- **Audio**: Lectores de pantalla, sonidos de confirmación, mensajes de voz
- **Háptico**: Patrones de vibración diferenciados, intensidades variables
- **Visual**: Alto contraste, textos grandes, iconografía clara (para usuarios con baja visión parcial)
- **Gestual**: Gestos simples y consistentes, áreas de toque grandes

---

## 2. Lectores de Pantalla (Screen Readers)

### 2.1 Compatibilidad Esencial
- **iOS**: VoiceOver (nativo)
- **Android**: TalkBack (nativo)
- **Configuración**: Ambos deben funcionar al 100% en tu app

### 2.2 Implementación en React Native

#### Accesibilidad en Componentes
```typescript
<View 
  accessible={true}
  accessibilityLabel="Botón de conexión al bastón inteligente"
  accessibilityHint="Toca dos veces para iniciar la conexión Bluetooth"
  accessibilityRole="button"
>
  <Text>Conectar</Text>
</View>
```

#### Propiedades Importantes
- `accessible`: Define si el elemento es accesible
- `accessibilityLabel`: Descripción del elemento (qué es)
- `accessibilityHint`: Información adicional (qué hace)
- `accessibilityRole`: Tipo de elemento (button, header, text, etc.)
- `accessibilityState`: Estado actual (disabled, selected, checked)
- `accessibilityValue`: Valores actuales (para sliders, progress bars)

#### Estados Dinámicos
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Estado de conexión"
  accessibilityValue={{ text: isConnected ? "Conectado" : "Desconectado" }}
  accessibilityState={{ disabled: isConnecting }}
>
  <Text>{isConnected ? "Conectado" : "Desconectado"}</Text>
</TouchableOpacity>
```

### 2.3 Orden de Lectura
- **Jerarquía lógica**: Los elementos deben leerse en orden lógico (de arriba a abajo, izquierda a derecha)
- **Agrupación**: Usa `accessibilityElementsHidden` para ocultar decoraciones
- **Cabeceras**: Marca encabezados con `accessibilityRole="header"`

### 2.4 Textos Descriptivos
- **Sé específico**: "Botón conectar bastón" vs "Botón"
- **Evita redundancias**: No digas "botón" si ya usas `accessibilityRole="button"`
- **Traduce estados**: "Conectando..." en lugar de solo mostrar un spinner
- **Contexto**: "Batería del bastón: 75%" en lugar de solo "75%"

---

## 3. Feedback Háptico (Vibraciones)

### 3.1 Patrones de Vibración Diferenciados

#### Tipos de Eventos
- **Conexión exitosa**: Vibración larga (500ms)
- **Desconexión**: Dos vibraciones cortas (100ms, pausa 100ms, 100ms)
- **Alerta/Peligro**: Tres vibraciones rápidas (50ms cada una)
- **Notificación**: Vibración media (200ms)
- **Error**: Patrón irregular (100ms, 50ms, 150ms)
- **Confirmación**: Vibración muy corta (50ms)

#### Implementación en React Native
```typescript
import { Vibration } from 'react-native';

const VibrationPatterns = {
  success: [0, 500],
  disconnect: [0, 100, 100, 100],
  danger: [0, 50, 50, 50, 50, 50],
  notification: [0, 200],
  error: [0, 100, 50, 50, 150],
  confirmation: [0, 50],
};

// Uso
Vibration.vibrate(VibrationPatterns.success);
```

### 3.2 Consideraciones Importantes
- **Patrones únicos**: Cada tipo de alerta debe tener un patrón distintivo
- **Documentación**: Provee una guía de patrones de vibración en la app
- **Personalización**: Permite al usuario ajustar intensidad o desactivar
- **No abuses**: Demasiadas vibraciones pueden ser molestas o confusas
- **Combina con audio**: El feedback háptico debe complementar, no reemplazar el audio

### 3.3 Biblioteca Expo Haptics
```typescript
import * as Haptics from 'expo-haptics';

// Diferentes intensidades
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Notificaciones
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 4. Diseño Visual para Baja Visión

### 4.1 Contraste y Colores

#### Ratios de Contraste WCAG
- **Nivel AA**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Nivel AAA**: Mínimo 7:1 para texto normal, 4.5:1 para texto grande
- **Recomendado para tu app**: Nivel AAA

#### Combinaciones Recomendadas
- **Texto sobre fondo**: Negro sobre blanco (#000000 / #FFFFFF)
- **Botones primarios**: Blanco sobre azul oscuro (#FFFFFF / #003D82)
- **Alertas**: Negro sobre amarillo (#000000 / #FFD700)
- **Errores**: Blanco sobre rojo (#FFFFFF / #D32F2F)
- **Éxito**: Negro sobre verde (#000000 / #4CAF50)

#### No Dependas Solo del Color
- **Usa iconos**: Además de color rojo para error, usa un ícono de X
- **Usa patrones**: Diferentes texturas o patrones además de colores
- **Usa textos**: "Error", "Éxito", "Alerta" escritos claramente

### 4.2 Tamaños y Espaciado

#### Tamaños de Fuente
- **Mínimo**: 16px (14px absoluto mínimo)
- **Recomendado**: 18-20px para texto principal
- **Títulos**: 24-32px
- **Importante**: 28-36px

#### Tamaños de Botones
- **Área táctil mínima**: 44x44 puntos (iOS), 48x48dp (Android)
- **Recomendado**: 56x56 o más grande
- **Espaciado entre botones**: Mínimo 8px

#### Espaciado
- **Line height**: 1.5x el tamaño de fuente
- **Padding**: Generoso, mínimo 16px
- **Margin entre secciones**: 24-32px

### 4.3 Tipografía
- **Fuentes sans-serif**: Arial, Helvetica, Roboto, San Francisco
- **Evita fuentes decorativas**: Pueden ser difíciles de leer
- **Peso**: Medium o Bold para mejor legibilidad
- **Evita cursivas**: Son más difíciles de leer con baja visión

### 4.4 Modo Oscuro
- **Implementa modo oscuro**: Algunos usuarios prefieren texto claro sobre fondo oscuro
- **Mantén el contraste**: El modo oscuro debe tener el mismo nivel de contraste
- **Respeta preferencias del sistema**: Usa `useColorScheme()` en React Native

---

## 5. Navegación y Estructura

### 5.1 Simplicidad y Claridad
- **Mantén la navegación simple**: Máximo 5 secciones principales
- **Jerarquía clara**: Usuario siempre debe saber dónde está
- **Breadcrumbs sonoros**: Anuncia la ubicación actual al cambiar de pantalla
- **Botón de inicio accesible**: Siempre disponible, fácil de encontrar

### 5.2 Gestos Accesibles

#### Gestos Recomendados
- **Toque simple**: Acción principal
- **Toque largo**: Información adicional o menú contextual
- **Deslizar**: Navegación entre secciones (mantén consistencia)
- **Pellizcar**: Zoom (para usuarios con baja visión parcial)

#### Evita
- **Gestos complejos**: Como dibujar formas
- **Gestos precisos**: Como arrastrar objetos pequeños
- **Gestos múltiples**: Que requieran varios dedos simultáneamente

### 5.3 Focus y Navegación por Teclado
- **Orden lógico de foco**: Debe seguir el orden visual
- **Indicadores de foco visibles**: Borde o highlight claro
- **Skip links**: Permite saltar bloques de contenido repetitivo

---

## 6. Audio y Comunicación Sonora

### 6.1 Tipos de Audio

#### Mensajes de Voz
- **Confirmaciones**: "Bastón conectado exitosamente"
- **Instrucciones**: "Toca el botón conectar para iniciar"
- **Alertas**: "Batería baja del bastón"
- **Estados**: "Buscando dispositivo..."

#### Sonidos (Earcons)
- **Confirmación**: Sonido de campana o "ding"
- **Error**: Sonido de error del sistema
- **Notificación**: Sonido distintivo pero no invasivo
- **Alerta urgente**: Sonido más fuerte y repetitivo

### 6.2 Implementación con React Native Sound
```typescript
import Sound from 'react-native-sound';

// Configurar la categoría de audio
Sound.setCategory('Playback');

// Crear un mapa de sonidos precargados
const sounds: Record<string, Sound> = {};

// Precargar sonidos al inicio
export const preloadSounds = () => {
  sounds.success = new Sound('success.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) console.error('Error loading success sound', error);
  });
  
  sounds.error = new Sound('error.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) console.error('Error loading error sound', error);
  });
  
  sounds.notification = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) console.error('Error loading notification sound', error);
  });
  
  sounds.alert = new Sound('alert.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) console.error('Error loading alert sound', error);
  });
};

// Función para reproducir sonido
export const playSound = (soundName: string) => {
  const sound = sounds[soundName];
  if (sound) {
    sound.play((success) => {
      if (!success) {
        console.error('Sound playback failed');
      }
    });
  }
};

// Liberar memoria cuando no se necesiten más
export const releaseSounds = () => {
  Object.values(sounds).forEach(sound => sound.release());
};
```

### Alternativa: React Native Track Player (para audio largo o en segundo plano)
Si necesitas reproducir audio más largo o en segundo plano:

```typescript
import TrackPlayer from 'react-native-track-player';

// Setup
await TrackPlayer.setupPlayer();

// Agregar y reproducir
await TrackPlayer.add({
  id: 'guidance',
  url: require('./assets/sounds/guidance.mp3'),
  title: 'Guía de navegación',
});

await TrackPlayer.play();
```

### 6.3 Buenas Prácticas de Audio
- **Control de volumen**: Respeta el volumen del sistema
- **Opción de silencio**: Permite desactivar sonidos (mantén vibración)
- **Claridad**: Voces claras, sin reverb o efectos
- **Idioma**: Respeta el idioma del sistema
- **Velocidad**: Permite ajustar velocidad de lectura

---

## 7. Conexión Bluetooth y Bastón Inteligente

### 7.1 Estados de Conexión Claros

#### Estados a Comunicar
1. **Bluetooth desactivado**: "Bluetooth desactivado. Por favor actívalo."
2. **Buscando**: "Buscando bastón inteligente..."
3. **Dispositivo encontrado**: "Bastón encontrado: SmartCane-001"
4. **Conectando**: "Conectando al bastón..."
5. **Conectado**: "Bastón conectado exitosamente" + vibración larga
6. **Desconectado**: "Bastón desconectado" + dos vibraciones cortas
7. **Error**: "Error de conexión. Intenta nuevamente" + vibración de error

### 7.2 Retroalimentación Continua
- **Indicador de conexión siempre visible**: Con accessibilityLabel
- **Notificaciones de cambio**: Anuncia cuando cambia el estado
- **Auto-reconexión**: Notifica cuando intenta reconectar
- **Batería**: Estado de batería del bastón anunciado periódicamente

### 7.3 Manejo de Errores
- **Mensajes claros**: "No se pudo conectar" en lugar de "Error BLE-0x12"
- **Sugerencias de solución**: "Asegúrate de que el bastón esté encendido"
- **Reintentar fácil**: Botón grande y accesible para reintentar
- **Modo offline**: Si es posible, algunas funciones sin conexión

---

## 8. Configuración y Personalización

### 8.1 Opciones de Accesibilidad

#### Configuraciones Esenciales
- **Tamaño de texto**: Pequeño, Normal, Grande, Extra Grande
- **Modo de color**: Claro, Oscuro, Alto Contraste
- **Velocidad de lectura**: Lento, Normal, Rápido
- **Patrones de vibración**: Intensidad (Suave, Normal, Fuerte)
- **Audio**: Volumen, activar/desactivar mensajes de voz
- **Idioma**: Español, Inglés, otros

### 8.2 Tutoriales y Ayuda
- **Tutorial inicial**: Guía paso a paso al primer uso
- **Ayuda contextual**: Botón de ayuda en cada pantalla
- **Guía de vibraciones**: Documento que explica cada patrón
- **Modo práctica**: Permite probar vibraciones y sonidos

---

## 9. Testing y Validación

### 9.1 Pruebas con Lectores de Pantalla

#### Checklist iOS (VoiceOver)
- [ ] Todos los elementos interactivos son accesibles
- [ ] Los labels son descriptivos y contextuales
- [ ] El orden de lectura es lógico
- [ ] Los estados cambian correctamente
- [ ] Los gestos de VoiceOver funcionan (rotor, etc.)
- [ ] Las alertas se anuncian apropiadamente

#### Checklist Android (TalkBack)
- [ ] Todos los elementos interactivos son accesibles
- [ ] Los labels son descriptivos y contextuales
- [ ] El orden de lectura es lógico
- [ ] Los estados cambian correctamente
- [ ] Los gestos de TalkBack funcionan
- [ ] Las notificaciones se anuncian correctamente

### 9.2 Pruebas de Contraste
- **Herramientas**: 
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- **Validación**: Todos los textos deben pasar nivel AA (preferiblemente AAA)

### 9.3 Pruebas con Usuarios Reales
- **Reclutamiento**: Contacta organizaciones de personas con discapacidad visual
- **Diversidad**: Incluye personas con diferentes niveles de visión
- **Observación**: Observa cómo usan la app sin intervenir
- **Feedback**: Recoge feedback específico sobre dificultades

---

## 10. Normativas y Estándares

### 10.1 WCAG (Web Content Accessibility Guidelines)
- **Nivel A**: Mínimo aceptable
- **Nivel AA**: Estándar recomendado (requerido legalmente en muchos lugares)
- **Nivel AAA**: Máximo nivel de accesibilidad

#### Principios POUR
1. **Perceptible**: La información debe ser presentable para los usuarios
2. **Operable**: Los componentes de interfaz deben ser operables
3. **Comprensible**: La información y operación deben ser comprensibles
4. **Robusto**: El contenido debe ser robusto para diferentes tecnologías asistivas

### 10.2 Legislación Relevante
- **ADA (Americans with Disabilities Act)**: Estados Unidos
- **Section 508**: Estándar federal de EE.UU.
- **EN 301 549**: Estándar europeo
- **Ley General de Derechos de las Personas con Discapacidad**: España/Latinoamérica

---

## 11. Arquitectura de Código Accesible

### 11.1 Componentes Reutilizables

#### AccessibleButton Component
```typescript
interface AccessibleButtonProps {
  label: string;
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
  vibrationPattern?: number[];
  soundFile?: string;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  label,
  hint,
  onPress,
  disabled = false,
  vibrationPattern = [0, 50],
  soundFile,
}) => {
  const handlePress = async () => {
    if (disabled) return;
    
    // Vibración
    Vibration.vibrate(vibrationPattern);
    
    // Sonido (opcional)
    if (soundFile) {
      await playSound(soundFile);
    }
    
    // Acción
    onPress();
  };

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={handlePress}
      disabled={disabled}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};
```

### 11.2 Hook de Accesibilidad
```typescript
import { AccessibilityInfo, useEffect, useState } from 'react-native';

export const useScreenReaderEnabled = () => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check inicial
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);

    // Listener para cambios
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );

    return () => subscription.remove();
  }, []);

  return screenReaderEnabled;
};

// Uso
const screenReaderEnabled = useScreenReaderEnabled();
```

### 11.3 Context de Accesibilidad
```typescript
interface AccessibilityContextType {
  fontSize: 'small' | 'normal' | 'large' | 'extraLarge';
  vibrationIntensity: 'soft' | 'normal' | 'strong';
  audioEnabled: boolean;
  screenReaderEnabled: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>(defaultSettings);

export const AccessibilityProvider: React.FC = ({ children }) => {
  // Gestión de configuraciones de accesibilidad
  // ...
  return (
    <AccessibilityContext.Provider value={settings}>
      {children}
    </AccessibilityContext.Provider>
  );
};
```

---

## 12. Checklist General de Accesibilidad

### ✅ Antes de Cada Release

#### Accesibilidad Básica
- [ ] Todos los elementos interactivos tienen `accessibilityLabel`
- [ ] Todos los botones tienen `accessibilityRole="button"`
- [ ] Los estados (cargando, error, éxito) se anuncian claramente
- [ ] El orden de lectura es lógico en todas las pantallas
- [ ] Las imágenes decorativas están ocultas para screen readers
- [ ] Las imágenes informativas tienen descripciones

#### Contraste y Visual
- [ ] Todos los textos pasan el test de contraste (WCAG AA mínimo)
- [ ] Los botones son mínimo 44x44 puntos
- [ ] El espaciado entre elementos es suficiente
- [ ] El texto es legible en diferentes tamaños
- [ ] El modo oscuro funciona correctamente

#### Feedback Háptico y Audio
- [ ] Cada acción importante tiene feedback háptico
- [ ] Los patrones de vibración son distintivos
- [ ] Los mensajes de audio son claros
- [ ] El volumen respeta las preferencias del sistema
- [ ] Se puede desactivar audio/vibración

#### Navegación
- [ ] La navegación es simple e intuitiva
- [ ] El usuario siempre sabe dónde está
- [ ] Hay forma fácil de volver atrás
- [ ] Los gestos son simples y consistentes

#### Bluetooth y Conectividad
- [ ] Los estados de conexión se anuncian claramente
- [ ] Los errores tienen mensajes comprensibles
- [ ] Hay feedback inmediato para cada acción
- [ ] La reconexión es automática cuando sea posible

#### Testing
- [ ] Probado con VoiceOver (iOS)
- [ ] Probado con TalkBack (Android)
- [ ] Probado con usuarios reales con discapacidad visual
- [ ] Probado en diferentes tamaños de pantalla
- [ ] Probado en diferentes versiones de OS

---

## 13. Recursos Adicionales

### 13.1 Documentación Oficial
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Apple Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Material Design - Accessibility](https://material.io/design/usability/accessibility.html)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 13.2 Herramientas
- **Accessibility Inspector** (iOS): Xcode incluido
- **Accessibility Scanner** (Android): [Google Play](https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor)
- **Axe DevTools**: Para testing automatizado
- **Color Oracle**: Simulador de daltonismo

### 13.3 Comunidades
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)

---

## 14. Consejos Específicos para Smart Cane

### 14.1 Prioridades para tu App

1. **Comunicación de Obstáculos**
   - Vibración inmediata cuando el bastón detecta obstáculo
   - Patrones diferentes según distancia (cerca vs lejos)
   - Audio describiendo tipo de obstáculo si es identificable
   - Intensidad de vibración proporcional a urgencia

2. **Información de Navegación**
   - Dirección indicada con patrones de vibración direccionales
   - Confirmación de ruta con audio
   - Alertas de desvío de ruta con vibración distintiva
   - Notificación de llegada a destino

3. **Monitoreo del Bastón**
   - Estado de batería anunciado cada hora o cuando baje de 20%
   - Alerta si el bastón se desconecta inesperadamente
   - Estado de sensores (funcionando correctamente)
   - Actualizaciones de firmware notificadas

4. **Emergencias**
   - Botón SOS grande y accesible
   - Vibración de emergencia distintiva y persistente
   - Mensaje de voz claro sobre situación de emergencia
   - Envío de ubicación a contactos de emergencia

### 14.2 Feedback Específico para Diferentes Escenarios

#### Obstáculo Detectado
```typescript
const obstaclePatterns = {
  far: [0, 100, 200, 100],        // Lejos: vibración suave
  medium: [0, 150, 150, 150],     // Medio: vibración moderada
  near: [0, 200, 100, 200, 100],  // Cerca: vibración fuerte repetida
  immediate: [0, 300, 50, 300],   // Inmediato: vibración muy fuerte
};
```

#### Direcciones
```typescript
// Patrones direccionales (si el dispositivo soporta vibración direccional)
const directionPatterns = {
  forward: [0, 100],              // Adelante: una vibración
  left: [0, 50, 100, 50],         // Izquierda: dos vibraciones cortas
  right: [0, 100, 50, 100],       // Derecha: dos vibraciones largas
  backward: [0, 50, 50, 50, 50],  // Atrás: muchas vibraciones cortas
};
```

### 14.3 Pantallas Esenciales

1. **Pantalla Principal**
   - Estado de conexión grande y claro
   - Botón de conectar/desconectar muy accesible
   - Estado de batería del bastón
   - Indicador de obstáculos activo

2. **Pantalla de Configuración**
   - Ajustes de sensibilidad de sensores
   - Personalización de patrones de vibración
   - Configuración de alertas de audio
   - Contactos de emergencia

3. **Pantalla de Navegación** (si aplica)
   - Destino actual
   - Distancia estimada
   - Tiempo estimado
   - Instrucciones de navegación paso a paso

4. **Pantalla de Historial**
   - Rutas recientes
   - Estadísticas de uso
   - Obstáculos detectados
   - Eventos importantes

---

## 15. Métricas de Éxito

### 15.1 Indicadores Cuantitativos
- **100%** de elementos interactivos accesibles con screen reader
- **Nivel AAA** de contraste en todos los textos
- **< 2 segundos** de respuesta para feedback de conexión
- **100%** de acciones importantes con feedback háptico
- **> 90%** de satisfacción de usuarios con discapacidad visual

### 15.2 Indicadores Cualitativos
- Usuarios pueden completar tareas sin ver la pantalla
- Feedback es claro y no confuso
- La app es usable en cualquier entorno (ruidoso, silencioso)
- Los usuarios se sienten seguros usando el bastón con la app

---

## 📌 Resumen: Reglas de Oro

1. **Múltiple feedback**: Siempre provee audio + háptico + visual
2. **Simplicidad**: Una acción principal por pantalla
3. **Claridad**: Mensajes directos, sin jerga técnica
4. **Consistencia**: Mismo patrón = mismo significado siempre
5. **Personalización**: Permite ajustar según preferencias
6. **Testing real**: Prueba con usuarios con discapacidad visual
7. **Contraste alto**: Mínimo WCAG AA, preferible AAA
8. **Botones grandes**: Mínimo 44x44 puntos
9. **Screen reader first**: Diseña pensando en VoiceOver/TalkBack
10. **Emergencias**: Botón SOS siempre accesible

---

**Última actualización**: Noviembre 2025
**Proyecto**: Smart Cane Mobile
**Contacto**: [Tu información de contacto]

