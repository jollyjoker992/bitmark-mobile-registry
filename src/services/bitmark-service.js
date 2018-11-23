import moment from 'moment';
import { merge } from 'lodash';
import { BitmarkModel, CommonModel, BitmarkSDK } from "../models";
import { config } from '../configs';
import { FileUtil } from '../utils';
import randomString from "random-string";

// ================================================================================================
// ================================================================================================

const doGet100Bitmarks = async (bitmarkAccountNumber, oldLocalAssets, lastOffset) => {
  let hasChanging = false;
  if (!oldLocalAssets) {
    hasChanging = true;
    oldLocalAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  }
  oldLocalAssets = oldLocalAssets || [];
  if (!lastOffset) {
    oldLocalAssets.forEach(asset => {
      asset.bitmarks.forEach(bitmark => {
        lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
      });
    });
  }
  let data = await BitmarkModel.doGet100Bitmarks(bitmarkAccountNumber, lastOffset);
  let localAssets = merge([], oldLocalAssets || []);

  if (data && data.bitmarks && data.assets) {
    hasChanging = data.bitmarks.length >= 100;
    for (let bitmark of data.bitmarks) {
      lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
      bitmark.bitmark_id = bitmark.id;
      bitmark.isViewed = false;
      let oldAsset = (localAssets).find(asset => asset.id === bitmark.asset_id);
      let newAsset = data.assets.find(asset => asset.id === bitmark.asset_id);
      if (oldAsset && newAsset && !oldAsset.created_at) {
        oldAsset.created_at = newAsset.created_at;
      }
      if (bitmark.owner === bitmarkAccountNumber) {
        hasChanging = true;
        if (oldAsset) {
          let oldBitmarkIndex = oldAsset.bitmarks.findIndex(ob => ob.id === bitmark.id);
          if (oldBitmarkIndex >= 0) {
            oldAsset.bitmarks[oldBitmarkIndex] = bitmark;
          } else {
            oldAsset.bitmarks.push(bitmark);
          }
          oldAsset.isViewed = false;
        } else {
          newAsset.bitmarks = [bitmark];
          newAsset.isViewed = false;
          localAssets.push(newAsset);
        }
      } else {
        let oldAssetIndex = (localAssets).findIndex(asset => asset.id === bitmark.asset_id);
        if (oldAssetIndex >= 0) {
          let oldAsset = localAssets[oldAssetIndex];
          let oldBitmarkIndex = oldAsset.bitmarks.findIndex(ob => bitmark.id === ob.id);
          if (oldBitmarkIndex >= 0) {
            hasChanging = true;
            oldAsset.bitmarks.splice(oldBitmarkIndex, 1);
            if (oldAsset.bitmarks.length === 0) {
              localAssets.splice(oldAssetIndex, 1);
            }
          }
        }
      }
    }
  }
  for (let asset of localAssets) {
    let oldTotalPending = asset.totalPending;
    asset.totalPending = 0;
    asset.bitmarks = asset.bitmarks.sort((a, b) => b.offset - a.offset);
    for (let bitmark of asset.bitmarks) {
      let oldData = asset.maxBitmarkOffset;
      asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
      hasChanging = hasChanging || (oldData !== asset.maxBitmarkOffset);

      asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
    }
    hasChanging = hasChanging || (oldTotalPending !== asset.totalPending);
  }

  if (hasChanging) {
    localAssets = localAssets.sort((a, b) => b.maxBitmarkOffset - a.maxBitmarkOffset);
  }
  return {
    hasChanging,
    localAssets,
    lastOffset,
  };
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

    BitmarkModel.doCheckMetadata(metadata).then(resolve).catch(() => resolve(global.i18n.t("BitmarkService_metadataIsTooLong")));
  });
};

