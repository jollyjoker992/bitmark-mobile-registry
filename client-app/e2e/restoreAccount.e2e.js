describe('Onboarding', async () => {
  let client;

  it('restores existing account', async () => {
    const client = process.client;

    // show welcome screen
    expect(client.element("//*[@name='WelcomeComponent.view']")).toBeTruthy();

    // click 'ACCESS EXISTING ACCOUNT'
    await client.element("//*[@name='WelcomeComponent.accessExistingAccount']").click();

    // show 'RECOVERY PHRASE SIGN-IN' screen
    expect(client.element("//*[@name='SignInComponent.view']")).toBeTruthy();

    // enter 24 words
    input1 = await client.element("//*[@name='SignInComponent.smallerList.textID.1']");
    expect(input1).toBeTruthy();
    input1.click();
    // api reference http://appium.io/docs/en/commands/element/actions/send-keys/index.html
    // await input1.type('abc');
  });
});
