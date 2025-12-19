import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { useSignOut } from '@/hooks/useSignOut';

/**
 * Hook for handling account deletion
 * Required for Apple App Store compliance (Guideline 5.1.1(v))
 *
 * Uses Supabase RPC function `delete_user_account` which must be created
 * in Supabase with SECURITY DEFINER to allow users to delete their own data.
 */
export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showConfirm, showError, showSuccess } = useStyledAlert();
  const { handleSignOut } = useSignOut();

  const deleteAccount = useCallback(() => {
    showConfirm(
      'Delete Account',
      'This will permanently delete your account and all your data including:\n\n• Your song library\n• Practice history\n• Achievements\n• Band memberships\n\nThis action cannot be undone.',
      async () => {
        setIsDeleting(true);
        try {
          // Call the Supabase RPC function to delete the user account
          // This function must exist in Supabase with SECURITY DEFINER
          const { error } = await supabase.rpc('delete_user_account');

          if (error) {
            // Handle specific error cases
            if (error.message.includes('function') || error.code === '42883') {
              // Function doesn't exist yet - provide helpful message
              throw new Error(
                'Account deletion is not yet configured. Please contact support.'
              );
            }
            throw error;
          }

          // Show success message, then sign out
          showSuccess(
            'Account Deleted',
            'Your account and all associated data have been permanently deleted.',
            () => {
              handleSignOut();
            }
          );
        } catch (error: any) {
          console.error('Account deletion error:', error);
          showError(
            'Deletion Failed',
            error.message || 'Failed to delete account. Please try again or contact support.'
          );
        } finally {
          setIsDeleting(false);
        }
      },
      'Delete Forever',
      'Cancel',
      'error'
    );
  }, [showConfirm, showError, showSuccess, handleSignOut]);

  return {
    deleteAccount,
    isDeleting,
  };
};
