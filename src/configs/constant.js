import { Platform } from 'react-native';
import { merge } from 'lodash';

import { iosConstant } from './ios-constant';
import { androidConstant } from './android-constant';

let commonConstant = {
  asset: {
    metadata: {
      labels: {
        type: 'type',
        description: 'description',
      },
      values: {
        music: 'music'
      }
    },
    MetadataLabelSamples: [
      'Type',
      'Description',
      'Artist',
      'Version',
      'Lyrics',
      'Genre',
      'ISRC',
      'Producer',
      'Composer',
      'Sound recording copyright',
    ],
  },
  indicators: {
    processing: 'processing',
    success: 'success',
    searching: 'searching',
  }
};

let constant = merge({}, commonConstant, Platform.select({ ios: iosConstant, android: androidConstant }));

export { constant };
