import ExpoModulesCore
import GameKit

/**
 Pixel Arcadia's Game Center bridge — the minimal GameKit surface the app uses:
 authentication (with the system sign-in sheet when GameKit asks for it), a
 classic leaderboard score, 100% achievements, and the native dashboard.

 Game Center is additive: every call here fails soft (a rejected promise or
 an `error` / `signedOut` auth state) and never blocks the game.
 */
public class GameCenterModule: Module {
  private var authStarted = false
  private var lastError: String?
  private let dashboardDelegate = DashboardDelegate()

  public func definition() -> ModuleDefinition {
    Name("GameCenter")

    Events("onAuthChange")

    /// Current auth snapshot (see `snapshot()`).
    Function("getAuthState") { () -> [String: Any] in
      return self.snapshot()
    }

    /// Installs GameKit's authenticate handler once. GameKit calls it again
    /// on later auth changes (e.g. the player signs in from Settings), and
    /// each call is forwarded to JS as `onAuthChange`.
    Function("authenticate") {
      if self.authStarted {
        self.emitAuthChange()
        return
      }
      self.authStarted = true
      self.sendEvent("onAuthChange", self.snapshot(status: "authenticating"))
      GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
        guard let self = self else { return }
        if let viewController = viewController {
          // GameKit wants to show its own sign-in sheet.
          DispatchQueue.main.async {
            self.present(viewController)
          }
          self.sendEvent("onAuthChange", self.snapshot(status: "authenticating"))
          return
        }
        self.lastError = error?.localizedDescription
        self.emitAuthChange(error: error)
      }
    }

    /// Classic leaderboard: GameKit keeps the best score per player.
    AsyncFunction("submitScore") { (score: Int, leaderboardIds: [String], promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("E_NOT_AUTHENTICATED", "Game Center player is not authenticated")
        return
      }
      GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: leaderboardIds) { error in
        if let error = error {
          promise.reject("E_SUBMIT_SCORE", error.localizedDescription)
        } else {
          promise.resolve(nil)
        }
      }
    }

    /// Reports each id as 100% complete. Re-reporting a completed
    /// achievement is a no-op on Game Center's side.
    AsyncFunction("reportAchievements") { (ids: [String], promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("E_NOT_AUTHENTICATED", "Game Center player is not authenticated")
        return
      }
      let achievements = ids.map { id -> GKAchievement in
        let achievement = GKAchievement(identifier: id)
        achievement.percentComplete = 100
        achievement.showsCompletionBanner = true
        return achievement
      }
      GKAchievement.report(achievements) { error in
        if let error = error {
          promise.reject("E_REPORT_ACHIEVEMENTS", error.localizedDescription)
        } else {
          promise.resolve(nil)
        }
      }
    }

    /// Native Game Center UI. `target`: "leaderboard" (needs `leaderboardId`),
    /// "achievements", or anything else for the default dashboard.
    AsyncFunction("showDashboard") { (target: String, leaderboardId: String?, promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("E_NOT_AUTHENTICATED", "Game Center player is not authenticated")
        return
      }
      let controller: GKGameCenterViewController
      if target == "leaderboard", let leaderboardId = leaderboardId {
        controller = GKGameCenterViewController(leaderboardID: leaderboardId, playerScope: .global, timeScope: .allTime)
      } else if target == "achievements" {
        controller = GKGameCenterViewController(state: .achievements)
      } else {
        controller = GKGameCenterViewController(state: .default)
      }
      controller.gameCenterDelegate = self.dashboardDelegate
      guard self.present(controller) else {
        promise.reject("E_NO_PRESENTER", "No view controller to present Game Center from")
        return
      }
      promise.resolve(nil)
    }.runOnQueue(.main)
  }

  // MARK: - Helpers

  private func emitAuthChange(error: Error? = nil) {
    sendEvent("onAuthChange", snapshot(error: error))
  }

  /// `status`: authenticated | signedOut | error | authenticating.
  private func snapshot(status override: String? = nil, error: Error? = nil) -> [String: Any] {
    let player = GKLocalPlayer.local
    let status: String
    if let override = override {
      status = override
    } else if player.isAuthenticated {
      status = "authenticated"
    } else if !authStarted {
      status = "signedOut"
    } else if let gkError = error as? GKError, gkError.code == .notAuthenticated || gkError.code == .cancelled {
      status = "signedOut"
    } else if error != nil {
      status = "error"
    } else {
      status = "signedOut"
    }
    let authenticated = status == "authenticated"
    let errorText: String? = status == "error" ? (error?.localizedDescription ?? lastError) : nil
    // NSNull, not Swift optionals, so absent values reach JS as `null`.
    return [
      "status": status,
      "displayName": authenticated ? player.displayName : NSNull(),
      "alias": authenticated ? player.alias : NSNull(),
      "gamePlayerId": authenticated ? player.gamePlayerID : NSNull(),
      "error": errorText ?? NSNull(),
    ]
  }

  @discardableResult
  private func present(_ controller: UIViewController) -> Bool {
    guard let presenter = appContext?.utilities?.currentViewController() else { return false }
    presenter.present(controller, animated: true)
    return true
  }
}

/// Dismisses the native dashboard when the player closes it.
private final class DashboardDelegate: NSObject, GKGameCenterControllerDelegate {
  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }
}
