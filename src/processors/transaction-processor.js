import moment from 'moment';
import { merge } from 'lodash';

import { TransactionService, NotificationService, BitmarkService } from './services';
import { CacheData } from './caches';
import { BitmarkModel, IftttModel, CommonModel, } from './models';
import { TransactionsStore, TransactionsActions, BottomTabStore, BottomTabActions, AccountStore, AccountActions } from 'src/views/stores';

const TransactionHistoryTypes = {
  issuance: {
    title: 'ISSUANCE',
    type: '',
  },
  transfer: {
    title: 'SEND',
    type: 'P2P TRANSFER'
  },
  claim_request: {
    title: 'CLAIM REQUEST',
    type: '',
  }
};
const _doGenerateTransactionHistoryData = async (outgoingClaimRequest) => {
  let transactions = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || [];

  let completed = [];
  if (transactions) {
    transactions.forEach((item) => {
      let title = TransactionHistoryTypes.issuance.title;
      let type = TransactionHistoryTypes.issuance.title.type;
      let to = item.to;
      let status = item.status;
      let mapIssuance = [];

      if (item.to) {
        title = TransactionHistoryTypes.transfer.title;
        type = TransactionHistoryTypes.transfer.type;
      }

      if (title === TransactionHistoryTypes.issuance.title) {
        if (mapIssuance[item.assetId] && mapIssuance[item.assetId][item.blockNumber]) {
          return;
        }
        if (!mapIssuance[item.assetId]) {
          mapIssuance[item.assetId] = {};
        }
        mapIssuance[item.assetId][item.blockNumber] = true;
      }

      completed.push({
        title,
        type,
        to,
        status,
        assetId: item.assetId,
        blockNumber: item.blockNumber,
        key: completed.length,
        timestamp: item.timestamp,
        txid: item.txid,
        previousId: item.previousId,
        assetName: item.assetName,
        from: item.from,
      });
    });
  }

  outgoingClaimRequest = outgoingClaimRequest || ((await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST)).outgoing_claim_requests) || [];
  outgoingClaimRequest.forEach(item => {
    completed.push({
      title: TransactionHistoryTypes.claim_request.title,
      type: TransactionHistoryTypes.claim_request.type,
      outgoingClaimRequest: item,
      timestamp: item.created_at
    });
  });

  completed = completed ? completed.sort((a, b) => {
    if (!a || !a.timestamp) return -1;
    if (!b || !b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : [];
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY, completed);

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.totalCompleted = completed.length;
  transactionStoreState.completed = completed.slice(0, Math.min(completed.length, Math.max(transactionStoreState.actionRequired.length, 20)));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
  console.log('completed :', completed);
  return { completed };
};

const TransactionActionRequireTypes = {
  transfer: 'transfer',
  claim_request: 'claim_request',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase',
};
const _doGenerateTransactionActionRequiredData = async (incomingClaimRequests) => {
  let actionRequired = [];
  let totalTasks = 0;
  let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
  if (transferOffers.incomingTransferOffers) {
    (transferOffers.incomingTransferOffers || []).forEach((item) => {
      if (item.status === 'open') {
        actionRequired.push({
          key: actionRequired.length,
          transferOffer: item,
          type: TransactionActionRequireTypes.transfer,
          typeTitle: global.i18n.t("DataProcessor_signToReceiveBitmark"),
          timestamp: moment(item.created_at),
        });
        totalTasks++;
      }
    });
  }

  let iftttInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION)) || {};
  if (iftttInformation && iftttInformation.bitmarkFiles) {
    iftttInformation.bitmarkFiles.forEach(item => {
      item.key = actionRequired.length;
      item.type = TransactionActionRequireTypes.ifttt;
      item.typeTitle = global.i18n.t("DataProcessor_issuanceRequest");
      item.timestamp = item.assetInfo.timestamp;
      actionRequired.push(item);
      totalTasks++;
    });
  }

  incomingClaimRequests = incomingClaimRequests || (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST).incoming_claim_requests) || [];
  if (incomingClaimRequests && incomingClaimRequests.length > 0) {
    let mapCount = {};
    (incomingClaimRequests || []).forEach((incomingClaimRequest) => {
      if (incomingClaimRequest.status === 'pending') {
        mapCount[incomingClaimRequest.asset.id] = mapCount[incomingClaimRequest.asset.id] ? (mapCount[incomingClaimRequest.asset.id] + 1) : 1;
        incomingClaimRequest.index = incomingClaimRequest.asset.editions[CacheData.userInformation.bitmarkAccountNumber].limited -
          incomingClaimRequest.asset.editions[CacheData.userInformation.bitmarkAccountNumber].totalEditionLeft + mapCount[incomingClaimRequest.asset.id],
          actionRequired.push({
            key: actionRequired.length,
            incomingClaimRequest: incomingClaimRequest,
            type: TransactionActionRequireTypes.claim_request,
            typeTitle: global.i18n.t("DataProcessor_signToTransferBitmark"),
            timestamp: moment(incomingClaimRequest.created_at),
          });
        totalTasks++;
      }
    });
  }

  actionRequired = actionRequired ? actionRequired.sort((a, b) => {
    if (a.important) { return -1; }
    if (b.important) { return 1; }
    if (!a.timestamp) return -1;
    if (!b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : actionRequired;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED, actionRequired);
  // Add "Write Down Your Recovery Phrase" action required which was created when creating account if any
  let testRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
  if (testRecoveryPhaseActionRequired) {
    actionRequired.unshift({
      key: actionRequired.length,
      type: TransactionActionRequireTypes.test_write_down_recovery_phase,
      typeTitle: global.i18n.t("DataProcessor_securityAlert"),
      timestamp: moment(new Date(testRecoveryPhaseActionRequired.timestamp)),
    });

    totalTasks += 1;
  }

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.totalTasks = totalTasks;
  transactionStoreState.totalActionRequired = actionRequired.length;
  transactionStoreState.actionRequired = actionRequired.slice(0, Math.min(actionRequired.length, Math.max(transactionStoreState.actionRequired.length, 20)));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));

  let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
  bottomTabStoreState.totalTasks = totalTasks;
  BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

  console.log('actionRequired :', actionRequired);
  NotificationService.setApplicationIconBadgeNumber(totalTasks || 0);
};

