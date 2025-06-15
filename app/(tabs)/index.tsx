import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { stripeProducts } from '@/src/stripe-config';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';
import { CreditCard, Check, Crown, Star } from 'lucide-react-native';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSubscription();
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
      setSubscriptionLoading(false);
    }
  };

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setToast({ message: 'Please log in to continue', type: 'error' });
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/`,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to start checkout', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return null;
    
    const status = subscription.subscription_status;
    if (status === 'active') {
      return { text: 'Active Premium', color: Colors.accent, icon: Check };
    } else if (status === 'trialing') {
      return { text: 'Trial Active', color: Colors.warning, icon: Star };
    } else if (status === 'past_due') {
      return { text: 'Payment Due', color: Colors.error, icon: CreditCard };
    } else if (status === 'canceled') {
      return { text: 'Canceled', color: Colors.textSecondary, icon: null };
    }
    return null;
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to UniConnect</Text>
          <Text style={styles.subtitle}>Connect with fellow students and unlock premium features</Text>
        </View>

        {/* Subscription Status */}
        {subscriptionLoading ? (
          <Card style={styles.statusCard}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.statusText}>Loading subscription status...</Text>
          </Card>
        ) : subscriptionStatus ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {subscriptionStatus.icon && (
                <subscriptionStatus.icon size={20} color={subscriptionStatus.color} />
              )}
              <Text style={[styles.statusText, { color: subscriptionStatus.color }]}>
                {subscriptionStatus.text}
              </Text>
            </View>
            {subscription.subscription_status === 'active' && (
              <Text style={styles.statusSubtext}>
                Your premium subscription is active and ready to use!
              </Text>
            )}
          </Card>
        ) : null}

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          
          {stripeProducts.map((product) => (
            <Card key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Crown size={24} color={Colors.primary} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ${(product.price! / 100).toFixed(2)}
                  </Text>
                  <Text style={styles.priceInterval}>
                    {product.mode === 'subscription' ? '/month' : 'one-time'}
                  </Text>
                </View>
              </View>

              <View style={styles.features}>
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

              <Button
                title={loading ? 'Processing...' : `Get ${product.name}`}
                onPress={() => handlePurchase(product.priceId, product.mode)}
                disabled={loading || (subscription?.subscription_status === 'active')}
                style={[
                  styles.purchaseButton,
                  subscription?.subscription_status === 'active' && styles.disabledButton
                ]}
              />
              
              {subscription?.subscription_status === 'active' && (
                <Text style={styles.alreadySubscribed}>
                  You already have an active subscription
                </Text>
              )}
            </Card>
          ))}
        </View>

        {/* Features Overview */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          
          <Card style={styles.featureCard}>
            <Text style={styles.featureCardTitle}>Enhanced Matching</Text>
            <Text style={styles.featureCardDescription}>
              Get matched with students who share your interests, study habits, and campus activities.
            </Text>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureCardTitle}>Exclusive Events</Text>
            <Text style={styles.featureCardDescription}>
              Access to premium campus events, study groups, and networking opportunities.
            </Text>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureCardTitle}>Priority Support</Text>
            <Text style={styles.featureCardDescription}>
              Get help when you need it with our dedicated premium support team.
            </Text>
          </Card>
        </View>
      </ScrollView>

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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
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
  },
  statusCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  statusText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  statusSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  productsSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  productCard: {
    marginBottom: Layout.spacing.lg,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  productInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  productName: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  productDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  priceInterval: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  features: {
    marginBottom: Layout.spacing.lg,
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
  purchaseButton: {
    marginBottom: Layout.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  alreadySubscribed: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  featureCard: {
    marginBottom: Layout.spacing.md,
  },
  featureCardTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  featureCardDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});