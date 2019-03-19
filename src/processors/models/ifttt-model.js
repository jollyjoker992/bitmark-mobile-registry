import { config } from 'src/configs';
import { FileUtil } from 'src/utils';

const doGetIFtttInformation = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user`;
    fetch(tempUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetIFtttInformation error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doRevokeIftttToken = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user`;
    fetch(tempUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRemoveBitmarkFile error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const downloadBitmarkFile = async (jwt, id, filePath) => {
  return await FileUtil.downloadFile({
    fromUrl: `${config.ifttt_server_url}/api/user/bitmark-file/${id}`,
    toFile: filePath,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + jwt,
    },
    begin: (res) => {
      console.log('downloadBitmarkFile begin ', res);
    },
    progress: (res) => {
      console.log('downloadBitmarkFile progress ', res);
    }
  });
};

const doRemoveBitmarkFile = (jwt, id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user/bitmark-file/${id}`;
    fetch(tempUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRemoveBitmarkFile error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const IftttModel = {
  doGetIFtttInformation,
  doRevokeIftttToken,
  downloadBitmarkFile,
  doRemoveBitmarkFile,
};

export { IftttModel };