const _doCheckNewTransfers = async (transactions) => {
  if (transactions) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, transactions);
    await _doGenerateTransactionHistoryData();
  }
};

const _doCheckTransferOffers = async (transferOffers, isLoadingOtherData) => {
  if (transferOffers) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, transferOffers);
    if (!isLoadingOtherData) {
      await _doGenerateTransactionActionRequiredData();
    }
  }
};

const _doCheckNewIftttInformation = async (iftttInformation, isLoadingOtherData) => {
  if (iftttInformation) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION, iftttInformation);

    let accountStoreState = merge({}, AccountStore.getState().data);
    accountStoreState.iftttInformation = iftttInformation;
    AccountStore.dispatch(AccountActions.init(accountStoreState));

    if (!isLoadingOtherData) {
      await _doGenerateTransactionActionRequiredData();
    }
  }
};

// ============================================================================================================================================
// ============================================================================================================================================
// ============================================================================================================================================
// ============================================================================================================================================

let queueGetTransferOffer = [];
const runGetTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransferOffer.push(resolve);
    if (queueGetTransferOffer.length > 1) {
      return;
    }
    TransactionService.doGetAllTransferOffers(CacheData.userInformation.bitmarkAccountNumber).then(transferOffers => {
      console.log('runOnBackground  runGetTransferOfferInBackground success');
      queueGetTransferOffer.forEach(queueResolve => queueResolve(transferOffers));
      queueGetTransferOffer = [];
    }).catch(error => {
      queueGetTransferOffer.forEach(queueResolve => queueResolve());
      queueGetTransferOffer = [];
      console.log('runOnBackground  runGetTransferOfferInBackground error :', error);
    });
  });
};

