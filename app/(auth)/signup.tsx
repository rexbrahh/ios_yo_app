import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ArrowLeft, Mail, Lock, User, Calendar } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setToast({ message: 'Please enter your full name', type: 'error' });
      return false;
    }
    if (!formData.email.includes('@')) {
      setToast({ message: 'Please enter a valid email address', type: 'error' });
      return false;
    }
    if (formData.password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return false;
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 16 || age > 25) {
      setToast({ message: 'Please enter a valid age (16-25)', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: parseInt(formData.age),
          }
        }
      });

      if (error) {
        setToast({ message: error.message, type: 'error' });
      } else {
        setToast({ message: 'Account created successfully!', type: 'success' });
        router.push('/(auth)/profile-setup');
      }
    } catch (error: any) {
      setToast({ message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.primary}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join your university community
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <TextInput
                    style={[styles.input, { paddingLeft: Layout.spacing.md }]}
                    placeholder="Last name"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                />
              </View>

              <Button
                title={loading ? "Creating Account..." : "Continue"}
                onPress={handleSignUp}
                disabled={loading}
                style={styles.continueButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xxxl,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.white,
    opacity: 0.9,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputIcon: {
    marginRight: Layout.spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  continueButton: {
    backgroundColor: Colors.white,
    marginTop: Layout.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18,
  },
});