const doIssueFile = async (touchFaceIdSession, bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let metadata = {};
  if (Array.isArray(metadataList)) {
    metadataList.forEach(item => {
      if (item.label && item.value) {
        metadata[item.label] = item.value;
      }
    });
  } else {
    metadata = metadataList
  }

  let tempFolder = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}/assets/temp_${randomString({ length: 8, numeric: true, letters: false, }) + moment().toDate().getTime()}`;
  let tempFolderDownloaded = `${tempFolder}/downloaded`;
  await FileUtil.mkdir(tempFolder);
  await FileUtil.mkdir(tempFolderDownloaded);

  let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, tempFolderDownloaded, filePath, assetName, metadata, quantity, isPublicAsset);

  let assetFolderPath = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}/assets/${issueResult.assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);
  let list = await FileUtil.readDir(tempFolderDownloaded);
  for (let filename of list) {
    await FileUtil.moveFile(`${tempFolderDownloaded}/${filename}`, `${downloadedFolder}/${filename}`);
  }
  await FileUtil.removeSafe(tempFolder);

  let sessionAssetFolder = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}/assets-session-data/${issueResult.assetId}`;
  await FileUtil.mkdir(sessionAssetFolder);
  await FileUtil.create(`${sessionAssetFolder}/session_data.txt`, JSON.stringify(issueResult.sessionData));

  return issueResult;
};

const doGetBitmarkInformation = async (bitmarkId) => {
  let data = await BitmarkModel.doGetBitmarkInformation(bitmarkId);
  data.bitmark.created_at = moment(data.bitmark.created_at).format('YYYY MMM DD HH:mm:ss');
  data.bitmark.bitmark_id = data.bitmark.id;
  return data;
};

const doGetTrackingBitmarks = async (bitmarkAccountNumber) => {
  let oldTrackingBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS);
  oldTrackingBitmarks = oldTrackingBitmarks || [];
  let oldStatuses = {};
  let allTrackingBitmarksFromServer = await BitmarkModel.doGetAllTrackingBitmark(bitmarkAccountNumber);
  allTrackingBitmarksFromServer.bitmarks.forEach(tb => {
    oldStatuses[tb.bitmark_id] = {
      lastHistory: {
        status: tb.status,
        head_id: tb.tx_id,
      },
    };
  });
  oldTrackingBitmarks.forEach(otb => {
    if (oldStatuses[otb.id]) {
      oldStatuses[otb.id].lastHistory = otb.lastHistory;
      oldStatuses[otb.id].asset = otb.asset;
      oldStatuses[otb.id].isViewed = otb.isViewed;
    }
  });
  let bitmarkIds = Object.keys(oldStatuses);
  let allData = await BitmarkModel.doGetListBitmarks(bitmarkIds, { includeAsset: true });
  let bitmarks = allData ? (allData.bitmarks || []) : [];
  let assets = allData ? (allData.assets || []) : [];
  let trackingBitmarks = [];
  for (let bitmark of bitmarks) {
    let oldStatus = oldStatuses[bitmark.id];
    bitmark.asset = assets.find(asset => asset.id === bitmark.asset_id);

    if (oldStatus.lastHistory.head_id !== bitmark.head_id ||
      (oldStatus.lastHistory.head_id === bitmark.head_id && oldStatus.lastHistory.status !== bitmark.status)) {
      bitmark.isViewed = false;
    } else {
      bitmark.isViewed = !!oldStatus.isViewed;
    }
    bitmark.lastHistory = oldStatus.lastHistory;

    trackingBitmarks.push(bitmark);
  }
  return trackingBitmarks;
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

const doConfirmWebAccount = async (touchFaceIdSession, bitmarkAccountNumber, token) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  return await BitmarkModel.doConfirmWebAccount(bitmarkAccountNumber, token, signatureData.timestamp, signatureData.signature);
};

