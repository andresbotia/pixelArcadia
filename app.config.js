const base = require('./app.json').expo;

const TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const PRODUCTION_IOS_APP_ID = 'ca-app-pub-5253670144191495~3800690302';

module.exports = ({ config }) => {
  // EAS Build sets the profile; EAS Update uses the public mode variable from
  // its production environment when there is no build profile.
  const production = process.env.EAS_BUILD_PROFILE === 'production'
    || process.env.EXPO_PUBLIC_ADS_TEST_MODE === '0';
  const iosAppId = production ? process.env.ADMOB_IOS_APP_ID : TEST_IOS_APP_ID;
  if (production && iosAppId !== PRODUCTION_IOS_APP_ID) {
    throw new Error('Production AdMob iOS App ID is missing or incorrect (ADMOB_IOS_APP_ID).');
  }

  const merged = { ...base, ...config };
  return {
    ...merged,
    plugins: base.plugins.map((entry) => {
      if (!Array.isArray(entry) || entry[0] !== 'react-native-google-mobile-ads') return entry;
      return [entry[0], { ...entry[1], iosAppId }];
    }),
  };
};
