import moment from 'moment';
import { chunk } from 'lodash';

import { config } from 'src/configs';
import { BitmarkSDK } from './adapters';

// ===================================================================================================================
// ===================================================================================================================
const doGet100Bitmarks = (accountNumber, lastOffset) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.api_server_url +
      `/v1/bitmarks?owner=${accountNumber}&asset=true&pending=true&to=later&sent=true` + (lastOffset ? `&at=${lastOffset}` : '');
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetBitmarks error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllBitmarks = async (accountNumber, lastOffset) => {
  let totalData;
  let canContinue = true;
  while (canContinue) {
    let data = await doGet100Bitmarks(accountNumber, lastOffset);
    if (!totalData) {
      totalData = data;
    } else {
      data.assets.forEach((item) => {
        let index = totalData.assets.findIndex(asset => asset.id === item.id);
        if (index < 0) {
          totalData.assets.push(item);
        }
      });
      totalData.bitmarks = totalData.bitmarks.concat(data.bitmarks);
    }
    if (data.bitmarks.length < 100) {
      canContinue = false;
      break;
    }
    data.bitmarks.forEach(bitmark => {
      if (!lastOffset || lastOffset < bitmark.offset) {
        lastOffset = bitmark.offset;
      }
    });
  }
  return totalData;
};

const doGetList100Bitmarks = (bitmarkIds, external) => {
  let queryString = '';
  return new Promise((resolve, reject) => {
    if (bitmarkIds && bitmarkIds.length > 0) {
      bitmarkIds.forEach(bitmarkId => {
        queryString += queryString ? `&bitmark_ids=${bitmarkId}` : `?bitmark_ids=${bitmarkId}&pending=true`;
      });
      queryString += (external && external.includeAsset) ? '&asset=true' : '';
    }
    if (!queryString) {
      return resolve([]);
    }
    let statusCode;
    fetch(config.api_server_url + `/v1/bitmarks` + queryString, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetList100Bitmarks error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetListBitmarks = async (bitmarkIds, external) => {
  let groupListBitmarks = chunk(bitmarkIds, 100);
  let returnedData;
  for (let each100Bitmarks of groupListBitmarks) {
    let data = await doGetList100Bitmarks(each100Bitmarks, external);
    if (!returnedData) {
      returnedData = data;
    } else {
      returnedData.bitmarks = (returnedData.bitmarks || []).concat(data.bitmarks || []);
      if (external && external.includeAsset) {
        returnedData.assets = returnedData.assets || [];
        (data.assets || []).forEach(asset => {
          let exist = (returnedData.assets || []).findIndex(ea => ea.id == asset.id) >= 0;
          if (!exist) {
            returnedData.assets.push(asset);
          }
        });
      }
    }
  }
  return returnedData;
};

const doGetProvenance = (bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v1/bitmarks/${bitmarkId}?provenance=true&pending=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      let bitmark = data.bitmark;
      let provenance = (bitmark && bitmark.provenance) ? bitmark.provenance : [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      bitmark.provenance = provenance;
      resolve({ bitmark, provenance });
    }).catch(reject);
  });
};

const doGetAssetInformation = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v1/assets/${assetId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode === 404) {
        return resolve();
      }
      if (statusCode >= 400) {
        return reject(new Error('getAssetInfo error :' + JSON.stringify(data)));
      }
      resolve(data.asset);
    }).catch(reject);
  });
};

