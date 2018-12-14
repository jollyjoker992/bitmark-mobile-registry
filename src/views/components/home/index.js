import React, { Component } from 'react';
import { Router, Stack, Scene, Modal, Tabs, Actions } from 'react-native-router-flux';

import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  LocalIssueFileEditLabelComponent,
  IftttActiveComponent,
  AssetTypeHelpComponent,
} from './properties';

import {
  TransactionsComponent,
  TransferOfferComponent,
  ClaimRequestComponent
} from './transactions';
import { AssetsComponent } from './properties/assets.component';
import { BottomTabsComponent } from './bottom-tabs/bottom-tabs.component';
import { AccountDetailComponent } from './account/account.component';
import { ScanQRCodeComponent } from './account/scan-qr-code/scan-qr-code.component';
import { ApplicationDetailComponent } from './account/application-detail/application-detail.component';
import {
  RecoveryPhraseComponent, WriteDownRecoveryPhraseComponent, TryRecoveryPhraseComponent
} from './account/account-recovery/account-recovery.component';
import { WebAccountMigrateComponent } from './account/web-account/migrate/migrate.component';
import { WebAccountSignInComponent } from './account/web-account/sign-in/sign-in.component';
import { IssuanceOptionsComponent } from './properties/local-issuance/issuance-options/issuance-options.component';
import { WhatNewComponent } from './account/what-new.component';
import {
  MusicBasicInfoComponent,
  MusicFileChosenComponent,
  MusicIssueSuccessComponent,
  MusicMetadataComponent,
  MusicMetadataEditComponent,
  MusicSentClaimRequestComponent,
} from './properties/local-issue-music';

import { BitmarkWebViewComponent } from 'src/views/commons';
import { EventEmitterService, DataProcessor, AppProcessor } from 'src/processors';

import PushNotification from 'react-native-push-notification';

