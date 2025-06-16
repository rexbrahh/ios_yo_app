import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Check, Users, Sparkles, Heart } from 'lucide-react-native';

export default function SuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Wait a moment for any background processes, then fetch user
    const timer = setTimeout(() => {
      fetchUser();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Setting up your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Check size={48} color={Colors.white} />
          </View>
          <Sparkles size={24} color={Colors.primary} style={styles.sparkle1} />
          <Sparkles size={16} color={Colors.secondary} style={styles.sparkle2} />
          <Sparkles size={20} color={Colors.primary} style={styles.sparkle3} />
        </View>

        <Text style={styles.title}>Welcome to YoApp!</Text>
        <Text style={styles.subtitle}>
          You're all set! Your profile is ready and you can start connecting with fellow freshmen.
        </Text>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.statusTitle}>Profile Complete</Text>
          </View>
          
          <Text style={styles.statusSubtext}>
            Your freshman journey begins now! Start discovering people who share your interests.
          </Text>
        </Card>

        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's next:</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Check size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Browse fellow freshmen profiles</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Find study partners and friends</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Join campus gatherings</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Start meaningful conversations</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Start Exploring"
          onPress={handleContinue}
          style={styles.continueButton}
        />

        <Text style={styles.footerText}>
          Ready to make your freshman year amazing? No more awkward ice breakers - 
          just authentic connections with people who get you!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.lg,
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -5,
    left: -5,
  },
  sparkle3: {
    position: 'absolute',
    top: 10,
    left: -15,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
  },
  statusCard: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  statusTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  statusSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresCard: {
    width: '100%',
    marginBottom: Layout.spacing.xl,
  },
  featuresTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  featuresList: {
    gap: Layout.spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  featureText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
  continueButton: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});