import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';
import { Users, MapPin, MessageCircle, Sparkles, Heart, Calendar } from 'lucide-react-native';

export default function WelcomeScreen() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleGetStarted = () => {
    setToast({ message: 'Welcome to your freshman year adventure! 🎉', type: 'success' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to YoApp</Text>
          <Text style={styles.subtitle}>
            Your companion for building meaningful connections during your freshman year
          </Text>
        </View>

        {/* Welcome Message */}
        {user && (
          <Card style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.welcomeText}>
                Hey {user.email?.split('@')[0]}! Ready to make your mark on campus?
              </Text>
            </View>
          </Card>
        )}

        {/* Main Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Discover Your Campus Community</Text>
          
          <Card style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Users size={32} color={Colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Find Your Tribe</Text>
                <Text style={styles.featureDescription}>
                  Connect with fellow freshmen who share your interests, study habits, and campus vibes
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <MapPin size={32} color={Colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Campus Map & Gatherings</Text>
                <Text style={styles.featureDescription}>
                  Discover spontaneous hangouts and organize study sessions with your new friends
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <MessageCircle size={32} color={Colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Smart Conversations</Text>
                <Text style={styles.featureDescription}>
                  Skip the awkward small talk with personalized icebreakers and conversation starters
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Heart size={32} color={Colors.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>More Than Friendship</Text>
                <Text style={styles.featureDescription}>
                  Open yourself to meaningful relationships - from study partners to something special
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create Your Profile</Text>
              <Text style={styles.stepDescription}>
                Share your interests, study preferences, and what makes you unique
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Discover Compatible People</Text>
              <Text style={styles.stepDescription}>
                Browse profiles of fellow freshmen in your programs and interests
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start Conversations</Text>
              <Text style={styles.stepDescription}>
                Message directly or join group gatherings around campus
              </Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Button
            title="Let's Get Started! 🚀"
            onPress={handleGetStarted}
            style={styles.ctaButton}
          />
          
          <Text style={styles.ctaSubtext}>
            Your freshman year adventure begins now. No more crowded, awkward gatherings - 
            just authentic connections with people who get you.
          </Text>
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
  welcomeCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  welcomeText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    flex: 1,
  },
  featuresSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  featureCard: {
    marginBottom: Layout.spacing.md,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  howItWorksSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  stepNumberText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  stepDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  ctaSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 