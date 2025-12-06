import { Text, View } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/Colors';

export default function TimingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.matteFog }}>
      <PageHeader subtitle="METRONOME" />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Timing Machine Screen</Text>
      </View>
    </View>
  );
}