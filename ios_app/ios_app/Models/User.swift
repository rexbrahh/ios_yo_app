import Foundation

struct AppUser: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String?
    let lastName: String?
    let university: String?
    let createdAt: Date
    let updatedAt: Date
    
    var fullName: String {
        guard let firstName = firstName, let lastName = lastName else {
            return email
        }
        return "\(firstName) \(lastName)"
    }
    
    var isUniversityVerified: Bool {
        return university != nil && email.contains("@") && !email.hasSuffix("@gmail.com") && !email.hasSuffix("@yahoo.com")
    }
}

struct AuthState {
    let isAuthenticated: Bool
    let user: AppUser?
    let session: String?
}
