import moment from 'moment';
import { merge } from 'lodash';

import { FileUtil, runPromiseWithoutError, isMusicAsset } from "src/utils";
import { BitmarkService, LocalFileService } from "./services";
import { CommonModel, AccountModel, BitmarkSDK, BitmarkModel } from "./models";
import { CacheData } from "./caches";
import { CommonProcessor } from "./common-processor";
import { BottomTabStore, BottomTabActions, PropertiesActions, PropertiesStore, PropertyStore, PropertyActions } from 'src/views/stores';


const _doGetAllAssetsBitmarks = async (isReleased) => {
  let lastOffset;
  let releasedBitmarksAssets;
  let assetsBitmarks;
  if (isReleased) {
    releasedBitmarksAssets = await doGetLocalReleasedAssetsBitmarks();
    for (let bitmarkId in (releasedBitmarksAssets.bitmarks || {})) {
      lastOffset = lastOffset ? Math.max(lastOffset, releasedBitmarksAssets.bitmarks[bitmarkId].offset) : releasedBitmarksAssets.bitmarks[bitmarkId].offset;
    }
  } else {
    assetsBitmarks = await doGetLocalAssetsBitmarks();
    for (let bitmarkId in (assetsBitmarks.bitmarks || {})) {
      lastOffset = lastOffset ? Math.max(lastOffset, assetsBitmarks.bitmarks[bitmarkId].offset) : assetsBitmarks.bitmarks[bitmarkId].offset;
    }
  }
  return { lastOffset, releasedBitmarksAssets, assetsBitmarks };
};

const _doCheckTransferringBitmarks = (assetsBitmarks, outgoingTransferOffers) => {
  assetsBitmarks = assetsBitmarks || {};
  assetsBitmarks.bitmarks = assetsBitmarks.bitmarks || {};
  for (let bitmarkId in assetsBitmarks.bitmarks) {
    let transferOffer = (outgoingTransferOffers || []).find(item => (item.status === 'open' && item.bitmark_id === bitmarkId));
    assetsBitmarks.bitmarks[bitmarkId].transferOfferId = transferOffer ? transferOffer.id : null;
  }
  return assetsBitmarks;
};


const _doCheckNewReleasedAssetsBitmarks = async (releasedBitmarksAssets) => {
  let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
  if (releasedBitmarksAssets) {
    for (let assetId in releasedBitmarksAssets.assets) {
      releasedBitmarksAssets.assets[assetId].filePath = await LocalFileService.detectLocalAssetFilePath(assetId);
      await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(releasedBitmarksAssets.assets[assetId]));

      if (isMusicAsset(releasedBitmarksAssets.assets[assetId])) {
        releasedBitmarksAssets.assets[assetId].thumbnailPath = await LocalFileService.detectMusicThumbnailPath(assetId);
        releasedBitmarksAssets.assets[assetId].editions = releasedBitmarksAssets.assets[assetId].editions || {};

        // get all bitmark of asset base on issuer is current account
        let bitmarksOfAsset = Object.values(releasedBitmarksAssets.bitmarks || {}).filter(bitmark => bitmark.asset_id === assetId && bitmark.issuer === bitmarkAccountNumber);

        // get limited edition of asset base on issuer
        releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber] = releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber] || {};
        // get number editions left
        releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber].totalEditionLeft = bitmarksOfAsset.filter(bitmark => bitmark.owner === bitmarkAccountNumber).length - 1;
        releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber].limited = bitmarksOfAsset.length - 1;

        // // get limited edition via profile server
        // if (!releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber].limited) {
        //   let resultGetLimitedEdition = await BitmarkModel.doGetLimitedEdition(bitmarkAccountNumber, assetId);
        //   if (resultGetLimitedEdition) {
        //     releasedBitmarksAssets.assets[assetId].editions[bitmarkAccountNumber].limited = resultGetLimitedEdition.limited;
        //   }
        // }

        //TODO index edition number
      }
    }

    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_RELEASED_ASSETS_BITMARKS, releasedBitmarksAssets);

    PropertiesStore.dispatch(PropertiesActions.updateReleasedAssets({
      releasedAssets: Object.values(releasedBitmarksAssets.assets || {}),
      releasedBitmarks: releasedBitmarksAssets.bitmarks || {},
    }));
  }
};

