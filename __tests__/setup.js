import { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } from "./configs/config";
import wd from "wd";

module.exports = async () => {
    // const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);
    // await driver.init(RUN_CONFIG);
    // await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
    //
    // global.__DRIVER__ = driver;
};