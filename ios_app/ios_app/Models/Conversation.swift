import Foundation

struct Conversation: Identifiable, Codable {
    let id: String
    let participants: [String]
    let lastMessage: String
    let lastMessageTime: Date
    let unreadCount: Int
    
    init(id: String, participants: [String], lastMessage: String, lastMessageTime: Date, unreadCount: Int = 0) {
        self.id = id
        self.participants = participants
        self.lastMessage = lastMessage
        self.lastMessageTime = lastMessageTime
        self.unreadCount = unreadCount
    }
}

struct Message: Identifiable, Codable {
    let id: String
    let text: String
    let senderId: String
    let timestamp: Date
    let isFromCurrentUser: Bool
    
    init(id: String, text: String, senderId: String, timestamp: Date, isFromCurrentUser: Bool) {
        self.id = id
        self.text = text
        self.senderId = senderId
        self.timestamp = timestamp
        self.isFromCurrentUser = isFromCurrentUser
    }
}
