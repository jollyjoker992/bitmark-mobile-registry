import wd from 'wd';
import {APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG} from '../../configs/config'
import { accessExistingAccount } from "../../common/common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeEach(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

const TWELVE_WORDS = ['bag', 'level', 'quote', 'meat', 'eye', 'vendor', 'clutch', 'snap', 'truck', 'elite', 'grant', 'valley'];
const TWENTY_FOUR_WORDS = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama"];

test('Access Existing Account - 12 words', async () => {
    await accessExistingAccount(driver, TWELVE_WORDS);
});

test('Access Existing Account - 24 words', async () => {
    await accessExistingAccount(driver, TWENTY_FOUR_WORDS);
});