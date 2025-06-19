import Foundation
import CoreLocation

struct MapAnnotation: Identifiable {
    let id: String
    let coordinate: CLLocationCoordinate2D
    let type: AnnotationType
    let title: String
    let subtitle: String
    
    enum AnnotationType {
        case friend
        case gathering
        case userLocation
    }
}
