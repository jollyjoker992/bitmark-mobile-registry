const simctl = require('node-simctl');
const { RUN_CONFIG } = require("../configs/config");
const { runCommand, delay } = require("../common/common");


simctl.getDevices(RUN_CONFIG.platformVersion, RUN_CONFIG.platformName).then(async (devices) => {
  for (let device of devices) {
    if (device.name === 'iPhone X') {
      let cmd1 = `rm -rf ~/Library/Developer/CoreSimulator/Devices/${device.udid}/data/Media/DCIM/`;
      let cmd2 = `rm -rf ~/Library/Developer/CoreSimulator/Devices/${device.udid}/data/Media/PhotoData/`;
      await runCommand(cmd1);
      await runCommand(cmd2);
      await delay(5000);
      break;
    }
  }
});