import PackageDescription

let package = Package(
    name: "ios_app",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "ios_app",
            targets: ["ios_app"]),
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0")
    ],
    targets: [
        .target(
            name: "ios_app",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift")
            ]),
        .testTarget(
            name: "ios_appTests",
            dependencies: ["ios_app"]),
    ]
)
