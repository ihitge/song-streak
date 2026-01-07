const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { wrapWithAudioAPIMetroConfig } = require('react-native-audio-api/metro-config');

const config = getDefaultConfig(__dirname);
const nativeWindConfig = withNativeWind(config, { input: './global.css' });

module.exports = wrapWithAudioAPIMetroConfig(nativeWindConfig);
