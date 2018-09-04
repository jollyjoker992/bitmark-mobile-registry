
const host = 'localhost';
const port = 4723;

const waitForTimeout = 30 * 60000;
const commandTimeout = 30 * 60000;

module.exports = {
  debug: false,
  host: host,
  port: port,
  maxInstances: 1,
  desiredCapabilities: {
    platformName: "iOS",
    deviceName: "iPhone 6",
    bundleId: "com.bitmark.registry.inhouse.e2e",
    automationName: "XCUITest",
    udid: "0508B5E3-8BC5-469A-9B72-C76EE390D0D1",
    takeScreenshot: false,
    app:
    "/Users/Aaron/Documents/Project/Bitmark/mobile-app-registry/client-app/ios/build/Build/Products/Debug-iphonesimulator/Bitmark Registry dev e2e.app"
  },
  services: ['selenium-standalone', 'appium'],
  appium: {
    waitStartTime: 6000,
    waitForTimeout: waitForTimeout,
    command: "appium",
    logFileName: "appium.log",
    args: {
      address: host,
      port: port,
      commandTimeout: commandTimeout,
      sessionOverride: true,
      debugLogSpacing: true
    }
  },

  // test configurations
  logLevel: 'verbose',
  coloredLogs: true,
  deprecationWarnings: true,

  onPrepare: function() {
    console.log('start');
  },

  afterScenario: function() {
    console.log('after');
  },

  onComplete: function() {
    console.log('complete');
  }
};
