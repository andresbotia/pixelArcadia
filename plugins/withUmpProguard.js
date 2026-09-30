const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('@expo/config-plugins');

const RULE = '-keep class com.google.android.gms.internal.consent_sdk.** { *; }';

module.exports = function withUmpProguard(config) {
  return withDangerousMod(config, ['android', async (mod) => {
    const file = path.join(mod.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes(RULE)) fs.appendFileSync(file, `\n# Google UMP consent form\n${RULE}\n`);
    return mod;
  }]);
};
