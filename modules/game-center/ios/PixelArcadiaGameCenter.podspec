Pod::Spec.new do |s|
  s.name           = 'PixelArcadiaGameCenter'
  s.version        = '1.0.0'
  s.summary        = 'Pixel Arcadia Game Center bridge (GameKit auth, leaderboards, achievements).'
  s.description    = 'Local Expo module exposing the minimal GameKit surface Pixel Arcadia uses.'
  s.author         = 'Pixel Arcadia'
  s.homepage       = 'https://expo.dev'
  s.license        = { :type => 'UNLICENSED' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'GameKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,swift}'
end
