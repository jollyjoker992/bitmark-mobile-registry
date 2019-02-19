import moment from 'moment';
import { merge } from 'lodash';
import { BitmarkModel, CommonModel, BitmarkSDK } from "../models";
import { FileUtil, isReleasedAsset } from 'src/utils';
import { config } from 'src/configs';
import { CacheData } from '../caches';


// ================================================================================================
// ================================================================================================

const doGetNewAssetsBitmarks = async (bitmarkAccountNumber, bitmarkAssets, lastOffset) => {
  bitmarkAssets = bitmarkAssets || {};
  bitmarkAssets.bitmarks = bitmarkAssets.bitmarks || {};
  bitmarkAssets.assets = bitmarkAssets.assets || {};

  for (let bitmarkId in bitmarkAssets.bitmarks) {
    if (bitmarkAssets.bitmarks[bitmarkId].edition) {
      lastOffset = lastOffset ? Math.max(lastOffset, bitmarkAssets.bitmarks[bitmarkId].offset) : bitmarkAssets.bitmarks[bitmarkId].offset;
    }
  }
  let data = await BitmarkModel.doGet100Bitmarks(bitmarkAccountNumber, lastOffset);
  while (data && data.bitmarks && data.bitmarks.length > 0) {
    for (let asset of data.assets) {
      bitmarkAssets.assets[asset.id] = merge({}, bitmarkAssets.assets[asset.id] || {}, asset);
    }
    for (let bitmark of data.bitmarks) {
      if (bitmark.owner === bitmarkAccountNumber) {
        if (bitmarkAssets.assets[bitmark.asset_id]) {
          bitmarkAssets.bitmarks[bitmark.id] = merge({}, bitmarkAssets.bitmarks[bitmark.id] || {}, bitmark);
        }
      } else {
        if (bitmarkAssets.bitmarks[bitmark.id]) {
          if (bitmarkAssets.assets[bitmarkAssets.bitmarks[bitmark.id].asset_id]) {
            let existOtherBitmarks = data.bitmarks.findIndex(bm => bm.asset_id === bitmarkAssets.bitmarks[bitmark.id].asset_id) >= 0;
            if (!existOtherBitmarks) {
              existOtherBitmarks = Object.values(bitmarkAssets.bitmarks || {}).findIndex(bm => bm.asset_id === bitmarkAssets.bitmarks[bitmark.id].asset_id) >= 0;
            }
            if (!existOtherBitmarks) {
              delete bitmarkAssets.assets[bitmarkAssets.bitmarks[bitmark.id].asset_id];
            }
          }
          delete bitmarkAssets.bitmarks[bitmark.id];
        }
      }
      lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
    }
    data = await BitmarkModel.doGet100Bitmarks(bitmarkAccountNumber, lastOffset);
  }
  return bitmarkAssets;
};

const doGetNewReleasedAssetsBitmarks = async (bitmarkAccountNumber, releasedBitmarksAssets, lastOffset) => {
  releasedBitmarksAssets = releasedBitmarksAssets || {}
  releasedBitmarksAssets.bitmarks = releasedBitmarksAssets.bitmarks || {};
  releasedBitmarksAssets.assets = releasedBitmarksAssets.assets || {};

  for (let bitmarkId in releasedBitmarksAssets.bitmarks) {
    if (releasedBitmarksAssets.bitmarks[bitmarkId].edition) {
      lastOffset = lastOffset ? Math.max(lastOffset, releasedBitmarksAssets.bitmarks[bitmarkId].offset) : releasedBitmarksAssets.bitmarks[bitmarkId].offset;
    }
  }

  let data = await BitmarkModel.getBitmarksOfAssetOfIssuer(bitmarkAccountNumber, null, lastOffset);
  while (data && data.bitmarks && data.bitmarks.length > 0) {
    for (let asset of data.assets) {
      if (isReleasedAsset(asset)) {
        releasedBitmarksAssets.assets[asset.id] = merge({}, releasedBitmarksAssets.assets[asset.id] || {}, asset);
      }
    }
    for (let bitmark of data.bitmarks) {
      if (releasedBitmarksAssets.assets[bitmark.asset_id]) {
        releasedBitmarksAssets.bitmarks[bitmark.id] = merge({}, releasedBitmarksAssets.bitmarks[bitmark.id] || {}, bitmark);
      }
      lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
    }
    data = await BitmarkModel.getBitmarksOfAssetOfIssuer(bitmarkAccountNumber, null, lastOffset);
  }
  return releasedBitmarksAssets;
};

