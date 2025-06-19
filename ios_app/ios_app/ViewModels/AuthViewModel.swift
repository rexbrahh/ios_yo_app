import Foundation
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: AppUser?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let supabaseService = SupabaseService.shared
    
    init() {
        setupBindings()
    }
    
    private func setupBindings() {
        supabaseService.$isAuthenticated
            .assign(to: &$isAuthenticated)
        
        supabaseService.$session
            .map { session in
                guard let user = session?.user else { return nil }
                return AppUser(
                    id: user.id.uuidString,
                    email: user.email ?? "",
                    firstName: user.userMetadata["first_name"] as? String,
                    lastName: user.userMetadata["last_name"] as? String,
                    university: user.userMetadata["university"] as? String,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt ?? user.createdAt
                )
            }
            .assign(to: &$currentUser)
    }
    
    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await supabaseService.signIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signUp(email: String, password: String, firstName: String, lastName: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await supabaseService.signUp(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signOut() async {
        isLoading = true
        
        do {
            try await supabaseService.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    var isUniversityEmail: Bool {
        guard let email = currentUser?.email else { return false }
        return email.contains("@") && 
               !email.hasSuffix("@gmail.com") && 
               !email.hasSuffix("@yahoo.com") && 
               !email.hasSuffix("@hotmail.com") &&
               !email.hasSuffix("@outlook.com")
    }
}