const doGetAssetAccessibility = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.api_server_url + `/v2/assets/${assetId}/info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode === 404) {
        return resolve();
      }
      if (statusCode >= 400) {
        return reject(new Error('getAssetInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAssetTextContent = (assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(config.preview_asset_url + `/${assetId}`, {
      method: 'GET'
    }).then((response) => {
      statusCode = response.status;
      return response.text();
    }).then((data) => {
      if (statusCode === 404) {
        return resolve();
      }
      if (statusCode >= 400) {
        return reject(new Error('getAssetInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAssetTextContentType = (assetId) => {
  return new Promise((resolve) => {
    fetch(config.preview_asset_url + `/${assetId}`, {
      method: 'HEAD'
    }).then((response) => {
      let contentType;
      let contentTypeHeader = response.headers.get('content-type');

      if (contentTypeHeader) {
        if (contentTypeHeader.startsWith('text/plain')) {
          contentType = 'text';
        } else if (contentTypeHeader.startsWith('image/')) {
          contentType = 'image';
        }
      }

      return resolve(contentType);
    }).catch(() => {
      resolve();
    });
  });
};

const doPrepareAssetInfo = async (filePath) => {
  return await BitmarkSDK.getAssetInfo(filePath);
};

const doCheckMetadata = async (metadata) => {
  return await BitmarkSDK.validateMetadata(metadata);
};

const doIssueFile = async (filePath, assetName, metadata, quantity) => {
  let result = await BitmarkSDK.issue(filePath, assetName, metadata, quantity);
  return result;
};

const registerNewAsset = async (filePath, assetName, metadata) => {
  let result = await BitmarkSDK.registerNewAsset(filePath, assetName, metadata);
  return result;
};


const doGet100Transactions = (accountNumber, offsetNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs?owner=${accountNumber}&pending=true&to=later&sent=true&block=true`;
    tempURL += offsetNumber ? `&at=${offsetNumber}` : '';
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGet100Transactions error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllTransactions = async (accountNumber, lastOffset) => {
  let totalTxs;
  let canContinue = true;
  while (canContinue) {
    let data = await doGet100Transactions(accountNumber, lastOffset);
    data.txs.forEach(tx => {
      tx.block = data.blocks.find(block => block.number === tx.block_number);
    });
    if (!totalTxs) {
      totalTxs = data.txs;
    } else {
      totalTxs = totalTxs.concat(data.txs);
    }
    if (data.txs.length < 100) {
      canContinue = false;
      break;
    }
    data.txs.forEach(tx => {
      if (!lastOffset || lastOffset < tx.offset) {
        lastOffset = tx.offset;
      }
    });
  }
  return totalTxs;
};

const doGetTransactionDetail = (txid) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs/${txid}?pending=true&asset=true&block=true`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetTransactionDetail error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};


const doGetBitmarkInformation = (bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.api_server_url +
      `/v1/bitmarks/${bitmarkId}?asset=true&pending=true&provenance=true`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetBitmarkInformation ${bitmarkId} error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doConfirmWebAccount = async (bitmarkAccount, code, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.web_app_server_url + `/s/api/mobile/confirmations`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
      body: JSON.stringify({ code })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doConfirmWebAccount error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAssetInfoOfDecentralizedIssuance = (bitmarkAccount, timestamp, signature, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = `${config.web_app_server_url}/s/api/mobile/decentralized-issuances/${token}`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`getAssetInfoOfDecentralizedIssuance error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doUpdateStatusForDecentralizedIssuance = (bitmarkAccount, timestamp, signature, token, status, bitmark_ids) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = `${config.web_app_server_url}/s/api/mobile/decentralized-issuances`;
    fetch(bitmarkUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
      body: JSON.stringify({
        token,
        status,
        bitmark_ids
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doUpdateStatusForDecentralizedIssuance error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doSubmitSessionDataForDecentralizedIssuance = (bitmarkAccount, timestamp, signature, token, sessionData, requestValidationData) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = `${config.web_app_server_url}/s/api/mobile/decentralized-issuances`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
      body: JSON.stringify({
        token,
        session_data: sessionData,
        request_validation: requestValidationData
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doSubmitSessionDataForDecentralizedIssuance error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetInfoInfoOfDecentralizedTransfer = (bitmarkAccount, timestamp, signature, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = `${config.web_app_server_url}/s/api/mobile/decentralized-transfers/${token}`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetInfoInfoOfDecentralizedTransfer error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doUpdateStatusForDecentralizedTransfer = (bitmarkAccount, timestamp, signature, token, status) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = `${config.web_app_server_url}/s/api/mobile/decentralized-transfers`;
    fetch(bitmarkUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: bitmarkAccount,
        timestamp,
        signature,
      },
      body: JSON.stringify({
        token,
        status,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doUpdateStatusForDecentralizedTransfer error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};
const doUploadMusicThumbnail = async (bitmarkAccountNumber, assetId, thumbnailPath, limitedEdition, signature, ) => {
  const formData = new FormData();
  formData.append('file', {
    uri: thumbnailPath,
    name: thumbnailPath.substring(thumbnailPath.lastIndexOf('/') + 1, thumbnailPath.length)
  });
  formData.append('asset_id', assetId);
  formData.append('limited_edition', limitedEdition);
  let headers = {
    'Content-Type': 'multipart/form-data',
    requester: bitmarkAccountNumber,
    signature
  };

  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.bitmark_profile_server}/s/asset/thumbnail`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doUploadMusicThumbnail error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const getBitmarksOfAssetOfIssuer = (accountNumber, assetId, lastOffset) => {
  return new Promise((resolve, reject) => {
    let bitmarkUrl = `${config.api_server_url}/v1/bitmarks?issuer=${accountNumber}&asset=true&pending=true&to=later` +
      (assetId ? `&asset_id=${assetId}` : '') +
      (lastOffset ? `&at=${lastOffset}` : '');
    let statusCode;

    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('getBitmarksOfAssetOfIssuer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(error => {
      console.log('error:', error);
      return reject(new Error('getBitmarksOfAssetOfIssuer error :' + JSON.stringify(error)));
    });
  });
};

const getAllBitmarksOfAssetFromIssuer = async (issuer, assetId) => {
  let returnedBitmarks = [];
  let data = await getBitmarksOfAssetOfIssuer(issuer, assetId);
  let lastOffset = -1;
  for (let bitmark of data.bitmarks) {
    lastOffset = Math.max(lastOffset, bitmark.offset);
    returnedBitmarks.push(bitmark);
  }
  while (data && data.bitmarks && data.bitmarks.length >= 100) {
    data = await getBitmarksOfAssetOfIssuer(issuer, assetId, lastOffset);
    for (let bitmark of data.bitmarks) {
      lastOffset = Math.max(lastOffset, bitmark.offset);
      returnedBitmarks.push(bitmark);
    }
  }
  return returnedBitmarks;
};

const doGetLimitedEdition = async (issuer, assetId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.bitmark_profile_server}/s/asset/limit-by-issuer?asset_id=${assetId}&issuer=${issuer}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetLimitedEdition error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doPostIncomingClaimRequest = (jwt, assetId, toAccount, ) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.mobile_server_url}/api/claim_requests`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        asset_id: assetId, to: toAccount,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 500) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        let error = new Error(`doPostClaimRequest error :` + JSON.stringify(data));
        error.data = data;
        error.statusCode = statusCode;
        return reject(error);
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetClaimRequest = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.mobile_server_url}/api/claim_requests`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetClaimRequest error :` + JSON.stringify(data)));
      }
      resolve({
        incoming_claim_requests: data.claim_requests.filter(item => item.status === 'pending'),
        outgoing_claim_requests: data.my_submitted_claim_requests
      });
    }).catch(reject);
  });
};


