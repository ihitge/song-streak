import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StyledAlertModal, AlertType } from '@/components/ui/modals/StyledAlertModal';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface StyledAlertContextValue {
  showAlert: (config: AlertConfig) => void;
  showError: (title: string, message: string, onPress?: () => void) => void;
  showSuccess: (title: string, message: string, onPress?: () => void) => void;
  showInfo: (title: string, message: string, onPress?: () => void) => void;
  showWarning: (title: string, message: string, onPress?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string,
    type?: AlertType
  ) => void;
}

const StyledAlertContext = createContext<StyledAlertContextValue | null>(null);

interface StyledAlertProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and provides styled alert functionality
 */
export const StyledAlertProvider: React.FC<StyledAlertProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK' }],
  });

  const showAlert = useCallback((newConfig: AlertConfig) => {
    setConfig({
      ...newConfig,
      buttons: newConfig.buttons || [{ text: 'OK' }],
    });
    setVisible(true);
  }, []);

  const showError = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showSuccess = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress }],
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type: AlertType = 'warning'
  ) => {
    showAlert({
      title,
      message,
      type,
      buttons: [
        { text: cancelText, style: 'cancel' },
        { text: confirmText, onPress: onConfirm, style: type === 'error' ? 'destructive' : 'default' },
      ],
    });
  }, [showAlert]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <StyledAlertContext.Provider
      value={{
        showAlert,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        showConfirm,
      }}
    >
      {children}
      <StyledAlertModal
        visible={visible}
        title={config.title}
        message={config.message}
        type={config.type}
        buttons={config.buttons}
        onClose={handleClose}
      />
    </StyledAlertContext.Provider>
  );
};

/**
 * Hook to access styled alert functions
 * Must be used within a StyledAlertProvider
 */
export const useStyledAlert = (): StyledAlertContextValue => {
  const context = useContext(StyledAlertContext);
  if (!context) {
    throw new Error('useStyledAlert must be used within a StyledAlertProvider');
  }
  return context;
};
