describe('Login', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('shows welcome screen', async () => {
    await expect(element(by.id('WelcomeComponent'))).toBeVisible();
  });

  it('continues welcome flow', async () => {
    await element(by.id('WelcomeComponent.createNewAccount')).tap();
    await expect(element(by.id('NewAccountComponent'))).toBeVisible();

    await element(by.id('NewAccountComponent.skip')).tap();
    await expect(element(by.id('NewAccountComponent.publicAccountNumber'))).toBeVisible();

    await element(by.id('NewAccountComponent.letsDoIt')).tap();
    await expect(element(by.id('FaceTouchIdComponent.view'))).toBeVisible();

    await element(by.id('FaceTouchIdComponent.enable')).tap();
    await element(by.text('Ok')).tap();
    await expect(element(by.id('NotificationComponent.view'))).toBeVisible();
  });
});
