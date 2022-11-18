import { useCallback, useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import {
  actionTriggeredSnackbarIdSelector,
  actionTriggeredSnackbarTsSelector,
  hideSnackbar,
  showSnackbar,
} from './snackbar.slice';

const useShowSnackbar = () => {
  const dispatch = useAppDispatch();

  const callbackStateRef = useRef<{
    snackbarId: string;
    onAction: (actionSettings: { hideAfterCall: boolean }) => void;
  }>();

  const show = useCallback(
    ({
      id,
      text,
      actionLabel,
      showErrorIcon,
      showCloseIcon,
      showSuccessIcon,
      duration,
      onClose,
      onAction,
    }: {
      id?: string;
      text: string;
      actionLabel?: string;
      showErrorIcon?: boolean;
      showCloseIcon?: boolean;
      showSuccessIcon?: boolean;
      duration?: number;
      onClose?: () => void;
      onAction?: (actionSettings: { hideAfterCall: boolean }) => void;
    }) => {
      const snackbarId = dispatch(
        showSnackbar({
          id,
          text,
          actionLabel,
          showErrorIcon,
          showCloseIcon,
          showSuccessIcon,
          duration,
          onClose,
        })
      );
      if (onAction) {
        callbackStateRef.current = {
          snackbarId,
          onAction,
        };
      } else {
        callbackStateRef.current = undefined;
      }
    },
    [dispatch]
  );

  const actionTriggeredSnackbarId = useAppSelector(actionTriggeredSnackbarIdSelector);
  const actionTriggeredSnackbarTs = useAppSelector(actionTriggeredSnackbarTsSelector);

  useUpdateEffect(() => {
    if (callbackStateRef.current?.snackbarId === actionTriggeredSnackbarId) {
      const actionSettings = {
        hideAfterCall: true,
      };

      callbackStateRef.current?.onAction(actionSettings);

      if (actionSettings.hideAfterCall) {
        callbackStateRef.current = undefined;
        dispatch(hideSnackbar());
      }
    }
  }, [actionTriggeredSnackbarId, actionTriggeredSnackbarTs]);

  return show;
};

export default useShowSnackbar;
