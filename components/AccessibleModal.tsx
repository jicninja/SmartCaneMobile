import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { AudioManager } from "@/services/AudioManager";
import * as Haptics from "expo-haptics";

export interface AccessibleModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "error" | "warning" | "success" | "info";
  onClose?: () => void;
  primaryButton?: {
    label: string;
    onPress: () => void;
  };
  secondaryButton?: {
    label: string;
    onPress: () => void;
  };
  autoAnnounce?: boolean;
}

/**
 * Accessible Modal for SmartCane App
 * Optimized for blind users with automatic announcements
 */
export function AccessibleModal({
  visible,
  title,
  message,
  type = "info",
  onClose,
  primaryButton,
  secondaryButton,
  autoAnnounce = true,
}: AccessibleModalProps): JSX.Element {
  useEffect(() => {
    if (visible && autoAnnounce) {
      // Announce modal content
      const announcement = `${title}. ${message}. ${
        primaryButton ? `Botón ${primaryButton.label}.` : ""
      } ${secondaryButton ? `Botón ${secondaryButton.label}.` : ""}`;

      AudioManager.announce(
        announcement,
        type === "error" ? "critical" : "high",
        type as "error" | "warning" | "success" | "info"
      );
    }
  }, [
    visible,
    title,
    message,
    type,
    autoAnnounce,
    primaryButton,
    secondaryButton,
  ]);

  const getModalStyle = (): ViewStyle => {
    switch (type) {
      case "error":
        return {
          backgroundColor: "#ffebee",
          borderColor: "#d32f2f",
        };
      case "warning":
        return {
          backgroundColor: "#fff3e0",
          borderColor: "#f57c00",
        };
      case "success":
        return {
          backgroundColor: "#e8f5e9",
          borderColor: "#388e3c",
        };
      default:
        return {
          backgroundColor: "#e3f2fd",
          borderColor: "#1976d2",
        };
    }
  };

  const getIcon = (): string => {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  const handlePrimaryPress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    primaryButton?.onPress();
  };

  const handleSecondaryPress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    secondaryButton?.onPress();
  };

  const handleClose = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AudioManager.announce("Modal cerrado", "low");
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <ThemedView style={[styles.modalContent, getModalStyle()]}>
          {/* Icon */}
          <ThemedText style={styles.icon}>{getIcon()}</ThemedText>

          {/* Title */}
          <ThemedText
            type="title"
            style={styles.title}
            accessibilityRole="header"
          >
            {title}
          </ThemedText>

          {/* Message */}
          <ThemedText style={styles.message}>{message}</ThemedText>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {primaryButton && (
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handlePrimaryPress}
                accessibilityRole="button"
                accessibilityLabel={primaryButton.label}
                accessibilityHint="Toque dos veces para activar"
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.primaryButtonText}
                >
                  {primaryButton.label}
                </ThemedText>
              </Pressable>
            )}

            {secondaryButton && (
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSecondaryPress}
                accessibilityRole="button"
                accessibilityLabel={secondaryButton.label}
                accessibilityHint="Toque dos veces para activar"
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.secondaryButtonText}
                >
                  {secondaryButton.label}
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Close button if no buttons provided */}
          {!primaryButton && !secondaryButton && onClose && (
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.primaryButtonText}
              >
                CERRAR
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    gap: 20,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 4,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 28,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    marginTop: 12,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 70,
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#1976d2",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 20,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#1976d2",
  },
  secondaryButtonText: {
    color: "#1976d2",
    fontSize: 18,
  },
});
