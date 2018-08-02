import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
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

import { TransactionDetailComponent } from './transactions';

let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  LocalPropertyTransfer: { screen: LocalPropertyTransferComponent, },
  LocalIssueFile: { screen: LocalIssueFileComponent, },
  AssetTypeHelp: { screen: AssetTypeHelpComponent },
  LocalIssueFileEditLabel: { screen: LocalIssueFileEditLabelComponent, },

  TransactionDetail: { screen: TransactionDetailComponent, },

  IftttActive: { screen: IftttActiveComponent, },

}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export { HomeComponent };