const _doCheckNewAssetsBitmarks = async (assetsBitmarks) => {
  let releasedBitmarksAssets = await doGetLocalReleasedAssetsBitmarks();
  if (assetsBitmarks) {
    for (let assetId in assetsBitmarks.assets) {
      assetsBitmarks.assets[assetId] = merge({}, assetsBitmarks.assets[assetId], ((releasedBitmarksAssets.assets || {})[assetId] || {}))
      assetsBitmarks.assets[assetId].filePath = await LocalFileService.detectLocalAssetFilePath(assetId);
      await runPromiseWithoutError(LocalFileService.doCheckAndSyncDataWithICloud(assetsBitmarks.assets[assetId]));
    }

    for (let bitmarkId in assetsBitmarks.bitmarks) {
      let assetId = assetsBitmarks.bitmarks[bitmarkId].asset_id;
      let issuer = assetsBitmarks.bitmarks[bitmarkId].issuer;
      if (isMusicAsset(assetsBitmarks.assets[assetId]) && !releasedBitmarksAssets.assets[assetId]) {
        assetsBitmarks.assets[assetId].editions = assetsBitmarks.assets[assetId].editions || {};
        assetsBitmarks.assets[assetId].editions[issuer] = assetsBitmarks.assets[assetId].editions[issuer] || {};

        // detect thumbnail
        assetsBitmarks.assets[assetId].thumbnailPath = await LocalFileService.detectMusicThumbnailPath(assetId);
        console.log('thumbnailPath :', assetsBitmarks.assets[assetId].thumbnailPath);

        let allIssuedBitmarks = await BitmarkModel.getAllBitmarksOfAssetFromIssuer(issuer, assetId);
        assetsBitmarks.assets[assetId].editions[issuer].totalEditionLeft = allIssuedBitmarks.filter(bitmark => bitmark.owner === issuer).length - 1;
        assetsBitmarks.assets[assetId].editions[issuer].limited = allIssuedBitmarks.length - 1;

        //TODO index edition number
        // // get limited edition via profile server
        // if (!assetsBitmarks.assets[assetId].editions[issuer].limited) {
        //   let resultGetLimitedEdition = await BitmarkModel.doGetLimitedEdition(issuer, assetId);
        //   if (resultGetLimitedEdition) {
        //     assetsBitmarks.assets[assetId].editions[issuer].limited = resultGetLimitedEdition.limited;
        //   }
        // }
      }
    }

    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS, assetsBitmarks);
    PropertiesStore.dispatch(PropertiesActions.updateBitmarks({
      bitmarks: Object.values(assetsBitmarks.bitmarks || {}),
      assets: assetsBitmarks.assets || {},
    }));

    let propertyStoreState = merge({}, PropertyStore.getState().data);
    if (propertyStoreState.bitmark && propertyStoreState.bitmark.id && propertyStoreState.bitmark.asset_id) {
      propertyStoreState.asset = assetsBitmarks.assets[propertyStoreState.bitmark.asset_id];
      propertyStoreState.bitmark = assetsBitmarks.bitmarks[propertyStoreState.bitmark.id];
      PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
    }
  }
};

let queueGetAssetsBitmarks = [];
const runGetAssetsBitmarksInBackground = () => {
  return new Promise((resolve) => {
    queueGetAssetsBitmarks.push(resolve);
    if (queueGetAssetsBitmarks.length > 1) {
      return;
    }
    let doGetAllBitmarks = async () => {
      let { assetsBitmarks, lastOffset } = await _doGetAllAssetsBitmarks();
      assetsBitmarks = await BitmarkService.doGetNewAssetsBitmarks(CacheData.userInformation.bitmarkAccountNumber, assetsBitmarks, lastOffset);
      let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
      let outgoingTransferOffers = transferOffers.outgoingTransferOffers || [];
      assetsBitmarks = _doCheckTransferringBitmarks(assetsBitmarks, outgoingTransferOffers);
      await _doCheckNewAssetsBitmarks(assetsBitmarks);
    };
    doGetAllBitmarks().then(() => {
      queueGetAssetsBitmarks.forEach(queueResolve => queueResolve());
      queueGetAssetsBitmarks = [];
      console.log('runOnBackground  runGetAssetsBitmarksInBackground success');
    }).catch(error => {
      console.log('runOnBackground  runGetAssetsBitmarksInBackground error :', error);
      queueGetAssetsBitmarks.forEach(queueResolve => queueResolve());
      queueGetAssetsBitmarks = [];
    });
  });
};


