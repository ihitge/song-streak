import { Alert } from 'react-native';
import { supabase } from '@/utils/supabase/client';

export const useSignOut = () => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  return { handleSignOut };
};