const doCheckFileToIssue = async (filePath) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return assetInfo;
  } else {
    let accessibilityData = await BitmarkModel.doGetAssetAccessibility(assetInfo.id);
    assetInformation.accessibility = accessibilityData ? accessibilityData.accessibility : null;
    return assetInformation;
  }
};

const doCheckMetadata = (metadataList) => {
  let metadata = {};
  let existFields = {};
  return new Promise((resolve) => {
    for (let index = 0; index < metadataList.length; index++) {
      let item = metadataList[index];
      item.labelError = !!((index < (metadataList.length - 1) && !item.label) ||
        (index === (metadataList.length - 1) && !item.label && item.value));
      item.valueError = !!((index < (metadataList.length - 1) && !item.value) ||
        (index === (metadataList.length - 1) && !item.value && item.label));
      if (item.label && existFields[item.label.toLowerCase()] >= 0) {
        item.labelError = true;
        metadataList[existFields[item.label.toLowerCase()]].labelError = true;
        return resolve(global.i18n.t("BitmarkService_duplicatedLabels") + ' ' + item.label);
      }
      if (item.label && item.value) {
        existFields[item.label.toLowerCase()] = index;
        metadata[item.label] = item.value;
      }
    }

    BitmarkModel.doCheckMetadata(metadata).then(() => resolve()).catch(() => resolve(global.i18n.t("BitmarkService_metadataIsTooLong")));
  });
};

const doIssueFile = async (bitmarkAccountNumber, filePath, assetName, metadataList, quantity) => {
  let metadata = {};
  if (Array.isArray(metadataList)) {
    metadataList.forEach(item => {
      if (item.label && item.value) {
        metadata[item.label] = item.value;
      }
    });
  } else {
    metadata = metadataList;
  }
  let issueResult = await BitmarkModel.doIssueFile(filePath, assetName, metadata, quantity);

  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(bitmarkAccountNumber, config.isAndroid)}/${issueResult.assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);

  let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
  if (config.isIPhone) {
    await BitmarkSDK.storeFileSecurely(filePath, `${downloadedFolder}/${filename}`);
  } else {
    await FileUtil.copyFile(filePath, `${downloadedFolder}/${filename}`);
  }

  let listFile = await FileUtil.readDir(downloadedFolder);
  let results = [];
  issueResult.bitmarkIds.forEach(id => {
    results.push({
      id,
      assetId: issueResult.assetId,
      metadata,
      filePath: `${downloadedFolder}/${listFile[0]}`
    });
  });
  return results;
};

let doIssueMusic = async (bitmarkAccountNumber, filePath, assetName, metadataList, thumbnailPath, limitedEdition) => {
  let metadata = {};
  if (Array.isArray(metadataList)) {
    metadataList.forEach(item => {
      if (item.label && item.value) {
        metadata[item.label] = item.value;
      }
    });
  } else {
    metadata = metadataList;
  }
  let issueResult = await BitmarkModel.doIssueFile(filePath, assetName, metadata, limitedEdition + 1);

  let signatures = await BitmarkSDK.signMessages([issueResult.assetId + '|' + limitedEdition]);
  await BitmarkModel.doUploadMusicThumbnail(bitmarkAccountNumber, issueResult.assetId, thumbnailPath, limitedEdition, signatures[0]);
  await BitmarkModel.doUploadMusicAsset(CacheData.jwt, issueResult.assetId, filePath);

  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(bitmarkAccountNumber, config.isAndroid)}/${issueResult.assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);

  let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
  await BitmarkSDK.storeFileSecurely(filePath, `${downloadedFolder}/${filename}`);
  await FileUtil.copyFileSafe(thumbnailPath, `${assetFolderPath}/thumbnail.png`);

  let listFile = await FileUtil.readDir(downloadedFolder);
  let results = [];
  issueResult.bitmarkIds.forEach(id => {
    results.push({
      id,
      assetId: issueResult.assetId,
      metadata,
      filePath: `${downloadedFolder}/${listFile[0]}`
    });
  });
  return results;
};