let queueGetReleasedAssetsBitmarks = [];
const runGetReleasedAssetsBitmarksInBackground = () => {
  return new Promise((resolve) => {
    queueGetReleasedAssetsBitmarks.push(resolve);
    if (queueGetReleasedAssetsBitmarks.length > 1) {
      return;
    }
    let doGetAllBitmarks = async () => {
      let { releasedBitmarksAssets, lastOffset } = await _doGetAllAssetsBitmarks(true);
      releasedBitmarksAssets = await BitmarkService.doGetNewReleasedAssetsBitmarks(CacheData.userInformation.bitmarkAccountNumber, releasedBitmarksAssets, lastOffset);
      await _doCheckNewReleasedAssetsBitmarks(releasedBitmarksAssets);
    };
    doGetAllBitmarks().then(() => {
      queueGetReleasedAssetsBitmarks.forEach(queueResolve => queueResolve());
      queueGetReleasedAssetsBitmarks = [];
      console.log('runOnBackground  runGetReleasedAssetsBitmarksInBackground success');
    }).catch(error => {
      console.log('runOnBackground  runGetReleasedAssetsBitmarksInBackground error :', error);
      queueGetReleasedAssetsBitmarks.forEach(queueResolve => queueResolve());
      queueGetReleasedAssetsBitmarks = [];
    });
  });
};

const runGetUserBitmarks = async () => {
  await runGetReleasedAssetsBitmarksInBackground();
  console.log('runGetReleasedAssetsBitmarksInBackground :', (Date.now() - global.start) / 1000);
  await runGetAssetsBitmarksInBackground();
  console.log('runGetAssetsBitmarksInBackground :', (Date.now() - global.start) / 1000);
};

const doReloadUserAssetsBitmarks = async () => {
  return await runGetAssetsBitmarksInBackground();
};

const doReloadUserReleasedAssetsBitmarks = async () => {
  return await runGetReleasedAssetsBitmarksInBackground();
};