let queueGetClaimRequests = [];
const runGetClaimRequestInBackground = () => {
  return new Promise((resolve) => {
    queueGetClaimRequests.push(resolve);
    if (queueGetClaimRequests.length > 1) {
      return;
    }
    BitmarkModel.doGetClaimRequest(CacheData.jwt).then(claimRequests => {
      console.log('runOnBackground  runGetClaimRequestInBackground success', claimRequests);
      queueGetClaimRequests.forEach(queueResolve => queueResolve(claimRequests));
      queueGetClaimRequests = [];
    }).catch(error => {
      queueGetClaimRequests.forEach(queueResolve => queueResolve());
      queueGetClaimRequests = [];
      console.log('runOnBackground  runGetClaimRequestInBackground error :', error);
    });
  });
};

let queueGetIFTTTInformation = [];
const runGetIFTTTInformationInBackground = () => {
  return new Promise((resolve) => {
    queueGetIFTTTInformation.push(resolve);
    if (queueGetIFTTTInformation.length > 1) {
      return;
    }
    IftttModel.doGetIFtttInformation(CacheData.userInformation.bitmarkAccountNumber).then(iftttInformation => {
      console.log('runOnBackground  runGetIFTTTInformationInBackground success');
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve(iftttInformation));
      queueGetIFTTTInformation = [];
    }).catch(error => {
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve());
      queueGetIFTTTInformation = [];
      console.log('runOnBackground  runGetIFTTTInformationInBackground error :', error);
    });
  });
};

let queueGetTransfers = [];
const runGetTransfersInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransfers.push(resolve);
    if (queueGetTransfers.length > 1) {
      return;
    }

    let doGetAllTransactions = async () => {
      let oldTransactions, lastOffset;
      let canContinue = true;
      while (canContinue) {
        let data = await TransactionService.doGet100Transactions(CacheData.userInformation.bitmarkAccountNumber, oldTransactions, lastOffset);
        canContinue = !!data;
        if (data) {
          oldTransactions = data.transactions;
          lastOffset = data.lastOffset;
          await _doCheckNewTransfers(oldTransactions);
        }
      }
      oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
      await _doCheckNewTransfers(oldTransactions);
    };

    doGetAllTransactions().then(() => {
      console.log('runOnBackground  runGetTransactionsHistoryInBackground success');
      queueGetTransfers.forEach(queueResolve => queueResolve());
      queueGetTransfers = [];
    }).catch(error => {
      queueGetTransfers.forEach(queueResolve => queueResolve());
      queueGetTransfers = [];
      console.log('runOnBackground  runGetTransactionsHistoryInBackground error :', error);
    });
  });
};

const _doCheckClaimRequests = async (claimRequests) => {
  if (claimRequests) {
    let releasedBitmarksAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_RELEASED_ASSETS_BITMARKS)) || {};
    releasedBitmarksAssets.assets = releasedBitmarksAssets.assets || {};
    for (let incomingClaimRequest of claimRequests.incoming_claim_requests) {
      incomingClaimRequest.asset = releasedBitmarksAssets.assets[incomingClaimRequest.asset_id];
    }
    for (let outgoingClaimRequest of claimRequests.outgoing_claim_requests) {
      outgoingClaimRequest.asset = await BitmarkModel.doGetAssetInformation(outgoingClaimRequest.asset_id);
    }
    claimRequests.incoming_claim_requests = (claimRequests.incoming_claim_requests || []).sort((a, b) => moment(a.created_at).toDate().getTime() - moment(b.created_at).toDate().getTime());
    claimRequests.outgoing_claim_requests = (claimRequests.outgoing_claim_requests || []).sort((a, b) => moment(a.created_at).toDate().getTime() - moment(b.created_at).toDate().getTime());
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST, claimRequests);
    await _doGenerateTransactionActionRequiredData(claimRequests.incoming_claim_requests);
    await _doGenerateTransactionHistoryData(claimRequests.outgoing_claim_requests);
  }
}

const runGetTransactionsInBackground = async () => {
  let runParallel = () => {
    return new Promise((resolve) => {
      Promise.all([
        runGetTransferOfferInBackground(),
        runGetIFTTTInformationInBackground(),
      ]).then(resolve);
    });
  };
  let parallelResults = await runParallel();
  await _doCheckTransferOffers(parallelResults[0], true);
  await _doCheckNewIftttInformation(parallelResults[1], true);

  await runGetTransfersInBackground();
  let claimRequests = await runGetClaimRequestInBackground();
  await _doCheckClaimRequests(claimRequests);
};



