import { Dimensions } from 'react-native';

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812 || currentSize.width === 812 || currentSize.height === 896 || currentSize.width === 896);

let iosConfig = {
  isIPhoneX,
  appLink: 'https://itunes.apple.com/us/app/bitmark-registry/id1429427796?ls=1&mt=8',
  codePush: {
    productionKey: 'q0VOHmW4l3oxFuhbfqVY48zWJHiMBJFSo1yHX',
    stagingKey: 'CGnP-G4I33angJRWeHM-6O3yPtwHS1KHiyySm',
  }
};

export {
  iosConfig,
};


// ┌────────────┬───────────────────────────────────────┐
// │ Name       │ Deployment Key                        │
// ├────────────┼───────────────────────────────────────┤
// │ Production │ q0VOHmW4l3oxFuhbfqVY48zWJHiMBJFSo1yHX │
// ├────────────┼───────────────────────────────────────┤
// │ Staging    │ CGnP-G4I33angJRWeHM-6O3yPtwHS1KHiyySm │
// └────────────┴───────────────────────────────────────┘
// document
// https://microsoft.github.io/code-push/docs/cli.html#link-6

// code-push app add Bitmark ios react-native


// testnet
// code-push release-react Bitmark-Registry ios --pre "Bitmark Registry dev" --mandatory true  --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.1.1.map"
// code-push release-react dungle_bitmark/Bitmark-Registry ios --pre "Bitmark dev" -m --description "update code" --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.0.8.map" [--targetBinaryVersion "~1.1.1"]

// livetnet
// code-push release-react Bitmark-Registry ios -d Production --mandatory true --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map"
// code-push release-react Bitmark-Registry ios -d Production -m --description "update code" --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map" [--targetBinaryVersion "~1.1.1"]


// react-native run-ios --device "Bitmark’s iPhone" --scheme 'Bitmark Registry dev'
// react-native run-ios --device "iPhone 5 testing" --scheme 'Bitmark dev'


// code-push release-react dungle_bitmark/Bitmark-Registry ios --pre "Bitmark Registry dev" --mandatory true  --sourcemapOutput "tools/source-map-tool/source-map/test/main.jsbundle_1.54.0.map" --plistFile=ios/Info-dev.plist
// code-push release-react dungle_bitmark/Bitmark-Registry ios -d Production --mandatory true  --plistFile=ios/Info.plist