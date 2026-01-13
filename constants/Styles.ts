import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const Typography = StyleSheet.create({
  // App branding
  appLogo: {
    fontFamily: 'MomoTrustDisplay',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: Colors.charcoal,
    marginBottom: 4,
  },

  // Song card typography
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
  },
  songArtist: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },

  // Labels and meta text
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.vermilion,
  },
  metaText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },
});
