import Foundation
import Combine

@MainActor
class MessagingViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var messages: [String: [Message]] = [:]
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let databaseService = DatabaseService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadConversations()
        setupRealTimeSubscriptions()
    }
    
    func loadConversations() {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.conversations = [
                Conversation(
                    id: "conv1",
                    participants: ["Alice Johnson", "You"],
                    lastMessage: "Hey, are you coming to the study group?",
                    lastMessageTime: Date().addingTimeInterval(-3600),
                    unreadCount: 2
                ),
                Conversation(
                    id: "conv2",
                    participants: ["Study Group", "You"],
                    lastMessage: "Meeting at the library at 3pm",
                    lastMessageTime: Date().addingTimeInterval(-7200),
                    unreadCount: 0
                ),
                Conversation(
                    id: "conv3",
                    participants: ["Bob Smith", "You"],
                    lastMessage: "Thanks for the notes!",
                    lastMessageTime: Date().addingTimeInterval(-86400),
                    unreadCount: 0
                )
            ]
            self.isLoading = false
        }
    }
    
    func loadMessages(for conversationId: String) {
        guard messages[conversationId] == nil else { return }
        
        isLoading = true
        
        Task {
            do {
                let loadedMessages = try await databaseService.getMessages(conversationId: conversationId)
                await MainActor.run {
                    self.messages[conversationId] = loadedMessages.isEmpty ? self.getMockMessages(for: conversationId) : loadedMessages
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.messages[conversationId] = self.getMockMessages(for: conversationId)
                    self.isLoading = false
                }
            }
        }
    }
    
    private func getMockMessages(for conversationId: String) -> [Message] {
        switch conversationId {
        case "conv1":
            return [
                Message(
                    id: "msg1",
                    text: "Hey, are you coming to the study group?",
                    senderId: "alice_id",
                    timestamp: Date().addingTimeInterval(-3600),
                    isFromCurrentUser: false
                ),
                Message(
                    id: "msg2",
                    text: "Yes, I'll be there at 3pm!",
                    senderId: getCurrentUserId(),
                    timestamp: Date().addingTimeInterval(-3500),
                    isFromCurrentUser: true
                ),
                Message(
                    id: "msg3",
                    text: "Great! See you there 📚",
                    senderId: "alice_id",
                    timestamp: Date().addingTimeInterval(-3400),
                    isFromCurrentUser: false
                )
            ]
        case "conv2":
            return [
                Message(
                    id: "msg4",
                    text: "Meeting at the library at 3pm",
                    senderId: "group_admin",
                    timestamp: Date().addingTimeInterval(-7200),
                    isFromCurrentUser: false
                ),
                Message(
                    id: "msg5",
                    text: "I'll be there!",
                    senderId: getCurrentUserId(),
                    timestamp: Date().addingTimeInterval(-7100),
                    isFromCurrentUser: true
                )
            ]
        default:
            return []
        }
    }
    
    func sendMessage(to conversationId: String, text: String) async {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let newMessage = Message(
            id: UUID().uuidString,
            text: text,
            senderId: getCurrentUserId(),
            timestamp: Date(),
            isFromCurrentUser: true
        )
        
        await MainActor.run {
            if self.messages[conversationId] != nil {
                self.messages[conversationId]?.append(newMessage)
            } else {
                self.messages[conversationId] = [newMessage]
            }
            
            if let index = self.conversations.firstIndex(where: { $0.id == conversationId }) {
                self.conversations[index] = Conversation(
                    id: conversationId,
                    participants: self.conversations[index].participants,
                    lastMessage: text,
                    lastMessageTime: Date(),
                    unreadCount: 0
                )
            }
        }
        
        do {
            try await databaseService.sendMessage(conversationId: conversationId, senderId: getCurrentUserId(), text: text)
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.messages[conversationId]?.removeAll { $0.id == newMessage.id }
            }
        }
    }
    
    func createConversation(with participants: [String]) async -> String? {
        isLoading = true
        
        do {
            let conversationId = try await databaseService.createConversation(participants: participants + [getCurrentUserId()])
            
            await MainActor.run {
                let newConversation = Conversation(
                    id: conversationId,
                    participants: participants + ["You"],
                    lastMessage: "",
                    lastMessageTime: Date(),
                    unreadCount: 0
                )
                self.conversations.insert(newConversation, at: 0)
                self.isLoading = false
            }
            
            return conversationId
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
            return nil
        }
    }
    
    func markConversationAsRead(_ conversationId: String) {
        if let index = conversations.firstIndex(where: { $0.id == conversationId }) {
            conversations[index] = Conversation(
                id: conversationId,
                participants: conversations[index].participants,
                lastMessage: conversations[index].lastMessage,
                lastMessageTime: conversations[index].lastMessageTime,
                unreadCount: 0
            )
        }
    }
    
    private func setupRealTimeSubscriptions() {
        Timer.publish(every: 30, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.loadConversations()
            }
            .store(in: &cancellables)
    }
    
    private func getCurrentUserId() -> String {
        return "current_user_id"
    }
    
    func clearError() {
        errorMessage = nil
    }
}
