const { withUniwindConfig } = require("uniwind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

const uniwindConfig = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});

module.exports = uniwindConfig;
