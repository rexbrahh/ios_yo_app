import Foundation
import CoreLocation

struct Gathering: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let coordinate: CLLocationCoordinate2D
    let startTime: Date
    let endTime: Date
    let createdBy: String
    let attendees: [String]
    let maxAttendees: Int?
    let isPublic: Bool
    
    init(id: String, title: String, description: String, coordinate: CLLocationCoordinate2D, startTime: Date, endTime: Date, createdBy: String = "", attendees: [String] = [], maxAttendees: Int? = nil, isPublic: Bool = true) {
        self.id = id
        self.title = title
        self.description = description
        self.coordinate = coordinate
        self.startTime = startTime
        self.endTime = endTime
        self.createdBy = createdBy
        self.attendees = attendees
        self.maxAttendees = maxAttendees
        self.isPublic = isPublic
    }
    
    var isActive: Bool {
        let now = Date()
        return now >= startTime && now <= endTime
    }
    
    var isUpcoming: Bool {
        return startTime > Date()
    }
    
    var attendeeCount: Int {
        return attendees.count
    }
    
    var isFull: Bool {
        guard let maxAttendees = maxAttendees else { return false }
        return attendeeCount >= maxAttendees
    }
}
