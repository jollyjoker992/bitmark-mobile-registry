const wdio = require('webdriverio');

module.exports = async () => {
  const config = require('./wdio.config');
  process.config = config;

  let client = wdio.remote(process.config);
  process.client = client;
  await process.client.init();
  return process.client;
};
