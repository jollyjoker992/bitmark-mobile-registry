import { StyleSheet, } from 'react-native';
import { convertWidth } from 'src/utils';


export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  threeDotIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 15,
  },
  content: {
    flexDirection: 'column',
  },
  topArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 147,
    width: convertWidth(375),
  },
  assetImage: {
    height: 130,
    width: convertWidth(130),
    resizeMode: 'contain',
    marginLeft: convertWidth(19),
    marginTop: 17,
  },
  thumbnailImage: {
    width: 73, height: 73, resizeMode: 'cover',
    marginLeft: convertWidth(19),
    marginTop: 29,
  },
  topButtonsArea: {
    position: 'absolute',
    top: 3,
    right: 0,
    zIndex: 10,
    width: 198,
    backgroundColor: '#F5F5F5',
    shadowColor: 'black',
    shadowOffset: { height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  downloadAssetButton: {
    width: '100%',
    minHeight: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  downloadAssetButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    color: '#0060F2',
    textAlign: 'right',
  },
  topButton: {
    width: '100%',
    minHeight: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  topButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    color: '#0060F2',
    textAlign: 'right',
  },
  copiedAssetIddButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 8,
    color: '#0060F2',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  bottomImageBar: {
    borderWidth: 2,
    width: convertWidth(130),
    marginLeft: convertWidth(19),
  },
  assetName: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    marginLeft: convertWidth(19),
    marginTop: 34,
  },
  assetCreateAt: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    marginLeft: convertWidth(19),
    height: 29,
    width: convertWidth(337),
  },
  bottomAssetNameBar: {
    borderWidth: 1,
    width: convertWidth(130),
    marginLeft: convertWidth(19),
  },

  metadataArea: {
    marginTop: 26,
    flexDirection: 'column',
  },
  metadataItem: {
    width: convertWidth(340),
    flexDirection: 'row',
    marginLeft: convertWidth(19),
  },
  metadataItemLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '900',
    color: '#0060F2',
    width: convertWidth(117),
    marginTop: 1,
  },
  metadataItemValue: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '400',
    width: convertWidth(196),
    marginLeft: convertWidth(22),
  },

  assetPreview: {
    marginTop: 15,
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    height: 125
  },


  provenanceLabel: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: convertWidth(19),
    marginTop: 19,
  },
  provenancesArea: {
  },
  provenancesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    width: convertWidth(337),
    marginLeft: convertWidth(19),
    marginTop: 19,
    marginBottom: 9,
  },
  provenancesHeaderLabelTimestamp: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    marginLeft: convertWidth(4),
    width: convertWidth(170),
  },
  provenancesHeaderLabelOwner: {
    marginLeft: 10,
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(161),
  },
  provenanceListArea: {
    flexDirection: 'column',
  },
  provenancesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(340),
    paddingLeft: convertWidth(23),
    height: 36,
    paddingTop: 10,
    paddingBottom: 10,
  },
  provenancesNotView: {
    backgroundColor: '#0060F2',
    width: 10, height: 10,
    position: 'absolute', left: convertWidth(9), top: 12,
    borderWidth: 1, borderRadius: 5, borderColor: '#0060F2'
  },
  provenancesRowTimestamp: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(170),
  },
  provenancesRowOwnerRow: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  provenancesRowOwnerBound: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 14,
  },
  provenancesRowOwner: {
    fontFamily: 'Andale Mono',
    fontWeight: '500',
    fontSize: 14,
    width: convertWidth(161),
  },
  listingButtonArea: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 37,
  },
  listingButton: {
    width: convertWidth(337),
    backgroundColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  listingButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 14,
    color: 'white',
  },
});