const doDecentralizedIssuance = async (touchFaceIdSession, bitmarkAccountNumber, token, encryptionKey) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let issuanceData = await BitmarkModel.doGetAssetInfoOfDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token);
  try {
    let sessionData = await BitmarkSDK.createSessionData(touchFaceIdSession, encryptionKey);
    let timestamp = moment().toDate().getTime();
    let requestMessage = `uploadAsset|${issuanceData.asset_info.asset_id}|${bitmarkAccountNumber}|${timestamp}`;
    let results = await BitmarkSDK.rickySignMessage([requestMessage], touchFaceIdSession);

    signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
    await BitmarkModel.doSubmitSessionDataForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, sessionData, {
      timestamp,
      signature: results[0],
      requester: bitmarkAccountNumber,
    });

    let result = await BitmarkSDK.issueRecord(touchFaceIdSession, issuanceData.asset_info.fingerprint, issuanceData.asset_info.name, issuanceData.asset_info.metadata, issuanceData.quantity);

    signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
    await BitmarkModel.doUpdateStatusForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'success', result);
    return result;
  } catch (error) {
    console.log('doDecentralizedIssuance error:', error);
    await BitmarkModel.doUpdateStatusForDecentralizedIssuance(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'failed');
    throw error;
  }
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  return await BitmarkSDK.transferOneSignature(touchFaceIdSession, bitmarkId, receiver);
};

const doDecentralizedTransfer = async (touchFaceIdSession, bitmarkAccountNumber, token, bitmarkId, receiver) => {
  try {
    let result = await BitmarkSDK.transferOneSignature(touchFaceIdSession, bitmarkId, receiver);
    let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
    await BitmarkModel.doUpdateStatusForDecentralizedTransfer(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'success');
    return result;
  } catch (error) {
    let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
    await BitmarkModel.doUpdateStatusForDecentralizedTransfer(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token, 'failed');
    throw error;
  }
};

const uploadFileToCourierServer = async (touchFaceIdSession, bitmarkAccountNumber, assetId, receiver, filePath, sessionData) => {

  if (sessionData && sessionData.data_key_alg && sessionData.enc_data_key) {
    let message = `${sessionData.data_key_alg}|${sessionData.enc_data_key}|*`;
    let signature = (await CommonModel.doTryRickSignMessage([message], touchFaceIdSession))[0];

    const formData = new FormData();
    formData.append('file', {
      uri: filePath,
      name: filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length)
    });
    formData.append('data_key_alg', sessionData.data_key_alg);
    formData.append('enc_data_key', sessionData.enc_data_key);
    formData.append('orig_content_type', '*');

    let headers = {
      'Content-Type': 'multipart/form-data',
      requester: bitmarkAccountNumber,
      signature
    };

    let uploadFunction = (headers, formData) => {
      return new Promise((resolve, reject) => {
        let statusCode;
        fetch(`${config.file_courier_server}/files/${assetId}/${receiver}`, {
          method: 'PUT',
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
            return reject(new Error(`doSubmitSessionDataForDecentralizedIssuance error :` + JSON.stringify(data)));
          }
          resolve(data);
        }).catch(reject);
      });
    }
    return await uploadFunction(headers, formData);
  }
};

const downloadFileToCourierServer = async (touchFaceIdSession, bitmarkAccountNumber, assetId, filePath) => {
  let signature = (await CommonModel.doTryRickSignMessage([assetId], touchFaceIdSession))[0];
  let response;
  let result = await FileUtil.downloadFile({
    fromUrl: `${config.file_courier_server}/files/${assetId}/${bitmarkAccountNumber}`,
    toFile: filePath,
    method: 'GET',
    headers: {
      requester: bitmarkAccountNumber,
      signature
    },
    begin: (res) => response = res
  });
  console.log('response :', response, result);
  return {
    data_key_alg: response.headers['Data-Key-Alg'],
    enc_data_key: response.headers['Enc-Data-Key'],
    filename: response.headers['File-Name'],
    sender: response.headers['Sender'],
  }
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGet100Bitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doTransferBitmark,
  doGetBitmarkInformation,
  doGetTrackingBitmarks,
  doGetProvenance,
  doConfirmWebAccount,
  doDecentralizedIssuance,
  doDecentralizedTransfer,

  uploadFileToCourierServer,
  downloadFileToCourierServer,

};

export { BitmarkService };