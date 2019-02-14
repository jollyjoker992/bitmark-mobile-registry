import React, { Component } from 'react';
import { Router, Stack, Scene, Modal, Tabs, Actions } from 'react-native-router-flux';

import {
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  LocalIssueFileEditLabelComponent,
  IftttActiveComponent,
  PropertiesComponent,
  ReleasedPropertiesComponent,
  PropertyDetailComponent,
} from './properties';

import {
  TransactionsComponent,
  TransferOfferComponent,
  IncomingClaimRequestComponent
} from './transactions';
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
} from './properties/local-issue-music';

import { BitmarkWebViewComponent } from 'src/views/commons';
import { EventEmitterService, AppProcessor, CommonProcessor, BitmarkProcessor, TransactionProcessor } from 'src/processors';

// import PushNotification from 'react-native-push-notification';
import { MusicReleaseToPublicComponent } from './properties/local-issue-music/music-release-to-public.component';
import { config } from 'src/configs';
// import { BitmarkProcessor } from 'src/processors/bitmark-processor';

let ComponentName = 'UserRouterComponent';
export class UserRouterComponent extends Component {
  constructor(props) {
    super(props);

    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);
    EventEmitterService.remove(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, null, ComponentName);
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification, ComponentName);
    CommonProcessor.setMountedRouter(true);
    // setTimeout(() => {
    //   PushNotification.localNotification({
    //     message: 'test message',
    //     userInfo: {
    //       event: 'claim_request',
    //       claim_id: 'ae965fff-fe33-46c7-9aae-70a1bc2ad539',
    //     }
    //   });
    // }, 3000);
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
      BitmarkProcessor.doGetAssetBitmark(data.bitmark_id).then(bitmarkInformation => {
        if (bitmarkInformation.asset && bitmarkInformation.bitmark) {
          Actions.propertyDetail(bitmarkInformation);
        }
      }).catch(console.log);
    } else if (data.name === 'transfer_completed' || data.name === 'transfer_accepted') {
      Actions.transactions({ subTab: 'HISTORY' });
    } else if (data.name === 'transfer_confirmed_receiver' && data.bitmark_id) {
      BitmarkProcessor.doReloadUserAssetsBitmarks().then(() => {
        return BitmarkProcessor.doGetAssetBitmark(data.bitmark_id);
      }).then(bitmarkInformation => {
        if (bitmarkInformation.asset && bitmarkInformation.bitmark) {
          Actions.propertyDetail(bitmarkInformation);
        }
      }).catch(console.log);
    } else if (data.name === 'transfer_failed') {
      BitmarkProcessor.doReloadUserAssetsBitmarks().then(() => {
        return BitmarkProcessor.doGetAssetBitmark(data.bitmark_id);
      }).then(bitmarkInformation => {
        if (bitmarkInformation.asset && bitmarkInformation.bitmark) {
          Actions.propertyDetail(bitmarkInformation);
        }
      }).catch(console.log);
    } else if (data.event === 'claim_request') {
      TransactionProcessor.doReloadClaimRequests().then((claimRequests) => {
        let incomingClaimRequest = (claimRequests.incoming_claim_requests || []).find(cr => cr.id === data.claim_id);
        if (incomingClaimRequest) {
          Actions.incomingClaimRequest({ incomingClaimRequest });
        }
      }).catch(console.log);
    } else if (data.event === 'claim_request_rejected') {
      Actions.transactions({ subTab: 'HISTORY' });
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
            <Scene key="localPropertyTransfer" panHandlers={null} component={LocalPropertyTransferComponent} />
            <Scene key="whatNew" panHandlers={null} component={WhatNewComponent} />

            <Scene key="incomingClaimRequest" panHandlers={null} component={IncomingClaimRequestComponent} />
            <Scene key="musicBasicInfo" panHandlers={null} component={MusicBasicInfoComponent} />
            <Scene key="musicFileChosen" panHandlers={null} component={MusicFileChosenComponent} />
            <Scene key="musicIssueSuccess" panHandlers={null} component={MusicIssueSuccessComponent} />
            <Scene key="musicMetadata" panHandlers={null} component={MusicMetadataComponent} />
            <Scene key="musicMetadataEdit" panHandlers={null} component={MusicMetadataEditComponent} />
            <Scene key="musicReleaseToPublic" panHandlers={null} component={MusicReleaseToPublicComponent} />
            <Scene key="propertyDetail" panHandlers={null} component={PropertyDetailComponent} />


            <Tabs key="userTab" panHandlers={null} initial={true} tabBarComponent={BottomTabsComponent} wrap={false} >
              <Stack key="properties" panHandlers={null} initial={true} >
                <Scene key="properties" initial={true} panHandlers={null} component={PropertiesComponent} />
                <Scene key="issuanceOptions" panHandlers={null} component={IssuanceOptionsComponent} />
                <Scene key="iftttActive" panHandlers={null} component={IftttActiveComponent} />
                <Scene key="releasedProperties" panHandlers={null} component={ReleasedPropertiesComponent} />
              </Stack>
              {config.isIPhone && <Scene key="transactions" panHandlers={null} component={TransactionsComponent} />}
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
