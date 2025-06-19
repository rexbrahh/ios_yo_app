import Foundation
import Supabase

class SupabaseService: ObservableObject {
    static let shared = SupabaseService()
    
    private let client: SupabaseClient
    
    @Published var session: Session?
    @Published var isAuthenticated = false
    
    private init() {
        guard let url = URL(string: ProcessInfo.processInfo.environment["EXPO_PUBLIC_SUPABASE_URL"] ?? ""),
              let anonKey = ProcessInfo.processInfo.environment["EXPO_PUBLIC_SUPABASE_ANON_KEY"] else {
            fatalError("Missing Supabase configuration")
        }
        
        self.client = SupabaseClient(supabaseURL: url, supabaseKey: anonKey)
        
        Task {
            await setupAuthListener()
        }
    }
    
    @MainActor
    private func setupAuthListener() async {
        do {
            let session = try await client.auth.session
            self.session = session
            self.isAuthenticated = session != nil
            
            for await state in client.auth.authStateChanges {
                self.session = state.session
                self.isAuthenticated = state.session != nil
            }
        } catch {
            print("Auth setup error: \(error)")
        }
    }
    
    func signIn(email: String, password: String) async throws {
        let response = try await client.auth.signIn(email: email, password: password)
        await MainActor.run {
            self.session = response.session
            self.isAuthenticated = response.session != nil
        }
    }
    
    func signUp(email: String, password: String) async throws {
        let response = try await client.auth.signUp(email: email, password: password)
        await MainActor.run {
            self.session = response.session
            self.isAuthenticated = response.session != nil
        }
    }
    
    func signOut() async throws {
        try await client.auth.signOut()
        await MainActor.run {
            self.session = nil
            self.isAuthenticated = false
        }
    }
    
    func getCurrentUser() -> User? {
        return session?.user
    }
}
