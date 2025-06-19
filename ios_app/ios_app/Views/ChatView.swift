import SwiftUI

struct ChatView: View {
    @State private var conversations: [Conversation] = []
    @State private var showingNewChat = false
    
    var body: some View {
        NavigationView {
            VStack {
                if conversations.isEmpty {
                    EmptyStateView()
                } else {
                    List(conversations) { conversation in
                        NavigationLink(destination: ChatDetailView(conversation: conversation)) {
                            ConversationRowView(conversation: conversation)
                        }
                    }
                }
            }
            .navigationTitle("Messages")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingNewChat = true
                    }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $showingNewChat) {
                NewChatView()
            }
            .onAppear {
                loadConversations()
            }
        }
    }
    
    private func loadConversations() {
        conversations = [
            Conversation(
                id: "1",
                participants: ["Alice Johnson", "You"],
                lastMessage: "Hey, are you coming to the study group?",
                lastMessageTime: Date().addingTimeInterval(-3600),
                unreadCount: 2
            ),
            Conversation(
                id: "2",
                participants: ["Study Group", "You"],
                lastMessage: "Meeting at the library at 3pm",
                lastMessageTime: Date().addingTimeInterval(-7200),
                unreadCount: 0
            )
        ]
    }
}

struct ConversationRowView: View {
    let conversation: Conversation
    
    var body: some View {
        HStack {
            Circle()
                .fill(Color.blue.opacity(0.3))
                .frame(width: 50, height: 50)
                .overlay(
                    Text(conversation.participants.first?.prefix(1) ?? "?")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.blue)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.participants.first ?? "Unknown")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Text(conversation.lastMessageTime, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text(conversation.lastMessage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    if conversation.unreadCount > 0 {
                        Text("\(conversation.unreadCount)")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(minWidth: 20, minHeight: 20)
                            .background(Color.blue)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "message.circle")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Messages Yet")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Start a conversation with your university friends")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
}

struct NewChatView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var friends: [Friend] = []
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText)
                
                List(filteredFriends) { friend in
                    Button(action: {
                        dismiss()
                    }) {
                        HStack {
                            Circle()
                                .fill(Color.green.opacity(0.3))
                                .frame(width: 40, height: 40)
                                .overlay(
                                    Text(friend.name.prefix(1))
                                        .font(.headline)
                                        .foregroundColor(.green)
                                )
                            
                            VStack(alignment: .leading) {
                                Text(friend.name)
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                if let university = friend.university {
                                    Text(university)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                loadFriends()
            }
        }
    }
    
    private var filteredFriends: [Friend] {
        if searchText.isEmpty {
            return friends
        } else {
            return friends.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    private func loadFriends() {
        friends = [
            Friend(
                id: "1",
                name: "Alice Johnson",
                email: "alice@university.edu",
                university: "State University",
                coordinate: .init(latitude: 0, longitude: 0)
            ),
            Friend(
                id: "2",
                name: "Bob Smith",
                email: "bob@university.edu",
                university: "State University",
                coordinate: .init(latitude: 0, longitude: 0)
            )
        ]
    }
}

struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search friends...", text: $text)
                .textFieldStyle(PlainTextFieldStyle())
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
}

struct ChatDetailView: View {
    let conversation: Conversation
    @State private var messageText = ""
    @State private var messages: [Message] = []
    
    var body: some View {
        VStack {
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(messages) { message in
                        MessageBubbleView(message: message)
                    }
                }
                .padding()
            }
            
            HStack {
                TextField("Type a message...", text: $messageText, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(1...4)
                
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
                .disabled(messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding()
        }
        .navigationTitle(conversation.participants.first ?? "Chat")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            loadMessages()
        }
    }
    
    private func sendMessage() {
        let newMessage = Message(
            id: UUID().uuidString,
            text: messageText,
            senderId: "current_user",
            timestamp: Date(),
            isFromCurrentUser: true
        )
        
        messages.append(newMessage)
        messageText = ""
    }
    
    private func loadMessages() {
        messages = [
            Message(
                id: "1",
                text: "Hey, are you coming to the study group?",
                senderId: "other_user",
                timestamp: Date().addingTimeInterval(-3600),
                isFromCurrentUser: false
            ),
            Message(
                id: "2",
                text: "Yes, I'll be there at 3pm!",
                senderId: "current_user",
                timestamp: Date().addingTimeInterval(-3500),
                isFromCurrentUser: true
            )
        ]
    }
}

struct MessageBubbleView: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.isFromCurrentUser {
                Spacer()
            }
            
            VStack(alignment: message.isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                Text(message.text)
                    .padding(12)
                    .background(message.isFromCurrentUser ? Color.blue : Color(.systemGray5))
                    .foregroundColor(message.isFromCurrentUser ? .white : .primary)
                    .cornerRadius(16)
                
                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            if !message.isFromCurrentUser {
                Spacer()
            }
        }
    }
}

#Preview {
    ChatView()
}
