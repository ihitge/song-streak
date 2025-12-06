import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

export const ProcessingSignal: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.vermilion} />
      <Text style={styles.text}>Processing Signal...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  text: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