const doGetBitmarkInformation = async (bitmarkId) => {
  let data = await BitmarkModel.doGetBitmarkInformation(bitmarkId);
  data.bitmark.created_at = moment(data.bitmark.created_at).format('YYYY MMM DD HH:mm:ss');
  data.bitmark.bitmark_id = data.bitmark.id;
  return data;
};

const doGetProvenance = async (bitmarkId, headId, status) => {
  let { provenance } = await BitmarkModel.doGetProvenance(bitmarkId);
  if (headId && status) {
    let isViewed = false;
    provenance.forEach(hs => {
      if (hs.tx_id === headId) {
        hs.isViewed = hs.status === status;
        isViewed = true;
      } else {
        hs.isViewed = isViewed;
      }
    });
  }
  return provenance;
};

const doConfirmWebAccount = async (bitmarkAccountNumber, token) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  return await BitmarkModel.doConfirmWebAccount(bitmarkAccountNumber, token, signatureData.timestamp, signatureData.signature);
};

const doDecentralizedIssuance = async (bitmarkAccountNumber, token, encryptionKey) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  let issuanceData = await BitmarkModel.doGetAssetInfoOfDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token);
  try {
    let sessionData = await BitmarkSDK.createSessionData(encryptionKey);
    let timestamp = moment().toDate().getTime();
    let requestMessage = `uploadAsset|${issuanceData.asset_info.asset_id}|${bitmarkAccountNumber}|${timestamp}`;
    let results = await BitmarkSDK.signMessages([requestMessage]);

    signatureData = await CommonModel.doCreateSignatureData();
    await BitmarkModel.doSubmitSessionDataForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, sessionData, {
      timestamp,
      signature: results[0],
      requester: bitmarkAccountNumber,
    });

    let result = await BitmarkSDK.issueRecord(issuanceData.asset_info.fingerprint, issuanceData.asset_info.name, issuanceData.asset_info.metadata, issuanceData.quantity);

    signatureData = await CommonModel.doCreateSignatureData();
    await BitmarkModel.doUpdateStatusForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'success', result);
    return result;
  } catch (error) {
    console.log('doDecentralizedIssuance error:', error);
    await BitmarkModel.doUpdateStatusForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'failed');
    throw error;
  }
};

const doTransferBitmark = async (bitmarkId, receiver) => {
  return await BitmarkSDK.transfer(bitmarkId, receiver);
};

const doDecentralizedTransfer = async (bitmarkAccountNumber, token, bitmarkId, receiver) => {
  try {
    let result = await BitmarkSDK.transfer(bitmarkId, receiver);
    let signatureData = await CommonModel.doCreateSignatureData();
    await BitmarkModel.doUpdateStatusForDecentralizedTransfer(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'success');
    return result;
  } catch (error) {
    let signatureData = await CommonModel.doCreateSignatureData();
    await BitmarkModel.doUpdateStatusForDecentralizedTransfer(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'failed');
    throw error;
  }
};


const doUploadFileToCourierServer = async (assetId, filePath, sessionData, filename, access) => {
  if (sessionData && sessionData.data_key_alg && sessionData.enc_data_key) {
    let message = `${assetId}|${sessionData.data_key_alg}|${sessionData.enc_data_key}|*|${access}`;
    let signature = (await BitmarkSDK.signMessages([message]))[0];

    let uploadFunction = () => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', {
          uri: (config.isAndroid ? 'file://' : '') + filePath,
          name: filename,
          filename,
        });
        formData.append('data_key_alg', sessionData.data_key_alg);
        formData.append('enc_data_key', sessionData.enc_data_key);
        formData.append('orig_content_type', '*');
        formData.append('access', access);
        let headers = {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          requester: CacheData.userInformation.bitmarkAccountNumber,
          signature
        };


        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = (e) => {
          if (xhr.readyState !== 4) {
            resolve(true);
          }

          if (xhr.status === 200) {
            resolve(true);
          } else {
            reject(new Error('upload error'));
          }
        };
        xhr.open('POST', `${config.file_courier_server}/v2/files/${assetId}/${CacheData.userInformation.bitmarkAccountNumber}`);
        xhr.setRequestHeader(headers);
        xhr.send(formData);
      });
    };
    return await uploadFunction();

    // console.log('uploadFunction :', { formData, headers });

    // let uploadFunction = (headers, formData) => {
    //   return new Promise((resolve, reject) => {
    //     let statusCode;
    //     fetch(`${config.file_courier_server}/v2/files/${assetId}/${CacheData.userInformation.bitmarkAccountNumber}`, {
    //       method: 'POST',
    //       headers,
    //       body: formData,
    //     }).then((response) => {
    //       statusCode = response.status;
    //       if (statusCode < 400) {
    //         return response.json();
    //       }
    //       return response.text();
    //     }).then((data) => {
    //       if (statusCode >= 400) {
    //         return reject(new Error(`uploadFunction error : ${statusCode}` + JSON.stringify(data)));
    //       }
    //       resolve(data);
    //     }).catch(reject);
    //   });
    // }
    // return await uploadFunction(headers, formData);
  }
};