const doSubmitIncomingClaimRequests = (jwt, statuses) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.mobile_server_url}/api/claim_requests`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({ statuses })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doSubmitIncomingClaimRequests error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doPostAwaitTransfer = (jwt, bitmarkId, transferPayload) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.mobile_server_url}/api/transfer_queues`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        bitmark_id: bitmarkId, transfer_payload: transferPayload,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doPostAwaitTransfer error :` + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAwaitTransfers = (jwt) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.mobile_server_url}/api/transfer_queues`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetAwaitTransfers error :` + JSON.stringify(data)));
      }
      resolve(data ? (data.bitmark_ids || []) : []);
    }).catch(reject);
  });
};

let BitmarkModel = {
  doGetAssetInformation,
  doGet100Bitmarks,
  doGetAllBitmarks,
  doGetProvenance,
  doPrepareAssetInfo,
  doIssueFile,
  registerNewAsset,
  doCheckMetadata,
  doGetBitmarkInformation,
  doGetTransactionDetail,
  doGetAllTransactions,
  doGet100Transactions,
  doGetListBitmarks,
  doGetAssetAccessibility,
  doGetAssetTextContentType,
  doGetAssetTextContent,

  doConfirmWebAccount,
  doGetAssetInfoOfDecentralizedIssuance,
  doUpdateStatusForDecentralizedIssuance,
  doSubmitSessionDataForDecentralizedIssuance,
  doGetInfoInfoOfDecentralizedTransfer,
  doUpdateStatusForDecentralizedTransfer,

  doUploadMusicThumbnail,
  getBitmarksOfAssetOfIssuer,
  getAllBitmarksOfAssetFromIssuer,
  doGetLimitedEdition,
  doPostIncomingClaimRequest,
  doGetClaimRequest,
  doSubmitIncomingClaimRequests,
  doPostAwaitTransfer,
  doGetAwaitTransfers,
};

export { BitmarkModel };