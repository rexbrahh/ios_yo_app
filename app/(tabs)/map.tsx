import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Card } from '@/components/ui/Card';
import { 
  MapPin, 
  Users, 
  Plus, 
  Coffee, 
  BookOpen, 
  Music, 
  User,
  Navigation,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Friend {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastSeen: string;
  isActive: boolean;
  avatar?: string;
}

interface Gathering {
  id: number;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  attendees: number;
  type: 'study' | 'social' | 'hobby';
  time: string;
  icon: any;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLocationVisible, setIsLocationVisible] = useState(true);
  const [selectedGathering, setSelectedGathering] = useState<Gathering | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749, // Default to San Francisco area (replace with your campus coordinates)
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const bottomSheetAnim = useRef(new Animated.Value(-200)).current;

  // Mock data for friends and gatherings (in a real app, this would come from your backend)
  const friends: Friend[] = [
    {
      id: 1,
      name: 'Alex',
      location: { latitude: 37.7751, longitude: -122.4180 },
      lastSeen: '2 min ago',
      isActive: true,
    },
    {
      id: 2,
      name: 'Maya',
      location: { latitude: 37.7745, longitude: -122.4200 },
      lastSeen: '1 hour ago',
      isActive: true,
    },
    {
      id: 3,
      name: 'Jordan',
      location: { latitude: 37.7755, longitude: -122.4190 },
      lastSeen: '3 hours ago',
      isActive: false,
    },
  ];

  const gatherings: Gathering[] = [
    {
      id: 1,
      title: 'Study Session',
      location: { latitude: 37.7748, longitude: -122.4195 },
      attendees: 8,
      type: 'study',
      time: '2:00 PM - 5:00 PM',
      icon: BookOpen,
    },
    {
      id: 2,
      title: 'Coffee Chat',
      location: { latitude: 37.7752, longitude: -122.4185 },
      attendees: 4,
      type: 'social',
      time: '4:30 PM - 6:00 PM',
      icon: Coffee,
    },
    {
      id: 3,
      title: 'Music Jam',
      location: { latitude: 37.7750, longitude: -122.4205 },
      attendees: 12,
      type: 'hobby',
      time: '7:00 PM - 9:00 PM',
      icon: Music,
    },
  ];

  useEffect(() => {
    getCurrentLocation();
    
    // Set up periodic location updates every 30 seconds
    const locationInterval = setInterval(() => {
      getCurrentLocation(false); // Update silently
    }, 30000);
    
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    if (selectedGathering) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [selectedGathering]);

  const getCurrentLocation = async (showUserFeedback = false) => {
    try {
      if (showUserFeedback) {
        setIsLocatingUser(true);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for the map to work properly.');
        return null;
      }

      let currentLocation;
      
      try {
        // First, try to get high-accuracy GPS location
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        if (showUserFeedback) {
          console.log('GPS location acquired successfully');
        }
      } catch (gpsError) {
        console.log('GPS location failed, trying network location:', gpsError);
        
        try {
          // Fallback to network-based location (faster, less accurate)
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          if (showUserFeedback) {
            console.log('Network location acquired successfully');
          }
        } catch (networkError) {
          console.log('Network location failed, using last known location:', networkError);
          
          try {
            // Final fallback to last known location
            currentLocation = await Location.getLastKnownPositionAsync({
              requiredAccuracy: 1000, // Accept location within 1km accuracy
            });
            
            if (!currentLocation) {
              Alert.alert(
                'Location unavailable', 
                'Unable to get your current location. Please check your location settings and try again.'
              );
              return null;
            }
            
            if (showUserFeedback) {
              console.log('Last known location used');
            }
          } catch (lastKnownError) {
            console.error('All location methods failed:', lastKnownError);
            Alert.alert(
              'Location error', 
              'Unable to determine your location. Please ensure location services are enabled.'
            );
            return null;
          }
        }
      }

      setLocation(currentLocation);
      
      // Update map region to current location only if this is the initial load or user requested it
      if (showUserFeedback || !location) {
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location error', 'An unexpected error occurred while getting your location.');
      return null;
    } finally {
      if (showUserFeedback) {
        setIsLocatingUser(false);
      }
    }
  };

  const showBottomSheet = () => {
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.spring(bottomSheetAnim, {
      toValue: -200,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const centerOnUser = async () => {
    // If we already have a location, just center on it
    if (location) {
      Alert.alert('Location Found', `Centered on: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
      return;
    }
    
    // Otherwise, get fresh location with user feedback
    const freshLocation = await getCurrentLocation(true);
    if (freshLocation) {
      Alert.alert('Location Found', `Centered on: ${freshLocation.coords.latitude.toFixed(4)}, ${freshLocation.coords.longitude.toFixed(4)}`);
    }
  };

  const toggleLocationVisibility = () => {
    setIsLocationVisible(!isLocationVisible);
  };

  const handleGatheringPress = (gathering: Gathering) => {
    setSelectedGathering(gathering);
  };

  const joinGathering = () => {
    if (selectedGathering) {
      Alert.alert('Joined!', `You've joined "${selectedGathering.title}"`);
      setSelectedGathering(null);
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const renderFriendMarker = (friend: Friend) => (
    <TouchableOpacity
      key={`friend-${friend.id}`}
      style={[
        styles.friendMarker,
        friend.isActive && styles.friendMarkerActive,
        {
          position: 'absolute',
          top: height * 0.3 + (friend.id * 60), // Spread them vertically
          left: width * 0.2 + (friend.id * 80), // Spread them horizontally
        }
      ]}
      onPress={() => Alert.alert(friend.name, `Last seen: ${friend.lastSeen}`)}
    >
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
      </View>
      {friend.isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  const renderGatheringMarker = (gathering: Gathering) => {
    const IconComponent = gathering.icon;
    return (
      <TouchableOpacity
        key={`gathering-${gathering.id}`}
        style={[
          styles.gatheringMarker,
          { 
            backgroundColor: getGatheringColor(gathering.type),
            position: 'absolute',
            top: height * 0.4 + (gathering.id * 70),
            right: width * 0.2 + (gathering.id * 60),
          }
        ]}
        onPress={() => handleGatheringPress(gathering)}
      >
        <IconComponent size={20} color={Colors.white} />
        <View style={styles.attendeeBadge}>
          <Text style={styles.attendeeCount}>{gathering.attendees}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getGatheringColor = (type: string) => {
    switch (type) {
      case 'study': return Colors.primary;
      case 'social': return Colors.accent;
      case 'hobby': return Colors.warning;
      default: return Colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>🗺️ Campus Map</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {location 
            ? `Current Location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : 'Getting your location...'
          }
        </Text>
        
        {/* User location indicator */}
        {location && isLocationVisible && (
          <View style={[styles.userLocationMarker, {
            position: 'absolute',
            top: height * 0.5,
            left: width * 0.5,
          }]}>
            <View style={styles.userLocationDot} />
            <View style={styles.privacyCircle} />
          </View>
        )}

        {/* Friend markers */}
        {friends.map(renderFriendMarker)}

        {/* Gathering markers */}
        {gatherings.map(renderGatheringMarker)}
      </View>

      {/* Profile Button - Upper Left */}
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <User size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Top Right Controls */}
      <View style={styles.topRightControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleLocationVisibility}>
          {isLocationVisible ? <Eye size={20} color={Colors.primary} /> : <EyeOff size={20} color={Colors.textSecondary} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={[styles.floatingButton, isLocatingUser && { opacity: 0.6 }]} 
          onPress={centerOnUser}
          disabled={isLocatingUser}
        >
          <Navigation size={20} color={isLocatingUser ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet for Gathering Details */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: bottomSheetAnim }],
          }
        ]}
      >
        {selectedGathering && (
          <Card style={styles.bottomSheetCard}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.gatheringInfo}>
                <Text style={styles.gatheringTitle}>{selectedGathering.title}</Text>
                <Text style={styles.gatheringTime}>{selectedGathering.time}</Text>
                <View style={styles.gatheringMeta}>
                  <Users size={14} color={Colors.textSecondary} />
                  <Text style={styles.gatheringAttendees}>
                    {selectedGathering.attendees} people going
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedGathering(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomSheetActions}>
              <TouchableOpacity style={styles.joinButton} onPress={joinGathering}>
                <Text style={styles.joinButtonText}>Join Gathering</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.directionButton}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.directionButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <Card style={styles.legendCard}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Active Friends</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Study Groups</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.legendText}>Social Events</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Light blue background to simulate map
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  userLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    zIndex: 2,
  },
  privacyCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  profileButtonContainer: {
    position: 'absolute',
    top: 60, // Adjust based on safe area
    left: Layout.spacing.lg,
    zIndex: 1000,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  topRightControls: {
    position: 'absolute',
    top: 60,
    right: Layout.spacing.lg,
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    zIndex: 1000,
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtons: {
    position: 'absolute',
    right: Layout.spacing.lg,
    bottom: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  friendMarker: {
    alignItems: 'center',
    position: 'relative',
  },
  friendMarkerActive: {
    transform: [{ scale: 1.1 }],
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  friendAvatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  gatheringMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    position: 'relative',
  },
  attendeeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
borderColor: Colors.light,
  },
  attendeeCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },
  bottomSheetCard: {
    padding: Layout.spacing.lg,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  gatheringInfo: {
    flex: 1,
  },
  gatheringTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  gatheringTime: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  gatheringMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gatheringAttendees: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.primary,
paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
  },
  joinButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: Layout.fontSize.md,
  },
  directionButton: {
    flex: 1,
    backgroundColor: Colors.white,
paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: Layout.fontSize.md,
  },
  legend: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    left: Layout.spacing.lg,
    maxWidth: 200,
  },
  legendCard: {
    padding: Layout.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
}); 