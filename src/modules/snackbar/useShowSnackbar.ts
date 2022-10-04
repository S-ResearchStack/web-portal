import { useCallback, useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import { actionTriggeredSnackbarIdSelector, showSnackbar } from './snackbar.slice';

const useShowSnackbar = () => {
  const dispatch = useAppDispatch();

  const callbackStateRef = useRef<{
    snackbarId: string;
    onAction: () => void;
  }>();

  const show = useCallback(
    ({
      text,
      actionLabel,
      onAction,
    }: {
      text: string;
      actionLabel?: string;
      onAction?: () => void;
    }) => {
      const snackbarId = dispatch(showSnackbar({ text, actionLabel }));
      if (onAction) {
        callbackStateRef.current = {
          snackbarId,
          onAction,
        };
      }
    },
    [dispatch]
  );

  const actionTriggeredSnackbarId = useAppSelector(actionTriggeredSnackbarIdSelector);
  useUpdateEffect(() => {
    if (callbackStateRef.current?.snackbarId === actionTriggeredSnackbarId) {
      callbackStateRef.current?.onAction();
      callbackStateRef.current = undefined;
    }
  }, [actionTriggeredSnackbarId]);

  return show;
};

export default useShowSnackbar;