const doDownloadBitmark = async (bitmark) => {
  let assetsBitmarks = await doGetLocalAssetsBitmarks();
  let asset = (assetsBitmarks.assets || {})[bitmark.asset_id];
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.asset_id}`;

  if ((await FileUtil.exists(`${assetFolderPath}/decrypting`)) &&
    (await FileUtil.readDir(`${assetFolderPath}/decrypting`)).length > 0 &&
    (await FileUtil.readDir(`${assetFolderPath}/decrypting_session_data`)).length > 0) {

    let downloadResult = JSON.parse(await FileUtil.readFile(`${assetFolderPath}/decrypting_session_data/data.text`));
    let filename = decodeURIComponent(downloadResult.filename);
    await FileUtil.mkdir(`${assetFolderPath}/downloaded`);
    let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(downloadResult.sender);
    await BitmarkSDK.decryptFile(`${assetFolderPath}/decrypting/${filename}`, downloadResult, encryptionPublicKey, `${assetFolderPath}/downloaded/${filename}`);
    await FileUtil.removeSafe(`${assetFolderPath}/decrypting`);
    await FileUtil.removeSafe(`${assetFolderPath}/decrypting_session_data`);
    asset.filePath = `${assetFolderPath}/downloaded/${filename}`;
    await _doCheckNewAssetsBitmarks(assetsBitmarks);
    return `${assetFolderPath}/downloaded/${filename}`;
  }

  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(`${assetFolderPath}/downloading`);
  let downloadableAssets = await BitmarkService.doGetDownloadableAssets();
  let canDownloadFrom = (downloadableAssets || []).find(item => item.indexOf(asset.id) >= 0);
  let sender = canDownloadFrom ? canDownloadFrom.substring(canDownloadFrom.lastIndexOf('/') + 1, canDownloadFrom.length) : null;
  if (!sender) {
    throw new Error('Cannot detect sender to download!');
  }
  let downloadResult = await BitmarkService.doDownloadFileToCourierServer(asset.id, sender, `${assetFolderPath}/downloading/temp.encrypt`);
  let filename = decodeURIComponent(downloadResult.filename);
  let downloadResultFilePath = `${assetFolderPath}/decrypting_session_data/data.text`;
  await FileUtil.mkdir(`${assetFolderPath}/decrypting_session_data`);
  await FileUtil.writeFile(downloadResultFilePath, JSON.stringify(downloadResult));
  await FileUtil.mkdir(`${assetFolderPath}/decrypting`);
  await FileUtil.moveFileSafe(`${assetFolderPath}/downloading/temp.encrypt`, `${assetFolderPath}/decrypting/${filename}`);
  await FileUtil.removeSafe(`${assetFolderPath}/downloading`);


  await FileUtil.mkdir(`${assetFolderPath}/downloaded`);
  let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(sender);
  await BitmarkSDK.decryptFile(`${assetFolderPath}/decrypting/${filename}`, downloadResult, encryptionPublicKey, `${assetFolderPath}/downloaded/${filename}`);
  await FileUtil.removeSafe(`${assetFolderPath}/decrypting`);
  await FileUtil.removeSafe(`${assetFolderPath}/decrypting_session_data`);
  asset.filePath = `${assetFolderPath}/downloaded/${filename}`;
  await _doCheckNewAssetsBitmarks(assetsBitmarks);
  return `${assetFolderPath}/downloaded/${filename}`;
};

const doGetLocalAssetsBitmarks = async () => {
  return (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
};

const doGetLocalReleasedAssetsBitmarks = async () => {
  return (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_RELEASED_ASSETS_BITMARKS)) || {};
};

const doIssueFile = async (filePath, assetName, metadataList, quantity) => {
  let result = await BitmarkService.doIssueFile(CacheData.userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity);

  let appInfo = await CommonProcessor.doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (appInfo.lastTimeIssued - moment().toDate().getTime()) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'registry_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  await doReloadUserAssetsBitmarks();
  return result;
};

const doIssueMusic = async (filePath, assetName, metadataList, thumbnailPath, limitedEdition) => {
  let result = await BitmarkService.doIssueMusic(CacheData.userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, thumbnailPath, limitedEdition);

  let appInfo = await CommonProcessor.doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (appInfo.lastTimeIssued - moment().toDate().getTime()) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'registry_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  await doReloadUserAssetsBitmarks();
  return result;
};

const doGetAssetBitmark = async (bitmarkId, assetId) => {
  let assetsBitmarks = await doGetLocalAssetsBitmarks();
  let bitmark = (assetsBitmarks.bitmarks || {})[bitmarkId];
  assetId = assetId || (bitmark ? bitmark.asset_id : null);
  let asset = (assetsBitmarks.assets || {})[assetId];
  return { bitmark, asset };
};

const doUpdateViewStatus = async (bitmarkId) => {
  if (bitmarkId) {
    let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || [];
    assetsBitmarks.bitmarks[bitmarkId].isViewed = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS, assetsBitmarks);

    let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
    bottomTabStoreState.totalNewBitmarks = Object.values(assetsBitmarks.bitmarks || {}).find(bitmark => !bitmark.isViewed).length;
    BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

    PropertiesStore.dispatch(PropertiesActions.updateBitmarks({
      bitmarks: Object.values(assetsBitmarks.bitmarks || {}),
      assets: assetsBitmarks.assets,
    }));
  }
};

let BitmarkProcessor = {
  runGetUserBitmarks,
  doReloadUserAssetsBitmarks,
  doReloadUserReleasedAssetsBitmarks,

  doGetLocalAssetsBitmarks,
  doGetLocalReleasedAssetsBitmarks,
  doGetAssetBitmark,

  doDownloadBitmark,
  doIssueFile,
  doIssueMusic,

  doUpdateViewStatus,
};

export { BitmarkProcessor };