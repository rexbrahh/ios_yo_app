import Foundation
import CoreLocation

class PrivacyService: ObservableObject {
    @Published var locationSharingEnabled = true
    @Published var shareLocationWithFriends = true
    @Published var shareLocationInGatherings = true
    @Published var allowLocationBasedNotifications = true
    @Published var visibilityRadius: Double = 1000 // meters
    @Published var onlineStatusVisible = true
    @Published var profileVisibility: ProfileVisibility = .friends
    
    enum ProfileVisibility: String, CaseIterable {
        case everyone = "everyone"
        case friends = "friends"
        case nobody = "nobody"
        
        var displayName: String {
            switch self {
            case .everyone: return "Everyone"
            case .friends: return "Friends Only"
            case .nobody: return "Nobody"
            }
        }
    }
    
    private let userDefaults = UserDefaults.standard
    private let databaseService = DatabaseService()
    
    init() {
        loadPrivacySettings()
    }
    
    func updateLocationSharingEnabled(_ enabled: Bool) {
        locationSharingEnabled = enabled
        userDefaults.set(enabled, forKey: "locationSharingEnabled")
        
        if !enabled {
            shareLocationWithFriends = false
            shareLocationInGatherings = false
        }
        
        syncPrivacySettingsToServer()
    }
    
    func updateShareLocationWithFriends(_ enabled: Bool) {
        shareLocationWithFriends = enabled
        userDefaults.set(enabled, forKey: "shareLocationWithFriends")
        syncPrivacySettingsToServer()
    }
    
    func updateShareLocationInGatherings(_ enabled: Bool) {
        shareLocationInGatherings = enabled
        userDefaults.set(enabled, forKey: "shareLocationInGatherings")
        syncPrivacySettingsToServer()
    }
    
    func updateVisibilityRadius(_ radius: Double) {
        visibilityRadius = radius
        userDefaults.set(radius, forKey: "visibilityRadius")
        syncPrivacySettingsToServer()
    }
    
    func updateOnlineStatusVisible(_ visible: Bool) {
        onlineStatusVisible = visible
        userDefaults.set(visible, forKey: "onlineStatusVisible")
        syncPrivacySettingsToServer()
    }
    
    func updateProfileVisibility(_ visibility: ProfileVisibility) {
        profileVisibility = visibility
        userDefaults.set(visibility.rawValue, forKey: "profileVisibility")
        syncPrivacySettingsToServer()
    }
    
    func updateLocationBasedNotifications(_ enabled: Bool) {
        allowLocationBasedNotifications = enabled
        userDefaults.set(enabled, forKey: "allowLocationBasedNotifications")
        syncPrivacySettingsToServer()
    }
    
    func shouldShareLocationWith(userId: String) -> Bool {
        guard locationSharingEnabled else { return false }
        
        switch profileVisibility {
        case .nobody:
            return false
        case .friends:
            return shareLocationWithFriends && isFriend(userId: userId)
        case .everyone:
            return shareLocationWithFriends
        }
    }
    
    func shouldShowInGathering(gatheringId: String) -> Bool {
        return locationSharingEnabled && shareLocationInGatherings
    }
    
    func getFilteredLocation(for userId: String, actualLocation: CLLocationCoordinate2D) -> CLLocationCoordinate2D? {
        guard shouldShareLocationWith(userId: userId) else { return nil }
        
        if visibilityRadius < 10000 { // If radius is less than 10km, apply some privacy filtering
            let offsetLat = Double.random(in: -0.001...0.001) * (visibilityRadius / 1000)
            let offsetLng = Double.random(in: -0.001...0.001) * (visibilityRadius / 1000)
            
            return CLLocationCoordinate2D(
                latitude: actualLocation.latitude + offsetLat,
                longitude: actualLocation.longitude + offsetLng
            )
        }
        
        return actualLocation
    }
    
    private func loadPrivacySettings() {
        locationSharingEnabled = userDefaults.bool(forKey: "locationSharingEnabled") 
        shareLocationWithFriends = userDefaults.bool(forKey: "shareLocationWithFriends")
        shareLocationInGatherings = userDefaults.bool(forKey: "shareLocationInGatherings")
        allowLocationBasedNotifications = userDefaults.bool(forKey: "allowLocationBasedNotifications")
        visibilityRadius = userDefaults.double(forKey: "visibilityRadius")
        onlineStatusVisible = userDefaults.bool(forKey: "onlineStatusVisible")
        
        if let visibilityString = userDefaults.string(forKey: "profileVisibility"),
           let visibility = ProfileVisibility(rawValue: visibilityString) {
            profileVisibility = visibility
        }
        
        if !userDefaults.bool(forKey: "privacySettingsInitialized") {
            setDefaultPrivacySettings()
        }
    }
    
    private func setDefaultPrivacySettings() {
        locationSharingEnabled = true
        shareLocationWithFriends = true
        shareLocationInGatherings = true
        allowLocationBasedNotifications = true
        visibilityRadius = 1000
        onlineStatusVisible = true
        profileVisibility = .friends
        
        userDefaults.set(true, forKey: "privacySettingsInitialized")
        saveAllSettings()
    }
    
    private func saveAllSettings() {
        userDefaults.set(locationSharingEnabled, forKey: "locationSharingEnabled")
        userDefaults.set(shareLocationWithFriends, forKey: "shareLocationWithFriends")
        userDefaults.set(shareLocationInGatherings, forKey: "shareLocationInGatherings")
        userDefaults.set(allowLocationBasedNotifications, forKey: "allowLocationBasedNotifications")
        userDefaults.set(visibilityRadius, forKey: "visibilityRadius")
        userDefaults.set(onlineStatusVisible, forKey: "onlineStatusVisible")
        userDefaults.set(profileVisibility.rawValue, forKey: "profileVisibility")
    }
    
    private func syncPrivacySettingsToServer() {
        Task {
            do {
                let settings: [String: Any] = [
                    "location_sharing_enabled": locationSharingEnabled,
                    "share_location_with_friends": shareLocationWithFriends,
                    "share_location_in_gatherings": shareLocationInGatherings,
                    "allow_location_notifications": allowLocationBasedNotifications,
                    "visibility_radius": visibilityRadius,
                    "online_status_visible": onlineStatusVisible,
                    "profile_visibility": profileVisibility.rawValue
                ]
                
                try await databaseService.updateUserProfile(userId: getCurrentUserId(), updates: settings)
            } catch {
                print("Failed to sync privacy settings: \(error)")
            }
        }
    }
    
    private func isFriend(userId: String) -> Bool {
        return true
    }
    
    private func getCurrentUserId() -> String {
        return "current_user_id"
    }
    
    var privacyControlsData: [(String, String, Bool)] {
        return [
            ("Location Sharing", "Share your location with others", locationSharingEnabled),
            ("Friends Location", "Share location with friends", shareLocationWithFriends),
            ("Gathering Location", "Share location in gatherings", shareLocationInGatherings),
            ("Location Notifications", "Receive location-based notifications", allowLocationBasedNotifications),
            ("Online Status", "Show when you're online", onlineStatusVisible)
        ]
    }
}
