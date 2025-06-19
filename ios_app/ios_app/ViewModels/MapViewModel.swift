import Foundation
import MapKit
import Combine

@MainActor
class MapViewModel: ObservableObject {
    @Published var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
    )
    
    @Published var friends: [Friend] = []
    @Published var gatherings: [Gathering] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let databaseService = DatabaseService()
    private let locationService = LocationService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupLocationBinding()
        loadInitialData()
    }
    
    private func setupLocationBinding() {
        locationService.$currentLocation
            .compactMap { $0?.coordinate }
            .sink { [weak self] coordinate in
                self?.updateRegion(to: coordinate)
            }
            .store(in: &cancellables)
    }
    
    private func updateRegion(to coordinate: CLLocationCoordinate2D) {
        region = MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )
    }
    
    func requestLocationPermission() {
        locationService.requestLocationPermission()
    }
    
    func centerOnUserLocation() {
        guard let coordinate = locationService.getCurrentLocation() else {
            requestLocationPermission()
            return
        }
        updateRegion(to: coordinate)
    }
    
    func loadInitialData() {
        loadFriends()
        loadGatherings()
    }
    
    private func loadFriends() {
        friends = [
            Friend(
                id: "1",
                name: "Alice Johnson",
                email: "alice@university.edu",
                university: "State University",
                coordinate: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                isOnline: true
            ),
            Friend(
                id: "2",
                name: "Bob Smith",
                email: "bob@university.edu",
                university: "State University",
                coordinate: CLLocationCoordinate2D(latitude: 37.7759, longitude: -122.4184),
                isOnline: false
            )
        ]
    }
    
    private func loadGatherings() {
        gatherings = [
            Gathering(
                id: "1",
                title: "Study Group",
                description: "CS 101 Study Session",
                coordinate: CLLocationCoordinate2D(latitude: 37.7739, longitude: -122.4204),
                startTime: Date(),
                endTime: Date().addingTimeInterval(3600)
            ),
            Gathering(
                id: "2",
                title: "Coffee Meetup",
                description: "Casual coffee and networking",
                coordinate: CLLocationCoordinate2D(latitude: 37.7769, longitude: -122.4174),
                startTime: Date().addingTimeInterval(1800),
                endTime: Date().addingTimeInterval(5400)
            )
        ]
    }
    
    func createGathering(title: String, description: String, startTime: Date, endTime: Date) async {
        guard let currentLocation = locationService.getCurrentLocation() else {
            errorMessage = "Location permission required to create gatherings"
            return
        }
        
        isLoading = true
        
        do {
            let gathering = Gathering(
                id: UUID().uuidString,
                title: title,
                description: description,
                coordinate: currentLocation,
                startTime: startTime,
                endTime: endTime
            )
            
            try await databaseService.createGathering(gathering: gathering, createdBy: "current_user_id")
            gatherings.append(gathering)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func joinGathering(_ gathering: Gathering) async {
        isLoading = true
        
        do {
            try await databaseService.joinGathering(gatheringId: gathering.id, userId: "current_user_id")
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    var allAnnotations: [MapAnnotation] {
        var annotations: [MapAnnotation] = []
        
        for friend in friends {
            annotations.append(MapAnnotation(
                id: friend.id,
                coordinate: friend.coordinate,
                type: .friend,
                title: friend.name,
                subtitle: "Friend"
            ))
        }
        
        for gathering in gatherings {
            annotations.append(MapAnnotation(
                id: gathering.id,
                coordinate: gathering.coordinate,
                type: .gathering,
                title: gathering.title,
                subtitle: gathering.description
            ))
        }
        
        return annotations
    }
}
