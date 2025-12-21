import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

export type Priority = "critical" | "high" | "medium" | "low";
export type HapticType = "success" | "warning" | "error" | "info";

export interface AudioMessage {
  id: string;
  text: string;
  priority: Priority;
  interruptible: boolean;
  haptic?: HapticType;
}

/**
 * Audio Manager for SmartCane App
 * Manages audio announcements with priority queue and haptic feedback
 * Optimized for blind users
 */
class AudioManagerService {
  private criticalQueue: AudioMessage[] = [];
  private normalQueue: AudioMessage[] = [];
  private isPlaying: boolean = false;
  private currentMessage: AudioMessage | null = null;
  private speechRate: number = 0.8;
  private enabled: boolean = true;

  /**
   * Announce a message with priority handling
   */
  async announce(
    text: string,
    priority: Priority = "medium",
    haptic?: HapticType,
    interruptible: boolean = true
  ): Promise<void> {
    if (!this.enabled) return;

    const message: AudioMessage = {
      id: Date.now().toString(),
      text,
      priority,
      interruptible,
      haptic,
    };

    // Play haptic feedback immediately
    if (haptic) {
      this.playHaptic(haptic);
    }

    // Handle based on priority
    if (priority === "critical") {
      await this.handleCritical(message);
    } else if (priority === "high") {
      this.criticalQueue.push(message);
      this.processQueue();
    } else {
      this.normalQueue.push(message);
      this.processQueue();
    }
  }

  /**
   * Handle critical messages - interrupt everything
   */
  private async handleCritical(message: AudioMessage): Promise<void> {
    // Stop current speech if interruptible
    if (this.isPlaying && this.currentMessage?.interruptible) {
      await Speech.stop();
    }

    // Clear non-critical queues
    this.normalQueue = [];

    // Play immediately
    await this.playMessage(message);
  }

  /**
   * Process message queue
   */
  private async processQueue(): Promise<void> {
    if (this.isPlaying) return;

    const nextMessage = this.getNextMessage();
    if (nextMessage) {
      await this.playMessage(nextMessage);
      // Process next message after a brief pause
      setTimeout(() => this.processQueue(), 300);
    }
  }

  /**
   * Get next message from queue based on priority
   */
  private getNextMessage(): AudioMessage | null {
    if (this.criticalQueue.length > 0) {
      return this.criticalQueue.shift()!;
    }
    if (this.normalQueue.length > 0) {
      return this.normalQueue.shift()!;
    }
    return null;
  }

  /**
   * Play a message using TTS
   */
  private async playMessage(message: AudioMessage): Promise<void> {
    this.isPlaying = true;
    this.currentMessage = message;

    try {
      await Speech.speak(message.text, {
        language: "es-ES",
        pitch: 1.0,
        rate: this.speechRate,
        onDone: () => {
          this.isPlaying = false;
          this.currentMessage = null;
        },
        onStopped: () => {
          this.isPlaying = false;
          this.currentMessage = null;
        },
        onError: () => {
          this.isPlaying = false;
          this.currentMessage = null;
        },
      });
    } catch (error) {
      this.isPlaying = false;
      this.currentMessage = null;
    }
  }

  /**
   * Play haptic feedback
   */
  private playHaptic(type: HapticType): void {
    switch (type) {
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "info":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
    }
  }

  /**
   * Stop all speech
   */
  async stop(): Promise<void> {
    await Speech.stop();
    this.isPlaying = false;
    this.currentMessage = null;
    this.criticalQueue = [];
    this.normalQueue = [];
  }

  /**
   * Repeat last message
   */
  async repeatLast(): Promise<void> {
    if (this.currentMessage) {
      await this.playMessage(this.currentMessage);
    }
  }

  /**
   * Set speech rate
   */
  setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate)); // Clamp between 0.5 and 2.0
  }

  /**
   * Increase speech rate
   */
  increaseSpeechRate(): void {
    this.setSpeechRate(this.speechRate + 0.1);
    this.announce(
      `Velocidad aumentada a ${Math.round(this.speechRate * 100)}%`,
      "low"
    );
  }

  /**
   * Decrease speech rate
   */
  decreaseSpeechRate(): void {
    this.setSpeechRate(this.speechRate - 0.1);
    this.announce(
      `Velocidad reducida a ${Math.round(this.speechRate * 100)}%`,
      "low"
    );
  }

  /**
   * Enable/disable audio manager
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      void this.stop();
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    isPlaying: boolean;
    queueLength: number;
    speechRate: number;
    enabled: boolean;
  } {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.criticalQueue.length + this.normalQueue.length,
      speechRate: this.speechRate,
      enabled: this.enabled,
    };
  }
}

// Singleton instance
export const AudioManager = new AudioManagerService();
