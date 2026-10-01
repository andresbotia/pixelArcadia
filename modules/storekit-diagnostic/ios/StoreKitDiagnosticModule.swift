import ExpoModulesCore
import StoreKit

/// Read-only Apple catalog lookup. Never uses RevenueCat or starts a purchase.
public class StoreKitDiagnosticModule: Module {
  private let productIDs: Set<String> = [
    "pixel_arcadia_coins_500",
    "pixel_arcadia_coins_1500",
    "pixel_arcadia_coins_3500",
    "pixel_arcadia_coins_8000",
    "pixel_arcadia_starter_pack",
    "pixel_arcadia_booster_pack",
    "pixel_arcadia_remove_ads",
  ]

  public func definition() -> ModuleDefinition {
    Name("StoreKitDiagnostic")

    AsyncFunction("lookupProducts") { () async throws -> [String: Any] in
      let products = try await Product.products(for: self.productIDs)
      #if DEBUG
      let build = "Debug"
      #else
      let build = "Release (TestFlight or App Store)"
      #endif
      return [
        "bundleId": Bundle.main.bundleIdentifier ?? "unknown",
        "build": build,
        "products": products.map { product in
          [
            "id": product.id,
            "displayName": product.displayName,
            "displayPrice": product.displayPrice,
            "type": String(describing: product.type),
          ]
        },
      ]
    }
  }
}
