import { supabase } from '@/utils/supabase/client';
import { useStyledAlert } from '@/hooks/useStyledAlert';

export const useSignOut = () => {
  const { showError } = useStyledAlert();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Sign Out Error', error.message);
    }
  };

  return { handleSignOut };
};
