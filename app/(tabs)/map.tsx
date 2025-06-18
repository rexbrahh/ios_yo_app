import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
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
  ZoomIn,
  ZoomOut
} from 'lucide-react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

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
  isFriend?: boolean;
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749, // Default to San Francisco area (replace with your campus coordinates)
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const bottomSheetAnim = useRef(new Animated.Value(-200)).current;
  const mapRef = useRef<MapView | null>(null);

  // Mock data for friends and other users (in a real app, this would come from your backend)
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
    {
      id: 4,
      name: 'Sam',
      location: { latitude: 37.7748, longitude: -122.4175 },
      lastSeen: '5 min ago',
      isActive: true,
    },
    {
      id: 5,
      name: 'Riley',
      location: { latitude: 37.7752, longitude: -122.4205 },
      lastSeen: '30 min ago',
      isActive: true,
    },
    {
      id: 6,
      name: 'Casey',
      location: { latitude: 37.7746, longitude: -122.4185 },
      lastSeen: '2 hours ago',
      isActive: false,
    },
    {
      id: 7,
      name: 'Taylor',
      location: { latitude: 37.7753, longitude: -122.4195 },
      lastSeen: '15 min ago',
      isActive: true,
    },
    {
      id: 8,
      name: 'Morgan',
      location: { latitude: 37.7750, longitude: -122.4170 },
      lastSeen: '1 hour ago',
      isActive: true,
    },
    {
      id: 9,
      name: 'Avery',
      location: { latitude: 37.7747, longitude: -122.4210 },
      lastSeen: '4 hours ago',
      isActive: false,
    },
    {
      id: 10,
      name: 'Quinn',
      location: { latitude: 37.7754, longitude: -122.4165 },
      lastSeen: '10 min ago',
      isActive: true,
    },
  ];

  const otherUsers: Friend[] = [
    {
      id: 11,
      name: 'Blake',
      location: { latitude: 37.7742, longitude: -122.4215 },
      lastSeen: '1 hour ago',
      isActive: true,
    },
    {
      id: 12,
      name: 'Drew',
      location: { latitude: 37.7758, longitude: -122.4160 },
      lastSeen: '3 hours ago',
      isActive: false,
    },
    {
      id: 13,
      name: 'Sage',
      location: { latitude: 37.7744, longitude: -122.4220 },
      lastSeen: '45 min ago',
      isActive: true,
    },
    {
      id: 14,
      name: 'River',
      location: { latitude: 37.7756, longitude: -122.4155 },
      lastSeen: '2 hours ago',
      isActive: false,
    },
    {
      id: 15,
      name: 'Phoenix',
      location: { latitude: 37.7741, longitude: -122.4225 },
      lastSeen: '20 min ago',
      isActive: true,
    },
    {
      id: 16,
      name: 'Rowan',
      location: { latitude: 37.7759, longitude: -122.4150 },
      lastSeen: '5 hours ago',
      isActive: false,
    },
    {
      id: 17,
      name: 'Skylar',
      location: { latitude: 37.7743, longitude: -122.4230 },
      lastSeen: '1 hour ago',
      isActive: true,
    },
    {
      id: 18,
      name: 'Emery',
      location: { latitude: 37.7757, longitude: -122.4145 },
      lastSeen: '30 min ago',
      isActive: true,
    },
    {
      id: 19,
      name: 'Finley',
      location: { latitude: 37.7740, longitude: -122.4235 },
      lastSeen: '6 hours ago',
      isActive: false,
    },
    {
      id: 20,
      name: 'Reese',
      location: { latitude: 37.7760, longitude: -122.4140 },
      lastSeen: '25 min ago',
      isActive: true,
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
    // Initial location fetch and animation
    const initializeMap = async () => {
      const initialLocation = await getCurrentLocation();
      
      // If we got a location, do the initial fly-in animation
      if (initialLocation && mapRef.current) {
        // Start from a zoomed out view
        mapRef.current.setCamera({
          center: {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
          },
          zoom: 5, // Very zoomed out
          heading: 0,
          pitch: 0,
        });
        
        // After a brief moment, fly in to the user's location
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: initialLocation.coords.latitude,
              longitude: initialLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 2000); // 2 second smooth animation
          }
        }, 500);
      }
    };
    
    initializeMap();
    
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
    // Always try to refresh location when the user explicitly taps the button
    const freshLocation = await getCurrentLocation(true);

    // Fallback to previously cached location only if fresh lookup failed
    const coordsToCenter = freshLocation?.coords ?? location?.coords;
    if (!coordsToCenter) {
      Alert.alert('Location unavailable', 'Unable to determine your current position.');
      return;
    }

    if (mapRef.current) {
      setIsAnimating(true);
      
      try {
        // Get current camera position
        const camera = await mapRef.current.getCamera();
        
        // First, zoom out to get a bird's eye view (Google Earth style)
        await mapRef.current.animateCamera({
          center: {
            latitude: camera.center.latitude,
            longitude: camera.center.longitude,
          },
          zoom: camera.zoom - 5, // Zoom out significantly
          heading: 0,
          pitch: 0,
        }, { duration: 800 });

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 300));

        // Then fly to the user's location with a smooth zoom in
        await mapRef.current.animateCamera({
          center: {
            latitude: coordsToCenter.latitude,
            longitude: coordsToCenter.longitude,
          },
          zoom: 17, // Zoom in close
          heading: 0,
          pitch: 45, // Add some tilt for 3D effect
        }, { duration: 1500 });
        
        // Final adjustment to remove tilt
        setTimeout(() => {
          mapRef.current?.animateCamera({
            center: {
              latitude: coordsToCenter.latitude,
              longitude: coordsToCenter.longitude,
            },
            zoom: 17,
            heading: 0,
            pitch: 0,
          }, { duration: 500 });
        }, 100);
        
      } catch (error) {
        // Fallback to simple animation if camera methods aren't available
        mapRef.current.animateToRegion({
          latitude: coordsToCenter.latitude,
          longitude: coordsToCenter.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1500);
      } finally {
        setIsAnimating(false);
      }
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

  const handleZoomIn = async () => {
    if (mapRef.current) {
      const camera = await mapRef.current.getCamera();
      mapRef.current.animateCamera({
        ...camera,
        zoom: camera.zoom + 1,
      }, { duration: 300 });
    }
  };

  const handleZoomOut = async () => {
    if (mapRef.current) {
      const camera = await mapRef.current.getCamera();
      mapRef.current.animateCamera({
        ...camera,
        zoom: Math.max(camera.zoom - 1, 1), // Prevent zooming out too far
      }, { duration: 300 });
    }
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
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={isLocationVisible}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="standard"
        ref={mapRef}
        zoomEnabled={true}
        zoomControlEnabled={true}
        zoomTapEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
      >
        {/* User privacy circle */}
        {location && isLocationVisible && (
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={100}
            strokeColor={Colors.primary}
            fillColor={`${Colors.primary}20`}
            strokeWidth={2}
          />
        )}

        {/* Friend Markers */}
        {friends.map((friend) => (
          <Marker key={`friend-${friend.id}`} coordinate={friend.location} onPress={() => Alert.alert(friend.name, `Last seen: ${friend.lastSeen}`)}>
            <View style={[styles.friendAvatar, friend.isActive && styles.friendMarkerActive]}> 
              <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
              {friend.isActive && <View style={styles.activeIndicator} />}
            </View>
          </Marker>
        ))}

        {/* Other User Markers */}
        {otherUsers.map((user) => (
          <Marker key={`user-${user.id}`} coordinate={user.location} onPress={() => Alert.alert(user.name, `Last seen: ${user.lastSeen}`)}>
            <View style={[styles.otherUserAvatar, user.isActive && styles.otherUserMarkerActive]}> 
              <Text style={styles.otherUserAvatarText}>{user.name[0]}</Text>
              {user.isActive && <View style={styles.otherUserActiveIndicator} />}
            </View>
          </Marker>
        ))}

        {/* Gathering Markers */}
        {gatherings.map((gathering) => {
          const IconComponent = gathering.icon;
          return (
            <Marker key={`gathering-${gathering.id}`} coordinate={gathering.location} onPress={() => handleGatheringPress(gathering)}>
              <View style={[styles.gatheringMarker, { backgroundColor: getGatheringColor(gathering.type) }]}> 
                <IconComponent size={20} color={Colors.white} />
                <View style={styles.attendeeBadge}>
                  <Text style={styles.attendeeCount}>{gathering.attendees}</Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

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
        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={handleZoomIn}
          >
            <ZoomIn size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={handleZoomOut}
          >
            <ZoomOut size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Location Button */}
        <TouchableOpacity 
          style={[
            styles.floatingButton, 
            (isLocatingUser || isAnimating) && { opacity: 0.6 }
          ]} 
          onPress={centerOnUser}
          disabled={isLocatingUser || isAnimating}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: isAnimating ? 
                  bottomSheetAnim.interpolate({
                    inputRange: [-200, 0],
                    outputRange: ['0deg', '360deg'],
                  }) : '0deg'
              }]
            }}
          >
            <Navigation 
              size={20} 
              color={(isLocatingUser || isAnimating) ? Colors.textSecondary : Colors.primary} 
            />
          </Animated.View>
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
  map: {
    flex: 1,
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
  zoomControls: {
    backgroundColor: Colors.white,
    borderRadius: 25,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 50,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: Colors.light,
    marginHorizontal: 10,
  },
  friendMarker: {
    alignItems: 'center',
    position: 'relative',
  },
  friendMarkerActive: {
    transform: [{ scale: 1.15 }],
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  friendAvatarText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2.5,
    borderColor: Colors.white,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
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
  otherUserAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  otherUserMarkerActive: {
    transform: [{ scale: 1.05 }],
  },
  otherUserAvatarText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  otherUserActiveIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});       