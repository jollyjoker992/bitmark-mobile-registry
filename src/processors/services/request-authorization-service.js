const requestAuthorization = (url, payload) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`requestAuthorization error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const RequestAuthorizationService = {
  requestAuthorization
};

export { RequestAuthorizationService }
