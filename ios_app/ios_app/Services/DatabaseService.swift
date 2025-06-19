import Foundation
import Supabase

class DatabaseService: ObservableObject {
    private let client: SupabaseClient
    
    init() {
        guard let url = URL(string: ProcessInfo.processInfo.environment["EXPO_PUBLIC_SUPABASE_URL"] ?? ""),
              let anonKey = ProcessInfo.processInfo.environment["EXPO_PUBLIC_SUPABASE_ANON_KEY"] else {
            fatalError("Missing Supabase configuration")
        }
        
        self.client = SupabaseClient(supabaseURL: url, supabaseKey: anonKey)
    }
    
    func createUserProfile(userId: String, email: String, firstName: String, lastName: String, university: String?) async throws {
        let profile: [String: Any] = [
            "id": userId,
            "email": email,
            "first_name": firstName,
            "last_name": lastName,
            "university": university ?? NSNull(),
            "created_at": ISO8601DateFormatter().string(from: Date()),
            "updated_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("profiles")
            .insert(profile)
            .execute()
    }
    
    func getUserProfile(userId: String) async throws -> AppUser? {
        let response = try await client.database
            .from("profiles")
            .select("*")
            .eq("id", value: userId)
            .single()
            .execute()
        
        return nil
    }
    
    func updateUserProfile(userId: String, updates: [String: Any]) async throws {
        var updatedData = updates
        updatedData["updated_at"] = ISO8601DateFormatter().string(from: Date())
        
        try await client.database
            .from("profiles")
            .update(updatedData)
            .eq("id", value: userId)
            .execute()
    }
    
    func sendFriendRequest(fromUserId: String, toUserId: String) async throws {
        let friendRequest: [String: Any] = [
            "requester_id": fromUserId,
            "addressee_id": toUserId,
            "status": "pending",
            "created_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("friend_requests")
            .insert(friendRequest)
            .execute()
    }
    
    func acceptFriendRequest(requestId: String) async throws {
        try await client.database
            .from("friend_requests")
            .update(["status": "accepted", "updated_at": ISO8601DateFormatter().string(from: Date())])
            .eq("id", value: requestId)
            .execute()
    }
    
    func getFriends(userId: String) async throws -> [Friend] {
        return []
    }
    
    func createGathering(gathering: Gathering, createdBy: String) async throws {
        let gatheringData: [String: Any] = [
            "id": gathering.id,
            "title": gathering.title,
            "description": gathering.description,
            "latitude": gathering.coordinate.latitude,
            "longitude": gathering.coordinate.longitude,
            "start_time": ISO8601DateFormatter().string(from: gathering.startTime),
            "end_time": ISO8601DateFormatter().string(from: gathering.endTime),
            "created_by": createdBy,
            "max_attendees": gathering.maxAttendees ?? NSNull(),
            "is_public": gathering.isPublic,
            "created_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("gatherings")
            .insert(gatheringData)
            .execute()
    }
    
    func getGatherings(near coordinate: CLLocationCoordinate2D, radius: Double = 5000) async throws -> [Gathering] {
        return []
    }
    
    func joinGathering(gatheringId: String, userId: String) async throws {
        let attendance: [String: Any] = [
            "gathering_id": gatheringId,
            "user_id": userId,
            "joined_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("gathering_attendees")
            .insert(attendance)
            .execute()
    }
    
    func sendMessage(conversationId: String, senderId: String, text: String) async throws {
        let message: [String: Any] = [
            "conversation_id": conversationId,
            "sender_id": senderId,
            "text": text,
            "created_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("messages")
            .insert(message)
            .execute()
    }
    
    func getMessages(conversationId: String) async throws -> [Message] {
        return []
    }
    
    func createConversation(participants: [String]) async throws -> String {
        let conversation: [String: Any] = [
            "id": UUID().uuidString,
            "participants": participants,
            "created_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        try await client.database
            .from("conversations")
            .insert(conversation)
            .execute()
        
        return conversation["id"] as! String
    }
    
    func subscribeToMessages(conversationId: String, onMessage: @escaping (Message) -> Void) {
    }
    
    func subscribeToGatherings(onGatheringUpdate: @escaping (Gathering) -> Void) {
    }
}
