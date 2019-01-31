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
        playlink: 'playlink',
      },
      values: {
        music: 'music'
      }
    },
    MetadataLabelForMusic: [
      'performer',
      'genre',
      'isrc',
      'producer',
      'composer',
      'copyright',
      'playlink',
    ],
    NormalMetadataLabel: [
      'created (date)', 'contributor', 'coverage', 'creator',
      'description', 'dimensions', 'duration', 'edition',
      'format', 'identifier', 'language', 'license',
      'medium', 'publisher', 'relation', 'rights',
      'size', 'source', 'subject', 'keywords',
      'type', 'version'],
  },
  indicators: {
    processing: 'processing',
    success: 'success',
    searching: 'searching',
  }
};

let constant = merge({}, commonConstant, Platform.select({ ios: iosConstant, android: androidConstant }));

export { constant };
