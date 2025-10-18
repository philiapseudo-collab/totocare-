/**
 * Haptic feedback utilities for mobile devices
 * Uses the Vibration API for tactile feedback
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30]
};

/**
 * Trigger haptic feedback if supported by the device
 */
export function haptic(pattern: HapticPattern = 'light') {
  if (!('vibrate' in navigator)) {
    return;
  }

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Haptic feedback for button clicks
 */
export function hapticClick() {
  haptic('light');
}

/**
 * Haptic feedback for form submissions
 */
export function hapticSubmit() {
  haptic('medium');
}

/**
 * Haptic feedback for successful actions
 */
export function hapticSuccess() {
  haptic('success');
}

/**
 * Haptic feedback for errors
 */
export function hapticError() {
  haptic('error');
}

/**
 * Haptic feedback for warnings
 */
export function hapticWarning() {
  haptic('warning');
}