let ComponentName = 'UserRouterComponent';
export class UserRouterComponent extends Component {
  constructor(props) {
    super(props);

    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);
    EventEmitterService.remove(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, null, ComponentName);
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification, ComponentName);
    DataProcessor.setMountedRouter();
    setTimeout(() => {
      PushNotification.localNotification({
        message: 'test message',
        userInfo: {
          name: 'claim_request',
          claim_id: '7afea9e5-6ea0-4af8-b56e-79218a57eaf3',
        }
      });
    }, 3000);
  }

  componentWillUnmount() {
    EventEmitterService.on(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification, ComponentName);
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.name === 'transfer_request' && data.id) {
      AppProcessor.doGetTransferOfferDetail(data.id).then(transferOfferDetail => {
        Actions.transferOffer({ transferOffer: transferOfferDetail, });
      }).catch(console.log);

    } else if (data.name === 'transfer_rejected') {
      DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id).then(bitmarkInformation => {
        Actions.localPropertyDetail(bitmarkInformation);
      }).catch(console.log);

    } else if (data.name === 'transfer_completed' || data.name === 'transfer_accepted') {
      Actions.transactions({ subTab: 'HISTORY' });

    } else if (data.name === 'transfer_confirmed_receiver' && data.bitmark_id) {
      DataProcessor.doReloadLocalBitmarks().then(() => {
        return DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id);
      }).then(bitmarkInformation => {
        Actions.localPropertyDetail(bitmarkInformation);
      }).catch(console.log);

    } else if (data.name === 'transfer_failed') {
      DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id).then(bitmarkInformation => {
        Actions.localPropertyDetail(bitmarkInformation);
      }).catch(console.log);

    } else if (data.event === 'tracking_transfer_confirmed') {
      DataProcessor.doReloadTrackingBitmark().then(() => {
        return DataProcessor.doGetTrackingBitmarkInformation(data.bitmark_id);
      }).then(trackingBitmark => {
        Actions.localPropertyDetail({ asset: trackingBitmark.asset, bitmark: trackingBitmark });
      }).catch(console.log);
    } else if (data.event === 'claim_request') {
      DataProcessor.doReloadClaimAssetRequest().then((claimRequests) => {
        let claimRequest = (claimRequests || []).find(cr => cr.id = data.claim_id);
        Actions.claimRequest({ claimRequest });
      }).catch(console.log);
    }
  }

  render() {

    return (
      <Router >
        <Modal headerMode='none'>
          <Stack key="user" headerMode='none' wrapRouter={true} >
            <Scene key="bitmarkWebViewFull" panHandlers={null} component={BitmarkWebViewComponent} />
            <Scene key="transferOffer" panHandlers={null} component={TransferOfferComponent} />
            <Scene key="localIssueFile" panHandlers={null} component={LocalIssueFileComponent} />
            <Scene key="localIssueFileEditLabel" panHandlers={null} component={LocalIssueFileEditLabelComponent} />
            <Scene key="assetTypeHelp" panHandlers={null} component={AssetTypeHelpComponent} />
            <Scene key="localAssetDetail" panHandlers={null} component={LocalAssetDetailComponent} />
            <Scene key="localPropertyDetail" panHandlers={null} component={LocalPropertyDetailComponent} />
            <Scene key="localPropertyTransfer" panHandlers={null} component={LocalPropertyTransferComponent} />
            <Scene key="whatNew" panHandlers={null} component={WhatNewComponent} />

            <Scene key="claimRequest" panHandlers={null} component={ClaimRequestComponent} />
            <Scene key="musicBasicInfo" panHandlers={null} component={MusicBasicInfoComponent} />
            <Scene key="musicFileChosen" panHandlers={null} component={MusicFileChosenComponent} />
            <Scene key="musicIssueSuccess" panHandlers={null} component={MusicIssueSuccessComponent} />
            <Scene key="musicMetadata" panHandlers={null} component={MusicMetadataComponent} />
            <Scene key="musicMetadataEdit" panHandlers={null} component={MusicMetadataEditComponent} />
            <Scene key="musicSentClaimRequest" panHandlers={null} component={MusicSentClaimRequestComponent} />

            <Tabs key="userTab" panHandlers={null} initial={true} tabBarComponent={BottomTabsComponent} wrap={false} >
              <Stack key="properties" panHandlers={null} initial={true} >
                <Scene key="assets" initial={true} panHandlers={null} component={AssetsComponent} />
                <Scene key="issuanceOptions" panHandlers={null} component={IssuanceOptionsComponent} />
                <Scene key="iftttActive" panHandlers={null} component={IftttActiveComponent} />
              </Stack>
              <Scene key="transactions" panHandlers={null} component={TransactionsComponent} />
              <Stack key="account" headerMode='none'>
                <Scene key="bitmarkWebView" panHandlers={null} component={BitmarkWebViewComponent} />
                <Scene key="accountDetail" initial={true} panHandlers={null} component={AccountDetailComponent} />
                <Scene key="scanQRCode" panHandlers={null} component={ScanQRCodeComponent} />
                <Scene key="applicationDetail" panHandlers={null} component={ApplicationDetailComponent} />
                <Scene key="recoveryPhrase" panHandlers={null} component={RecoveryPhraseComponent} />
                <Scene key="writeDownRecoveryPhrase" panHandlers={null} component={WriteDownRecoveryPhraseComponent} />
                <Scene key="tryRecoveryPhrase" panHandlers={null} component={TryRecoveryPhraseComponent} />
                <Scene key="tryRecoveryPhrase" panHandlers={null} component={TryRecoveryPhraseComponent} />
                <Scene key="webAccountMigrate" panHandlers={null} component={WebAccountMigrateComponent} />
                <Scene key="webAccountSignIn" panHandlers={null} component={WebAccountSignInComponent} />
                <Scene key="iftttActive" panHandlers={null} component={IftttActiveComponent} />
              </Stack>
            </Tabs>
          </Stack>
        </Modal>
      </Router>
    );
  }
}
