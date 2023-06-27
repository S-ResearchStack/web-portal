import { useCallback } from 'react';

import { useShowSnackbar } from 'src/modules/snackbar';

const useDownloadSnackbar = (downloadFn: (...args: unknown[]) => Promise<void>) => {
  const showSnackbar = useShowSnackbar();

  const wrappedDownloadFn = useCallback(async () => {
    try {
      await downloadFn();
      showSnackbar({
        text: 'Document successfully downloaded.',
        duration: 2000,
      });
    } catch (e) {
      const isAborted = (e as Error).toString().includes('The user aborted a request');

      if (!isAborted) {
        showSnackbar({
          showErrorIcon: true,
          showCloseIcon: true,
          text: 'Download failed. Please try again later.',
          actionLabel: 'RETRY',
          onAction: async (settings) => {
            settings.hideAfterCall = true;
            await wrappedDownloadFn();
          },
          duration: 0,
        });

        console.error(e);
      }
    }
  }, [downloadFn, showSnackbar]);

  return wrappedDownloadFn;
};

export default useDownloadSnackbar;
