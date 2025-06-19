import SwiftUI
import MapKit

struct MapView: View {
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
    )
    
    @State private var friends: [Friend] = []
    @State private var gatherings: [Gathering] = []
    @State private var showingCreateGathering = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Map(coordinateRegion: $region, annotationItems: allAnnotations) { annotation in
                    MapAnnotation(coordinate: annotation.coordinate) {
                        AnnotationView(annotation: annotation)
                    }
                }
                .ignoresSafeArea()
                
                VStack {
                    Spacer()
                    
                    HStack {
                        Button(action: {
                        }) {
                            Image(systemName: "person.2.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 50, height: 50)
                                .background(Color.blue)
                                .clipShape(Circle())
                                .shadow(radius: 5)
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            showingCreateGathering = true
                        }) {
                            Image(systemName: "plus")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 60, height: 60)
                                .background(Color.green)
                                .clipShape(Circle())
                                .shadow(radius: 5)
                        }
                        
                        Spacer()
                        
                        Button(action: {
                        }) {
                            Image(systemName: "location.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 50, height: 50)
                                .background(Color.purple)
                                .clipShape(Circle())
                                .shadow(radius: 5)
                        }
                    }
                    .padding(.horizontal, 30)
                    .padding(.bottom, 100)
                }
            }
            .navigationTitle("Campus Map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                    }) {
                        Image(systemName: "person.circle")
                            .font(.title2)
                    }
                }
            }
        }
        .sheet(isPresented: $showingCreateGathering) {
            CreateGatheringView()
        }
        .onAppear {
            loadMockData()
        }
    }
    
    private var allAnnotations: [MapAnnotation] {
        var annotations: [MapAnnotation] = []
        
        for friend in friends {
            annotations.append(MapAnnotation(
                id: friend.id,
                coordinate: friend.coordinate,
                type: .friend,
                title: friend.name,
                subtitle: "Friend"
            ))
        }
        
        for gathering in gatherings {
            annotations.append(MapAnnotation(
                id: gathering.id,
                coordinate: gathering.coordinate,
                type: .gathering,
                title: gathering.title,
                subtitle: gathering.description
            ))
        }
        
        return annotations
    }
    
    private func loadMockData() {
        friends = [
            Friend(
                id: "1",
                name: "Alice Johnson",
                coordinate: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194)
            ),
            Friend(
                id: "2",
                name: "Bob Smith",
                coordinate: CLLocationCoordinate2D(latitude: 37.7759, longitude: -122.4184)
            )
        ]
        
        gatherings = [
            Gathering(
                id: "1",
                title: "Study Group",
                description: "CS 101 Study Session",
                coordinate: CLLocationCoordinate2D(latitude: 37.7739, longitude: -122.4204),
                startTime: Date(),
                endTime: Date().addingTimeInterval(3600)
            )
        ]
    }
}

struct AnnotationView: View {
    let annotation: MapAnnotation
    
    var body: some View {
        VStack {
            Image(systemName: annotation.type == .friend ? "person.fill" : "star.fill")
                .font(.title2)
                .foregroundColor(.white)
                .frame(width: 30, height: 30)
                .background(annotation.type == .friend ? Color.blue : Color.orange)
                .clipShape(Circle())
                .shadow(radius: 3)
            
            Text(annotation.title)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.9))
                .cornerRadius(8)
                .shadow(radius: 2)
        }
    }
}

struct CreateGatheringView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var description = ""
    @State private var selectedDate = Date()
    
    var body: some View {
        NavigationView {
            Form {
                Section("Gathering Details") {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("When") {
                    DatePicker("Start Time", selection: $selectedDate, displayedComponents: [.date, .hourAndMinute])
                }
                
                Section {
                    Button("Create Gathering") {
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
            }
            .navigationTitle("New Gathering")
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
}

#Preview {
    MapView()
}
