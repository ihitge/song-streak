import { Text, View } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/Colors';

export default function PracticeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.matteFog }}>
      <PageHeader subtitle="STREAK" />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Practice Streak Screen</Text>
      </View>
    </View>
  );
}