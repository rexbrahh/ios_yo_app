import Foundation
import Combine

@MainActor
class FriendsViewModel: ObservableObject {
    @Published var friends: [Friend] = []
    @Published var friendRequests: [FriendRequest] = []
    @Published var searchResults: [Friend] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let databaseService = DatabaseService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadFriends()
        loadFriendRequests()
    }
    
    func loadFriends() {
        isLoading = true
        
        Task {
            do {
                let loadedFriends = try await databaseService.getFriends(userId: getCurrentUserId())
                await MainActor.run {
                    self.friends = loadedFriends
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
    
    func loadFriendRequests() {
        friendRequests = [
            FriendRequest(
                id: "1",
                requesterId: "user1",
                addresseeId: getCurrentUserId(),
                requesterName: "Alice Johnson",
                requesterEmail: "alice@university.edu",
                status: .pending,
                createdAt: Date().addingTimeInterval(-3600)
            )
        ]
    }
    
    func searchUsers(query: String) {
        guard !query.isEmpty else {
            searchResults = []
            return
        }
        
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.searchResults = [
                Friend(
                    id: "search1",
                    name: "David Wilson",
                    email: "david@university.edu",
                    university: "State University",
                    coordinate: .init(latitude: 0, longitude: 0)
                ),
                Friend(
                    id: "search2",
                    name: "Emma Brown",
                    email: "emma@university.edu",
                    university: "State University",
                    coordinate: .init(latitude: 0, longitude: 0)
                )
            ].filter { $0.name.localizedCaseInsensitiveContains(query) }
            
            self.isLoading = false
        }
    }
    
    func sendFriendRequest(to userId: String) async {
        isLoading = true
        
        do {
            try await databaseService.sendFriendRequest(fromUserId: getCurrentUserId(), toUserId: userId)
            await MainActor.run {
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func acceptFriendRequest(_ request: FriendRequest) async {
        isLoading = true
        
        do {
            try await databaseService.acceptFriendRequest(requestId: request.id)
            await MainActor.run {
                self.friendRequests.removeAll { $0.id == request.id }
                
                let newFriend = Friend(
                    id: request.requesterId,
                    name: request.requesterName,
                    email: request.requesterEmail,
                    coordinate: .init(latitude: 0, longitude: 0)
                )
                self.friends.append(newFriend)
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func rejectFriendRequest(_ request: FriendRequest) async {
        await MainActor.run {
            self.friendRequests.removeAll { $0.id == request.id }
        }
    }
    
    func removeFriend(_ friend: Friend) async {
        await MainActor.run {
            self.friends.removeAll { $0.id == friend.id }
        }
    }
    
    private func getCurrentUserId() -> String {
        return "current_user_id"
    }
    
    func clearError() {
        errorMessage = nil
    }
}

struct FriendRequest: Identifiable, Codable {
    let id: String
    let requesterId: String
    let addresseeId: String
    let requesterName: String
    let requesterEmail: String
    let status: FriendRequestStatus
    let createdAt: Date
    
    enum FriendRequestStatus: String, Codable, CaseIterable {
        case pending = "pending"
        case accepted = "accepted"
        case rejected = "rejected"
    }
}
