import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/Colors';

export default function SetlistsScreen() {
  return (
    <View style={styles.container}>
      <PageHeader subtitle="SETLISTS" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Setlists coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 16,
    color: Colors.graphite,
  },
});
