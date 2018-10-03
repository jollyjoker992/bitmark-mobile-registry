import React, { Component } from 'react';
import { Router, Stack, Scene, Modal, Tabs } from 'react-native-router-flux';

import { BitmarkWebViewComponent } from './../../commons/components';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  LocalIssueFileEditLabelComponent,
  IftttActiveComponent,
  AssetTypeHelpComponent,
} from './properties';

import { TransactionDetailComponent, TransactionsComponent } from './transactions';
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




export class UserRouterComponent extends Component {
  render() {

    return (
      <Router >
        <Modal headerMode='none'>
          <Stack key="user" headerMode='none' wrapRouter={true} >
            <Scene key="bitmarkWebView" panHandlers={null} component={BitmarkWebViewComponent} />
            <Scene key="transactionDetail" panHandlers={null} component={TransactionDetailComponent} />

            <Tabs key="userTab" panHandlers={null} initial={true} tabBarComponent={BottomTabsComponent}>
              <Stack key="properties" panHandlers={null} initial={true} >
                <Scene key="assets" initial={true} panHandlers={null} component={AssetsComponent} />
                <Scene key="issuanceOptions" panHandlers={null} component={IssuanceOptionsComponent} />
                <Scene key="iftttActive" panHandlers={null} component={IftttActiveComponent} />
                <Scene key="localIssueFile" panHandlers={null} component={LocalIssueFileComponent} />
                <Scene key="localIssueFileEditLabel" panHandlers={null} component={LocalIssueFileEditLabelComponent} />
                <Scene key="assetTypeHelp" panHandlers={null} component={AssetTypeHelpComponent} />
                <Scene key="localAssetDetail" panHandlers={null} component={LocalAssetDetailComponent} />
                <Scene key="localPropertyDetail" panHandlers={null} component={LocalPropertyDetailComponent} />
                <Scene key="localPropertyTransfer" panHandlers={null} component={LocalPropertyTransferComponent} />


              </Stack>
              <Scene key="transactions" panHandlers={null} component={TransactionsComponent} />
              <Stack key="account" headerMode='none'>
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


            {/* <Scene key="user" panHandlers={null} component={UserComponent} />
            <Scene key="newAccount" panHandlers={null} component={BitmarkWebViewComponent} />
            
            <Scene key="notification" panHandlers={null} component={LocalPropertyTransferComponent} />
            
            
            <Scene key="faceTouchId" panHandlers={null} component={LocalIssueFileEditLabelComponent} />
            <Scene key="faceTouchId" panHandlers={null} component={TransactionDetailComponent} />
            <Scene key="faceTouchId" panHandlers={null} component={IftttActiveComponent} />
            <Scene key="faceTouchId" panHandlers={null} component={LocalPropertyDetailComponent} /> */}
          </Stack>
        </Modal>
      </Router>
    );
  }
}
