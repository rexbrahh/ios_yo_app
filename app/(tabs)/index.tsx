import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Users, Heart, MessageCircle, MoreHorizontal, Filter } from 'lucide-react-native';

const FeedScreen = React.memo(() => {
  const [user, setUser] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const profiles = useMemo(() => [
    {
      id: 1,
      name: 'Alex Chen',
      program: 'Computer Science',
      year: 'Freshman',
      interests: ['Gaming', 'Programming', 'Coffee'],
      bio: 'Looking for study partners and maybe something more! Love late-night coding sessions and exploring campus.',
      distance: '0.2 miles away',
    },
    {
      id: 2,
      name: 'Maya Rodriguez',
      program: 'Psychology',
      year: 'Freshman',
      interests: ['Psychology', 'Art', 'Yoga'],
      bio: 'New to campus and excited to meet people! Always down for deep conversations and campus adventures.',
      distance: '0.5 miles away',
    },
    {
      id: 3,
      name: 'Jordan Kim',
      program: 'Business',
      year: 'Freshman',
      interests: ['Entrepreneurship', 'Basketball', 'Music'],
      bio: 'Startup enthusiast looking for co-founders and friends. Let\'s grab coffee and talk about changing the world!',
      distance: '0.8 miles away',
    },
  ], []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Discover</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Fellow freshmen near you
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {profiles.map((profile) => (
          <Card key={profile.id} style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileProgram}>{profile.program} • {profile.year}</Text>
                <Text style={styles.profileDistance}>{profile.distance}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileBio}>{profile.bio}</Text>

            <View style={styles.interestsContainer}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.passButton}>
                <Text style={styles.passButtonText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.connectButton}>
                <Heart size={16} color={Colors.white} />
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <MessageCircle size={16} color={Colors.primary} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <View style={styles.endMessage}>
          <Users size={32} color={Colors.textSecondary} />
          <Text style={styles.endMessageText}>
            You've seen all the new profiles for now!
          </Text>
          <Text style={styles.endMessageSubtext}>
            Check back later for more freshmen to connect with.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  filterButton: {
    padding: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  profileCard: {
    marginBottom: Layout.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  profileProgram: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  profileDistance: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.primary,
  },
  moreButton: {
    padding: Layout.spacing.xs,
  },
  profileBio: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.lg,
  },
  interestTag: {
    backgroundColor: Colors.light,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
  },
  interestText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  passButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.light,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
  },
  passButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  connectButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
  },
  connectButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  messageButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
  },
  messageButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  endMessageText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  endMessageSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
