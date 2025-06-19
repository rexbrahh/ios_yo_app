import Foundation
import CoreLocation

struct Friend: Identifiable, Codable {
    let id: String
    let name: String
    let email: String?
    let university: String?
    let coordinate: CLLocationCoordinate2D
    let isOnline: Bool
    let lastSeen: Date
    
    init(id: String, name: String, email: String? = nil, university: String? = nil, coordinate: CLLocationCoordinate2D, isOnline: Bool = false, lastSeen: Date = Date()) {
        self.id = id
        self.name = name
        self.email = email
        self.university = university
        self.coordinate = coordinate
        self.isOnline = isOnline
        self.lastSeen = lastSeen
    }
}

extension CLLocationCoordinate2D: Codable {
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(latitude, forKey: .latitude)
        try container.encode(longitude, forKey: .longitude)
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let latitude = try container.decode(Double.self, forKey: .latitude)
        let longitude = try container.decode(Double.self, forKey: .longitude)
        self.init(latitude: latitude, longitude: longitude)
    }
    
    private enum CodingKeys: String, CodingKey {
        case latitude, longitude
    }
}
