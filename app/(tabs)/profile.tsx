import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Edit2, 
  Settings, 
  LogOut, 
  GraduationCap, 
  MapPin, 
  Heart, 
  Users,
  MessageCircle,
  Camera
} from 'lucide-react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // Mock profile data for demonstration
        setProfile({
          name: 'Alex Chen',
          program: 'Computer Science',
          year: 'Freshman',
          dorm: 'West Hall',
          bio: 'Looking for study partners and new friends! Love coding, gaming, and late-night coffee runs. Always down for campus adventures.',
          interests: ['Programming', 'Gaming', 'Coffee', 'Movies', 'Basketball'],
          connections: 3,
          gatherings: 5,
          messages: 12,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const stats = [
    { label: 'Connections', value: profile?.connections || 0, icon: Users, color: Colors.primary },
    { label: 'Gatherings', value: profile?.gatherings || 0, icon: MapPin, color: Colors.accent },
    { label: 'Messages', value: profile?.messages || 0, icon: MessageCircle, color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit2 size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <View style={styles.profileDetails}>
              <GraduationCap size={16} color={Colors.textSecondary} />
              <Text style={styles.profileProgram}>
                {profile?.program} • {profile?.year}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.profileDorm}>{profile?.dorm}</Text>
            </View>
          </View>

          <Text style={styles.profileBio}>{profile?.bio}</Text>

          {/* Interests */}
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsTitle}>Interests</Text>
            <View style={styles.interestsList}>
              {profile?.interests?.map((interest: string, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <IconComponent size={20} color={Colors.white} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <Card style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Heart size={20} color={Colors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>View Your Connections</Text>
                <Text style={styles.actionSubtitle}>See people you've connected with</Text>
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <MapPin size={20} color={Colors.accent} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Your Gatherings</Text>
                <Text style={styles.actionSubtitle}>Events you've joined or created</Text>
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Settings size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Privacy Settings</Text>
                <Text style={styles.actionSubtitle}>Control who can find and message you</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Card style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.error }]}>
                <LogOut size={20} color={Colors.white} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: Colors.error }]}>Sign Out</Text>
                <Text style={styles.actionSubtitle}>You can always sign back in</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  settingsButton: {
    padding: Layout.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  profileCard: {
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    backgroundColor: Colors.light,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.medium,
  },
  editButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  profileInfo: {
    marginBottom: Layout.spacing.lg,
  },
  profileName: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  profileProgram: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  profileDorm: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  profileBio: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Layout.spacing.lg,
  },
  interestsContainer: {
    marginBottom: Layout.spacing.lg,
  },
  interestsTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
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
  statsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  statContent: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  actionCard: {
    marginBottom: Layout.spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  actionSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  bottomSpacing: {
    height: Layout.spacing.xl,
  },
}); 