const doGetIftttInformation = async () => {
  return (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION)) || {};
};

const doReloadIftttInformation = async () => {
  let result = await runGetIFTTTInformationInBackground();
  await _doCheckNewIftttInformation(result);
};

const doReloadTransferOffers = async () => {
  let result = await runGetTransferOfferInBackground();
  await _doCheckTransferOffers(result);
};

const doReloadClaimRequests = async () => {
  let result = await runGetClaimRequestInBackground();
  await _doCheckClaimRequests(result);
  return result;
};

const doReloadTransfers = async () => {
  let result = await runGetTransfersInBackground();
  await _doCheckNewTransfers(result);
};

const doRevokeIftttToken = async () => {
  let signatureData = await CommonModel.doCreateSignatureData();
  let iftttInformation = await IftttModel.doRevokeIftttToken(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await _doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doGetAllTransfersOffers = async () => {
  let { actionRequired } = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
  let transferOffers = [];
  for (let item of actionRequired) {
    if (item.type === TransactionActionRequireTypes.transfer) {
      transferOffers.push(item.transferOffer);
    }
  }
  return transferOffers;
};

const doAddMoreActionRequired = async (currentLength) => {
  currentLength = currentLength || 0;
  let allActionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.actionRequired = allActionRequired.slice(0, Math.min(allActionRequired.length, currentLength + 20));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
};

const doAddMoreCompleted = async (currentLength) => {
  currentLength = currentLength || 0;
  let allCompleted = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.completed = allCompleted.slice(0, Math.min(allCompleted.length, currentLength + 20));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
};

const doGetProvenance = (bitmarkId) => {
  return new Promise((resolve) => {
    BitmarkService.doGetProvenance(bitmarkId).then(resolve).catch(error => {
      console.log('doGetProvenance error:', error);
      resolve([]);
    });
  });
};

const doRemoveTestRecoveryPhaseActionRequiredIfAny = async () => {
  let testWriteRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
  if (testWriteRecoveryPhaseActionRequired) {
    await CommonModel.doRemoveLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
    await _doGenerateTransactionActionRequiredData();
  }
};

const doGetAssetToClaim = async (assetId, issuer) => {
  let asset = await BitmarkModel.doGetAssetInformation(assetId);
  issuer = issuer || asset.registrant;
  let allIssuedBitmarks = await BitmarkModel.getAllBitmarksOfAssetFromIssuer(issuer, asset.id);

  asset.editions = asset.editions || {};
  asset.editions[issuer] = asset.editions[issuer] || {};
  asset.editions[issuer].totalEditionLeft = allIssuedBitmarks.filter(bitmark => bitmark.owner === issuer).length - 1;
  asset.editions[issuer].limited = allIssuedBitmarks.length - 1;

  // get limited edition via profile server
  // let resultGetLimitedEdition = await BitmarkModel.doGetLimitedEdition(asset.registrant, asset.id);
  // if (resultGetLimitedEdition) {
  //   asset.editions[issuer].limited = resultGetLimitedEdition.limited;
  // }
  asset.registrantName = CacheData.identities[asset.registrant] ? CacheData.identities[asset.registrant].name : '';
  return asset;
};





let TransactionProcessor = {
  TransactionActionRequireTypes,
  TransactionHistoryTypes,

  runGetTransactionsInBackground,

  doCheckNewIftttInformation: _doCheckNewIftttInformation,
  doReloadTransferOffers,
  doGetAllTransfersOffers,

  doReloadTransfers,
  doGetProvenance,

  doReloadClaimRequests,
  doGetAssetToClaim,

  doReloadIftttInformation,
  doGetIftttInformation,
  doRevokeIftttToken,

  doAddMoreActionRequired,
  doAddMoreCompleted,

  doRemoveTestRecoveryPhaseActionRequiredIfAny,

};

export { TransactionProcessor };