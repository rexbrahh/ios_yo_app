import SwiftUI

struct SignupView: View {
    @StateObject private var authViewModel = AuthViewModel()
    @Environment(\.dismiss) private var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    VStack(spacing: 16) {
                        Image(systemName: "graduationcap.circle.fill")
                            .font(.system(size: 60, weight: .light))
                            .foregroundStyle(.blue)
                            .symbolRenderingMode(.hierarchical)
                        
                        VStack(spacing: 8) {
                            Text("Create Account")
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            Text("Join your university community")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                    }
                    .padding(.top, 20)
                    
                    VStack(spacing: 24) {
                        VStack(spacing: 16) {
                            HStack(spacing: 12) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("First Name")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundColor(.secondary)
                                    
                                    TextField("First", text: $firstName)
                                        .textFieldStyle(.roundedBorder)
                                        .textContentType(.givenName)
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Last Name")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundColor(.secondary)
                                    
                                    TextField("Last", text: $lastName)
                                        .textFieldStyle(.roundedBorder)
                                        .textContentType(.familyName)
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("University Email")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(.secondary)
                                
                                TextField("your.email@university.edu", text: $email)
                                    .textFieldStyle(.roundedBorder)
                                    .keyboardType(.emailAddress)
                                    .textContentType(.emailAddress)
                                    .autocapitalization(.none)
                                    .disableAutocorrection(true)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Password")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(.secondary)
                                
                                SecureField("Create a password", text: $password)
                                    .textFieldStyle(.roundedBorder)
                                    .textContentType(.newPassword)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Confirm Password")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(.secondary)
                                
                                SecureField("Confirm your password", text: $confirmPassword)
                                    .textFieldStyle(.roundedBorder)
                                    .textContentType(.newPassword)
                            }
                        }
                        
                        VStack(spacing: 8) {
                            if !email.isEmpty {
                                ValidationMessageView(
                                    isValid: isUniversityEmail,
                                    validMessage: "Valid university email",
                                    invalidMessage: "Please use your university email (.edu)"
                                )
                            }
                            
                            if !confirmPassword.isEmpty {
                                ValidationMessageView(
                                    isValid: passwordsMatch,
                                    validMessage: "Passwords match",
                                    invalidMessage: "Passwords don't match"
                                )
                            }
                            
                            if !password.isEmpty && password.count < 6 {
                                ValidationMessageView(
                                    isValid: false,
                                    validMessage: "",
                                    invalidMessage: "Password must be at least 6 characters"
                                )
                            }
                        }
                        
                        if let errorMessage = authViewModel.errorMessage {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                Text(errorMessage)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                Spacer()
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                        }
                        
                        Button(action: {
                            Task {
                                await authViewModel.signUp(
                                    email: email,
                                    password: password,
                                    firstName: firstName,
                                    lastName: lastName
                                )
                            }
                        }) {
                            HStack {
                                if authViewModel.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.9)
                                } else {
                                    Text("Create Account")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(isFormValid ? Color.accentColor : Color.gray.opacity(0.3))
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(!isFormValid || authViewModel.isLoading)
                        
                        VStack(spacing: 12) {
                            Text("By creating an account, you agree to our")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 8) {
                                Button("Terms of Service") {
                                }
                                .font(.caption)
                                .foregroundColor(.accentColor)
                                
                                Text("and")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Button("Privacy Policy") {
                                }
                                .font(.caption)
                                .foregroundColor(.accentColor)
                            }
                        }
                        .padding(.top, 16)
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .onTapGesture {
            hideKeyboard()
        }
    }
    
    private var isUniversityEmail: Bool {
        email.contains("@") && 
        !email.hasSuffix("@gmail.com") && 
        !email.hasSuffix("@yahoo.com") && 
        !email.hasSuffix("@hotmail.com") &&
        !email.hasSuffix("@outlook.com") &&
        email.contains(".edu")
    }
    
    private var passwordsMatch: Bool {
        password == confirmPassword && !password.isEmpty
    }
    
    private var isFormValid: Bool {
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        isUniversityEmail &&
        passwordsMatch &&
        password.count >= 6
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

struct ValidationMessageView: View {
    let isValid: Bool
    let validMessage: String
    let invalidMessage: String
    
    var body: some View {
        HStack {
            Image(systemName: isValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundColor(isValid ? .green : .red)
                .font(.caption)
            
            Text(isValid ? validMessage : invalidMessage)
                .font(.caption)
                .foregroundColor(isValid ? .green : .red)
            
            Spacer()
        }
    }
}

#Preview {
    SignupView()
}
