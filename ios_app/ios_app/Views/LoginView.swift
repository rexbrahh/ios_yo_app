import SwiftUI

struct LoginView: View {
    @StateObject private var authViewModel = AuthViewModel()
    @State private var email = ""
    @State private var password = ""
    @State private var showingSignup = false
    
    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 0) {
                        VStack(spacing: 24) {
                            Spacer(minLength: geometry.size.height * 0.1)
                            
                            Image(systemName: "graduationcap.circle.fill")
                                .font(.system(size: 80, weight: .light))
                                .foregroundStyle(.blue)
                                .symbolRenderingMode(.hierarchical)
                            
                            VStack(spacing: 8) {
                                Text("UniConnect")
                                    .font(.largeTitle)
                                    .fontWeight(.bold)
                                    .foregroundColor(.primary)
                                
                                Text("Connect with your university community")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 32)
                            }
                        }
                        .padding(.bottom, 48)
                        
                        VStack(spacing: 24) {
                            VStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Email")
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
                                    
                                    SecureField("Enter your password", text: $password)
                                        .textFieldStyle(.roundedBorder)
                                        .textContentType(.password)
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
                                    await authViewModel.signIn(email: email, password: password)
                                }
                            }) {
                                HStack {
                                    if authViewModel.isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .scaleEffect(0.9)
                                    } else {
                                        Text("Sign In")
                                            .fontWeight(.semibold)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(isSignInEnabled ? Color.accentColor : Color.gray.opacity(0.3))
                                .foregroundColor(.white)
                                .cornerRadius(10)
                            }
                            .disabled(!isSignInEnabled || authViewModel.isLoading)
                            
                            HStack {
                                Rectangle()
                                    .frame(height: 1)
                                    .foregroundColor(.gray.opacity(0.3))
                                
                                Text("or")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .padding(.horizontal, 16)
                                
                                Rectangle()
                                    .frame(height: 1)
                                    .foregroundColor(.gray.opacity(0.3))
                            }
                            
                            Button(action: {
                                showingSignup = true
                            }) {
                                Text("Create Account")
                                    .fontWeight(.medium)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                                    .background(Color.clear)
                                    .foregroundColor(.accentColor)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(Color.accentColor, lineWidth: 1)
                                    )
                            }
                        }
                        .padding(.horizontal, 32)
                        
                        Spacer(minLength: 32)
                        
                        VStack(spacing: 12) {
                            Text("By continuing, you agree to our")
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
                        .padding(.bottom, 32)
                    }
                }
                .frame(minHeight: geometry.size.height)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showingSignup) {
            SignupView()
        }
        .onTapGesture {
            hideKeyboard()
        }
    }
    
    private var isSignInEnabled: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

#Preview {
    LoginView()
}
