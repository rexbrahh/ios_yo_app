import Foundation
import CoreLocation
import Combine

@MainActor
class GatheringViewModel: ObservableObject {
    @Published var gatherings: [Gathering] = []
    @Published var myGatherings: [Gathering] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let databaseService = DatabaseService()
    private let locationService = LocationService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadGatherings()
        loadMyGatherings()
        setupLocationBinding()
    }
    
    private func setupLocationBinding() {
        locationService.$currentLocation
            .compactMap { $0?.coordinate }
            .sink { [weak self] coordinate in
                self?.loadNearbyGatherings(near: coordinate)
            }
            .store(in: &cancellables)
    }
    
    func loadGatherings() {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.gatherings = [
                Gathering(
                    id: "1",
                    title: "Study Group - CS 101",
                    description: "Join us for a collaborative study session covering algorithms and data structures",
                    coordinate: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                    startTime: Date().addingTimeInterval(3600),
                    endTime: Date().addingTimeInterval(7200),
                    createdBy: "user1",
                    attendees: ["user1", "user2"],
                    maxAttendees: 8,
                    isPublic: true
                ),
                Gathering(
                    id: "2",
                    title: "Coffee & Networking",
                    description: "Casual meetup for university students to network and socialize",
                    coordinate: CLLocationCoordinate2D(latitude: 37.7759, longitude: -122.4184),
                    startTime: Date().addingTimeInterval(1800),
                    endTime: Date().addingTimeInterval(5400),
                    createdBy: "user3",
                    attendees: ["user3", "user4", "user5"],
                    maxAttendees: 12,
                    isPublic: true
                )
            ]
            self.isLoading = false
        }
    }
    
    func loadMyGatherings() {
        myGatherings = gatherings.filter { $0.createdBy == getCurrentUserId() || $0.attendees.contains(getCurrentUserId()) }
    }
    
    func loadNearbyGatherings(near coordinate: CLLocationCoordinate2D) {
        Task {
            do {
                let nearbyGatherings = try await databaseService.getGatherings(near: coordinate, radius: 5000)
                await MainActor.run {
                    self.gatherings = nearbyGatherings
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func createGathering(title: String, description: String, startTime: Date, endTime: Date, maxAttendees: Int?, isPublic: Bool) async {
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
                endTime: endTime,
                createdBy: getCurrentUserId(),
                attendees: [getCurrentUserId()],
                maxAttendees: maxAttendees,
                isPublic: isPublic
            )
            
            try await databaseService.createGathering(gathering: gathering, createdBy: getCurrentUserId())
            
            await MainActor.run {
                self.gatherings.append(gathering)
                self.myGatherings.append(gathering)
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func joinGathering(_ gathering: Gathering) async {
        guard !gathering.attendees.contains(getCurrentUserId()) else {
            errorMessage = "You are already attending this gathering"
            return
        }
        
        guard !gathering.isFull else {
            errorMessage = "This gathering is full"
            return
        }
        
        isLoading = true
        
        do {
            try await databaseService.joinGathering(gatheringId: gathering.id, userId: getCurrentUserId())
            
            await MainActor.run {
                if let index = self.gatherings.firstIndex(where: { $0.id == gathering.id }) {
                    var updatedGathering = self.gatherings[index]
                    updatedGathering = Gathering(
                        id: updatedGathering.id,
                        title: updatedGathering.title,
                        description: updatedGathering.description,
                        coordinate: updatedGathering.coordinate,
                        startTime: updatedGathering.startTime,
                        endTime: updatedGathering.endTime,
                        createdBy: updatedGathering.createdBy,
                        attendees: updatedGathering.attendees + [self.getCurrentUserId()],
                        maxAttendees: updatedGathering.maxAttendees,
                        isPublic: updatedGathering.isPublic
                    )
                    self.gatherings[index] = updatedGathering
                    self.myGatherings.append(updatedGathering)
                }
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func leaveGathering(_ gathering: Gathering) async {
        guard gathering.attendees.contains(getCurrentUserId()) else {
            errorMessage = "You are not attending this gathering"
            return
        }
        
        isLoading = true
        
        await MainActor.run {
            if let index = self.gatherings.firstIndex(where: { $0.id == gathering.id }) {
                var updatedGathering = self.gatherings[index]
                updatedGathering = Gathering(
                    id: updatedGathering.id,
                    title: updatedGathering.title,
                    description: updatedGathering.description,
                    coordinate: updatedGathering.coordinate,
                    startTime: updatedGathering.startTime,
                    endTime: updatedGathering.endTime,
                    createdBy: updatedGathering.createdBy,
                    attendees: updatedGathering.attendees.filter { $0 != self.getCurrentUserId() },
                    maxAttendees: updatedGathering.maxAttendees,
                    isPublic: updatedGathering.isPublic
                )
                self.gatherings[index] = updatedGathering
                self.myGatherings.removeAll { $0.id == gathering.id }
            }
            self.isLoading = false
        }
    }
    
    func deleteGathering(_ gathering: Gathering) async {
        guard gathering.createdBy == getCurrentUserId() else {
            errorMessage = "You can only delete gatherings you created"
            return
        }
        
        isLoading = true
        
        await MainActor.run {
            self.gatherings.removeAll { $0.id == gathering.id }
            self.myGatherings.removeAll { $0.id == gathering.id }
            self.isLoading = false
        }
    }
    
    private func getCurrentUserId() -> String {
        return "current_user_id"
    }
    
    func clearError() {
        errorMessage = nil
    }
}