const doCheckFileExistInCourierServer = async (assetId) => {
  let message = `${assetId}`;
  let signature = (await BitmarkSDK.signMessages([message]))[0];
  return await (new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.file_courier_server}/v2/files/${assetId}/${CacheData.userInformation.bitmarkAccountNumber}`, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        signature: signature,
        requester: CacheData.userInformation.bitmarkAccountNumber,
      }
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return reject(new Error('checkFileExistInCourierServer error!'));
      }
      if (statusCode >= 400) {
        return resolve();
      }
      resolve({
        data_key_alg: response.headers.map['data-key-alg'],
        enc_data_key: response.headers.map['enc-data-key'],
        orig_content_type: response.headers.map['orig-content-type'],
        expiration: response.headers.map['expiration'],
        filename: response.headers.map['file-name'],
        date: response.headers.map['date'],
      });
    }).catch(error => {
      return reject(new Error('checkFileExistInCourierServer error :' + JSON.stringify(error)));
    });
  }));
};

const doUpdateAccessFileInCourierServer = async (assetId, access) => {
  let message = `${assetId}|${access}`;
  let signature = (await BitmarkSDK.signMessages([message]))[0];

  const formData = new FormData();
  formData.append('access', access);
  return await (new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.file_courier_server}/v2/access/${assetId}/${CacheData.userInformation.bitmarkAccountNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
        signature: signature,
        requester: CacheData.userInformation.bitmarkAccountNumber,
      },
      body: formData,
    }).then((response) => {
      statusCode = response.status;
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doUpdateAccessFileInCourierServer error ${statusCode} :` + JSON.stringify(data, null, 2)));
      }
      resolve(true);
    }).catch(reject);
  }));
};

const doGetDownloadableAssets = async () => {
  let { timestamp, signature } = await CommonModel.doCreateSignatureData();
  return await (new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.file_courier_server}/v2/files?receiver=${CacheData.userInformation.bitmarkAccountNumber}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: CacheData.userInformation.bitmarkAccountNumber,
        signature,
        timestamp
      }
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetDownloadableAssets error : ${statusCode}` + JSON.stringify(data)));
      }
      resolve(data ? (data.file_ids || []) : []);
    }).catch(reject);
  }));
};

const doDownloadFileToCourierServer = async (assetId, sender, filePath) => {
  let signature = (await BitmarkSDK.signMessages([`${assetId}|${sender}`]))[0];
  let response;
  let result = await FileUtil.downloadFile({
    fromUrl: `${config.file_courier_server}/v2/files/${assetId}/${sender}?receiver=${CacheData.userInformation.bitmarkAccountNumber}`,
    toFile: filePath,
    method: 'GET',
    headers: {
      requester: CacheData.userInformation.bitmarkAccountNumber,
      signature
    },
    begin: (res) => response = res
  });
  console.log('response :', response, result);
  if (response.statusCode >= 400) {
    throw new Error(`doDownloadFileToCourierServer error ${response.statusCode}`);
  }
  return {
    data_key_alg: response.headers['Data-Key-Alg'],
    enc_data_key: response.headers['Enc-Data-Key'],
    filename: response.headers['File-Name'],
  };
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGetNewAssetsBitmarks,
  doGetNewReleasedAssetsBitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doIssueMusic,
  doTransferBitmark,
  doGetBitmarkInformation,
  doGetProvenance,
  doConfirmWebAccount,
  doDecentralizedIssuance,
  doDecentralizedTransfer,

  doCheckFileExistInCourierServer,
  doUploadFileToCourierServer,
  doUpdateAccessFileInCourierServer,
  doDownloadFileToCourierServer,
  doGetDownloadableAssets,

};

export { BitmarkService };