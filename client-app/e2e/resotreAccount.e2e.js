describe('Onboarding', async () => {
  let client;

  it('restores existing account', async () => {
    const client = process.client;
    console.log('client: ', client);

    // show welcome screen
    expect(client.element("//*[@name='WelcomeComponent.view']")).toBeTruthy();

    // click 'ACCESS EXISTING ACCOUNT'
    await client.element("//*[@name='WelcomeComponent.accessExistingAccount']").click();

    // show 'RECOVERY PHRASE SIGN-IN' screen
    expect(client.element("//*[@name='SignInComponent.view']")).toBeTruthy();

    // enter 24 words
    // api reference http://appium.io/docs/en/commands/element/actions/send-keys/index.html
    await client.element("//*[@name='SignInComponent.smallerList.textID.1']").type('abc');
  });
});
