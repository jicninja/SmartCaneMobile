import {
  createAudioPlayer,
  type AudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from "expo-audio";

/**
 * Sound types for different alert levels
 */
export enum SoundType {
  ALERT_CRITICAL = "alert_critical", // For distances <= 100cm
  ALERT_HIGH = "alert_high", // For distances <= 200cm
  ALERT_MEDIUM = "alert_medium", // For distances <= 300cm
  CONNECT = "connect",
  DISCONNECT = "disconnect",
}

/**
 * Sound Service using expo-audio
 * Manages audio playback for alerts and notifications
 */
class SoundService {
  private sounds: Map<SoundType, AudioPlayer> = new Map();
  private enabled: boolean = true;
  private isInitialized: boolean = false;
  private lastPlayTime: Map<SoundType, number> = new Map();
  private readonly MIN_PLAY_INTERVAL = 200; // Minimum milliseconds between plays

  /**
   * Wait for audio player to load using polling
   */
  private async waitForLoad(
    player: AudioPlayer,
    timeout: number = 5000
  ): Promise<boolean> {
    if (player.isLoaded) {
      return true;
    }

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (player.isLoaded) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  /**
   * Initialize and preload all sounds
   * Uses lazy initialization to avoid "keep awake" errors
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode first
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionModeAndroid: "duckOthers",
      });

      // Ensure audio is active
      await setIsAudioActiveAsync(true);

      // Wait a bit to ensure app is fully ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Load beep sound for alerts using expo-audio API
      const beepSource = require("../assets/sounds/beep.mp3");

      const criticalSound = createAudioPlayer(beepSource);
      const highSound = createAudioPlayer(beepSource);
      const mediumSound = createAudioPlayer(beepSource);

      // Wait for sounds to load using event listeners
      const [criticalLoaded, highLoaded, mediumLoaded] = await Promise.all([
        this.waitForLoad(criticalSound),
        this.waitForLoad(highSound),
        this.waitForLoad(mediumSound),
      ]);

      if (!criticalLoaded) {
        console.warn("Critical sound failed to load");
      }
      if (!highLoaded) {
        console.warn("High sound failed to load");
      }
      if (!mediumLoaded) {
        console.warn("Medium sound failed to load");
      }

      // Store sound instances even if not loaded yet (they might load later)
      this.sounds.set(SoundType.ALERT_CRITICAL, criticalSound);
      this.sounds.set(SoundType.ALERT_HIGH, highSound);
      this.sounds.set(SoundType.ALERT_MEDIUM, mediumSound);

      this.isInitialized = true;
      console.log("Sound service initialized successfully", {
        critical: criticalLoaded,
        high: highLoaded,
        medium: mediumLoaded,
      });
    } catch (error) {
      console.error("Error initializing sound service:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Play a sound alert based on distance
   */
  async playAlert(distance: number): Promise<void> {
    if (!this.enabled || !this.isInitialized) return;

    let soundType: SoundType;
    let volume: number = 1.0;
    let rate: number = 1.0;

    if (distance <= 100) {
      soundType = SoundType.ALERT_CRITICAL;
      volume = 1.0;
      rate = 1.5; // Faster beep for critical
    } else if (distance <= 200) {
      soundType = SoundType.ALERT_HIGH;
      volume = 0.8;
      rate = 1.2;
    } else if (distance <= 300) {
      soundType = SoundType.ALERT_MEDIUM;
      volume = 0.6;
      rate = 1.0;
    } else {
      return; // No alert for distances > 300cm
    }

    const sound = this.sounds.get(soundType);
    if (!sound) return;

    // Prevent rapid repeated plays
    const lastPlay = this.lastPlayTime.get(soundType) || 0;
    const now = Date.now();
    if (now - lastPlay < this.MIN_PLAY_INTERVAL) {
      return; // Too soon to play again
    }

    try {
      // Set volume (this is a property that can be assigned)
      sound.volume = volume;

      // Use setPlaybackRate method instead of direct assignment
      sound.setPlaybackRate(rate);

      // Try to play even if not loaded - it might load on first play
      try {
        if (sound.playing) {
          // If already playing, restart from beginning
          await sound.seekTo(0);
        } else {
          // Try to play - expo-audio will load if needed
          sound.play();
        }
        this.lastPlayTime.set(soundType, now);
      } catch (playError) {
        console.error("Error during playback:", playError);
        // If play fails, try waiting a bit and retry once
        if (!sound.isLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          try {
            sound.play();
            this.lastPlayTime.set(soundType, now);
          } catch (retryError) {
            console.error("Retry playback failed:", retryError);
          }
        }
      }
    } catch (error) {
      console.error("Error playing alert sound:", error);
      // Don't throw, just log to prevent error loops
    }
  }

  /**
   * Play connection sound
   */
  async playConnect(): Promise<void> {
    if (!this.enabled) return;

    // Try to initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }

    const sound = this.sounds.get(SoundType.ALERT_MEDIUM);
    if (!sound) return;

    try {
      sound.volume = 0.5;
      sound.setPlaybackRate(1.0);
      void sound.seekTo(0);
      sound.play();
    } catch (error) {
      console.error("Error playing connect sound:", error);
      // Retry after a short delay
      setTimeout(() => {
        try {
          sound.play();
        } catch (retryError) {
          console.error("Retry connect sound failed:", retryError);
        }
      }, 200);
    }
  }

  /**
   * Play disconnection sound
   */
  async playDisconnect(): Promise<void> {
    if (!this.enabled) return;

    // Try to initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }

    const sound = this.sounds.get(SoundType.ALERT_MEDIUM);
    if (!sound) return;

    try {
      sound.volume = 0.3;
      sound.setPlaybackRate(0.8);
      void sound.seekTo(0);
      sound.play();
    } catch (error) {
      console.error("Error playing disconnect sound:", error);
      // Retry after a short delay
      setTimeout(() => {
        try {
          sound.play();
        } catch (retryError) {
          console.error("Retry disconnect sound failed:", retryError);
        }
      }, 200);
    }
  }

  /**
   * Stop all sounds
   */
  async stopAll(): Promise<void> {
    for (const sound of this.sounds.values()) {
      try {
        if (sound.isLoaded && sound.playing) {
          sound.pause();
        }
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
  }

  /**
   * Enable/disable sound service
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      void this.stopAll();
    }
  }

  /**
   * Check if sound service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Release all sound resources
   */
  async release(): Promise<void> {
    for (const sound of this.sounds.values()) {
      try {
        if (sound.isLoaded) {
          sound.pause();
          sound.remove();
        }
      } catch (error) {
        console.error("Error releasing sound:", error);
      }
    }
    this.sounds.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const soundService = new SoundService();
