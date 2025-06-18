import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Card } from '@/components/ui/Card';
import { MessageCircle, Search, Users, Clock, Heart } from 'lucide-react-native';

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'Alex Chen',
    lastMessage: 'Hey! Want to study together for the CS midterm?',
    time: '2 min ago',
    unread: 2,
    online: true,
    program: 'Computer Science',
    mutualFriends: 0,
  },
  {
    id: 2,
    name: 'Maya Rodriguez',
    lastMessage: 'That philosophy class was intense! What did you think?',
    time: '1 hour ago',
    unread: 0,
    online: false,
    program: 'Psychology',
    mutualFriends: 1,
  },
  {
    id: 3,
    name: 'Jordan Kim',
    lastMessage: 'Coffee at the student center tomorrow?',
    time: '3 hours ago',
    unread: 1,
    online: true,
    program: 'Business',
    mutualFriends: 2,
  },
];

const MOCK_RECOMMENDED_PEOPLE = [
  {
    id: 4,
    name: 'Sam Lee',
    program: 'Engineering',
    mutualFriends: 3,
    reason: '3 mutual friends',
  },
  {
    id: 5,
    name: 'Riley Taylor',
    program: 'Art',
    mutualFriends: 2,
    reason: '2 mutual friends',
  },
];

export default function ChatScreen() {
  const conversations = useMemo(() => MOCK_CONVERSATIONS, []);
  const recommendedPeople = useMemo(() => MOCK_RECOMMENDED_PEOPLE, []);



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chat Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <MessageCircle size={24} color={Colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Open DMs until 5 friends</Text>
              <Text style={styles.infoSubtitle}>
                You can message anyone verified on campus. After 5 friends, you'll need mutual connections.
              </Text>
            </View>
          </View>
        </Card>

        {/* Active Conversations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          {conversations.map((conversation) => (
            <TouchableOpacity key={conversation.id} style={styles.conversationItem}>
              <View style={styles.conversationContent}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, conversation.online && styles.avatarOnline]}>
                    <Text style={styles.avatarText}>{conversation.name[0]}</Text>
                  </View>
                  {conversation.online && <View style={styles.onlineIndicator} />}
                </View>
                
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.name}</Text>
                    <Text style={styles.conversationTime}>
                      {conversation.time}
                    </Text>
                  </View>
                  <Text style={styles.conversationProgram}>{conversation.program}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conversation.lastMessage}
                  </Text>
                  {conversation.mutualFriends > 0 && (
                    <View style={styles.mutualFriends}>
                      <Users size={12} color={Colors.textSecondary} />
                      <Text style={styles.mutualFriendsText}>
                        {conversation.mutualFriends} mutual friend{conversation.mutualFriends > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
                
                {conversation.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{conversation.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended People */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People You Might Know</Text>
          <Text style={styles.sectionSubtitle}>
            Based on mutual friends and shared interests
          </Text>
          
          {recommendedPeople.map((person) => (
            <Card key={person.id} style={styles.recommendedCard}>
              <View style={styles.recommendedContent}>
                <View style={styles.recommendedAvatar}>
                  <Text style={styles.avatarText}>{person.name[0]}</Text>
                </View>
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedName}>{person.name}</Text>
                  <Text style={styles.recommendedProgram}>{person.program}</Text>
                  <View style={styles.recommendedReason}>
                    <Users size={12} color={Colors.primary} />
                    <Text style={styles.recommendedReasonText}>{person.reason}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.messageNewButton}>
                  <Heart size={16} color={Colors.primary} />
                  <Text style={styles.messageNewButtonText}>Say Hi</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Empty State */}
        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start browsing profiles to find people to connect with!
            </Text>
          </View>
        )}
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
  searchButton: {
    padding: Layout.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  infoCard: {
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  infoSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  conversationItem: {
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Layout.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnline: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  conversationName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  conversationTime: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  conversationProgram: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  lastMessage: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  mutualFriends: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  mutualFriendsText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xs,
  },
  unreadCount: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
  },
  recommendedCard: {
    marginBottom: Layout.spacing.md,
  },
  recommendedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  recommendedProgram: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  recommendedReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  recommendedReasonText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: Colors.primary,
  },
  messageNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    backgroundColor: Colors.light,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.medium,
  },
  messageNewButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
    gap: Layout.spacing.md,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});      