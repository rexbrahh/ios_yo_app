import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        TabView {
            MapView()
                .tabItem {
                    Image(systemName: "map")
                    Text("Map")
                }
            
            ChatView()
                .tabItem {
                    Image(systemName: "message")
                    Text("Messages")
                }
            
            FriendsView()
                .tabItem {
                    Image(systemName: "person.2")
                    Text("Friends")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle")
                    Text("Profile")
                }
        }
        .accentColor(.blue)
    }
}

struct FriendsView: View {
    @State private var friends: [Friend] = []
    @State private var showingAddFriend = false
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack {
                if friends.isEmpty {
                    EmptyFriendsView()
                } else {
                    List(filteredFriends) { friend in
                        FriendRowView(friend: friend)
                    }
                    .searchable(text: $searchText, prompt: "Search friends...")
                }
            }
            .navigationTitle("Friends")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingAddFriend = true
                    }) {
                        Image(systemName: "person.badge.plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddFriend) {
                AddFriendView()
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
                coordinate: .init(latitude: 37.7749, longitude: -122.4194),
                isOnline: true
            ),
            Friend(
                id: "2",
                name: "Bob Smith",
                email: "bob@university.edu",
                university: "State University",
                coordinate: .init(latitude: 37.7759, longitude: -122.4184),
                isOnline: false
            ),
            Friend(
                id: "3",
                name: "Carol Davis",
                email: "carol@university.edu",
                university: "State University",
                coordinate: .init(latitude: 37.7739, longitude: -122.4204),
                isOnline: true
            )
        ]
    }
}

struct FriendRowView: View {
    let friend: Friend
    
    var body: some View {
        HStack {
            ZStack(alignment: .bottomTrailing) {
                Circle()
                    .fill(Color.blue.opacity(0.3))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Text(friend.name.prefix(1))
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                    )
                
                if friend.isOnline {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 16, height: 16)
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 2)
                        )
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(friend.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if let university = friend.university {
                    Text(university)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Text(friend.isOnline ? "Online" : "Last seen \(friend.lastSeen, style: .relative)")
                    .font(.caption)
                    .foregroundColor(friend.isOnline ? .green : .secondary)
            }
            
            Spacer()
            
            Button(action: {
            }) {
                Image(systemName: "message.circle")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}

struct EmptyFriendsView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.2.circle")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Friends Yet")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Connect with other university students to start building your network")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button("Find Friends") {
            }
            .buttonStyle(.borderedProminent)
        }
    }
}

struct AddFriendView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var searchResults: [Friend] = []
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText)
                    .onChange(of: searchText) { newValue in
                        searchForFriends(query: newValue)
                    }
                
                if searchResults.isEmpty && !searchText.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                        
                        Text("No users found")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        
                        Text("Try searching with a different name or email")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 50)
                } else {
                    List(searchResults) { friend in
                        HStack {
                            Circle()
                                .fill(Color.purple.opacity(0.3))
                                .frame(width: 40, height: 40)
                                .overlay(
                                    Text(friend.name.prefix(1))
                                        .font(.headline)
                                        .foregroundColor(.purple)
                                )
                            
                            VStack(alignment: .leading) {
                                Text(friend.name)
                                    .font(.headline)
                                
                                if let university = friend.university {
                                    Text(university)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                            
                            Button("Add") {
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                Spacer()
            }
            .navigationTitle("Add Friends")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func searchForFriends(query: String) {
        if !query.isEmpty {
            searchResults = [
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
        } else {
            searchResults = []
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
