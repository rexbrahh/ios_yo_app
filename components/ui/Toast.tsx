import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Check, CircleAlert as AlertCircle } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 4000 }: ToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const Icon = type === 'success' ? Check : AlertCircle;
  const backgroundColor = type === 'success' ? Colors.accent : Colors.error;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.toast, { backgroundColor }]}>
        <Icon size={20} color={Colors.white} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Layout.spacing.lg,
    right: Layout.spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.medium,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: Layout.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Medium',
    color: Colors.white,
  },
});
