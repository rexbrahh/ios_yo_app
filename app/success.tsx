import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Check, Crown, Sparkles } from 'lucide-react-native';

export default function SuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Wait a moment for webhook to process, then fetch subscription
    const timer = setTimeout(() => {
      fetchSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
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
          <Text style={styles.loadingText}>Processing your purchase...</Text>
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
          <Sparkles size={20} color={Colors.accent} style={styles.sparkle3} />
        </View>

        <Text style={styles.title}>Welcome to Premium!</Text>
        <Text style={styles.subtitle}>
          Your payment was successful and your premium features are now active.
        </Text>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Crown size={24} color={Colors.primary} />
            <Text style={styles.statusTitle}>Premium Active</Text>
          </View>
          
          {subscription && (
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionText}>
                Status: <Text style={styles.activeText}>Active</Text>
              </Text>
              {subscription.current_period_end && (
                <Text style={styles.subscriptionText}>
                  Next billing: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </Card>

        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>You now have access to:</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Check size={16} color={Colors.accent} />
              <Text style={styles.featureText}>Unlimited connections</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.accent} />
              <Text style={styles.featureText}>Advanced matching algorithm</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.accent} />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={Colors.accent} />
              <Text style={styles.featureText}>Exclusive campus events</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Continue to App"
          onPress={handleContinue}
          style={styles.continueButton}
        />

        <Text style={styles.footerText}>
          Thank you for supporting UniConnect! If you have any questions, our premium support team is here to help.
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
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
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
  subscriptionDetails: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  subscriptionText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.accent,
    fontFamily: 'Inter-SemiBold',
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