import { useEffect, useState } from "react";
import { AudioManager } from "@/services/AudioManager";

export interface VoiceCommand {
  command: string;
  variations: string[];
  action: () => void;
  description: string;
}

/**
 * Hook for voice command recognition
 * Integrates with device's speech recognition
 */
export function useVoiceCommands(commands: VoiceCommand[]) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string>("");

  /**
   * Start listening for voice commands
   * TODO: Implement with Web Speech API or native module
   */
  const startListening = (): void => {
    setIsListening(true);
    AudioManager.announce(
      "Función de voz en desarrollo. Use los botones por ahora.",
      "medium",
      "info"
    );
    // Will be implemented with:
    // - Web Speech API (works in Android WebView)
    // - Native Speech Recognition module
    // - Google Cloud Speech-to-Text
  };

  /**
   * Stop listening
   */
  const stopListening = (): void => {
    setIsListening(false);
  };

  /**
   * Process recognized speech
   */
  const processCommand = (recognizedText: string): void => {
    const normalized = recognizedText.toLowerCase().trim();
    setLastCommand(normalized);

    // Find matching command
    const matchedCommand = commands.find(
      (cmd) =>
        cmd.command.toLowerCase() === normalized ||
        cmd.variations.some((v) => v.toLowerCase() === normalized)
    );

    if (matchedCommand) {
      AudioManager.announce(
        `Ejecutando: ${matchedCommand.description}`,
        "medium",
        "success"
      );
      matchedCommand.action();
    } else {
      AudioManager.announce(
        "Comando no reconocido. Di 'ayuda' para lista de comandos",
        "medium",
        "warning"
      );
    }
  };

  /**
   * Announce available commands
   */
  const announceAvailableCommands = (): void => {
    const commandList = commands
      .map((cmd) => `${cmd.command}: ${cmd.description}`)
      .join(". ");
    AudioManager.announce(`Comandos disponibles: ${commandList}`, "medium");
  };

  return {
    isListening,
    lastCommand,
    startListening,
    stopListening,
    processCommand,
    announceAvailableCommands,
  };
}

/**
 * Default voice commands for SmartCane app
 */
export const createDefaultVoiceCommands = (handlers: {
  onWhereAmI?: () => void;
  onWhatsAhead?: () => void;
  onRepeat?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEmergency?: () => void;
  onFasterSpeech?: () => void;
  onSlowerSpeech?: () => void;
  onSilentMode?: () => void;
  onNormalMode?: () => void;
}): VoiceCommand[] => {
  return [
    {
      command: "dónde estoy",
      variations: ["ubicación", "donde estoy", "mi ubicación"],
      action: () => handlers.onWhereAmI?.(),
      description: "Proporciona tu ubicación actual",
    },
    {
      command: "qué hay adelante",
      variations: ["que hay adelante", "adelante", "frente"],
      action: () => handlers.onWhatsAhead?.(),
      description: "Describe obstáculos adelante",
    },
    {
      command: "repetir",
      variations: ["repite", "otra vez", "de nuevo"],
      action: () => handlers.onRepeat?.(),
      description: "Repite el último mensaje",
    },
    {
      command: "pausar",
      variations: ["pausa", "detener", "para"],
      action: () => handlers.onPause?.(),
      description: "Pausa la detección de objetos",
    },
    {
      command: "continuar",
      variations: ["reanudar", "seguir", "continua"],
      action: () => handlers.onResume?.(),
      description: "Reanuda la detección",
    },
    {
      command: "emergencia",
      variations: ["ayuda", "socorro", "auxilio"],
      action: () => handlers.onEmergency?.(),
      description: "Activa alerta de emergencia",
    },
    {
      command: "más rápido",
      variations: ["mas rapido", "rápido", "acelerar"],
      action: () => handlers.onFasterSpeech?.(),
      description: "Aumenta velocidad de voz",
    },
    {
      command: "más lento",
      variations: ["mas lento", "lento", "despacio"],
      action: () => handlers.onSlowerSpeech?.(),
      description: "Disminuye velocidad de voz",
    },
    {
      command: "modo silencioso",
      variations: ["silencio", "silenciar", "modo silencio"],
      action: () => handlers.onSilentMode?.(),
      description: "Solo alertas críticas",
    },
    {
      command: "modo normal",
      variations: ["normal", "todo", "activar todo"],
      action: () => handlers.onNormalMode?.(),
      description: "Activa todas las alertas",
    },
  ];
};
