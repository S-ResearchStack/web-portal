import { renderHook, act } from '@testing-library/react';
import { useCallback } from 'react';
import { useShowSnackbar } from 'src/modules/snackbar';
import useDownloadSnackbar from './useDownloadSnackbar';

jest.mock('src/modules/snackbar', () => ({
  useShowSnackbar: jest.fn(),
}));

describe('useDownloadSnackbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success snackbar when download succeeds', async () => {
    const mockDownloadFn = jest.fn().mockResolvedValue(undefined);
    const mockShowSnackbar = jest.fn();
    jest.spyOn(require('src/modules/snackbar'), 'useShowSnackbar').mockReturnValue(mockShowSnackbar);

    const { result } = renderHook(() => useDownloadSnackbar(mockDownloadFn));
    const wrappedDownloadFn = result.current;

    await act(async () => {
      await wrappedDownloadFn();
    });

    expect(mockDownloadFn).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      text: 'Document successfully downloaded.',
      duration: 2000,
    });
  });

  it('[NEGATIVE] should show error snackbar with retry when download fails', async () => {
    const mockDownloadFn = jest.fn().mockRejectedValue(new Error('Download failed'));
    const mockShowSnackbar = jest.fn();
    jest.spyOn(require('src/modules/snackbar'), 'useShowSnackbar').mockReturnValue(mockShowSnackbar);


    const { result } = renderHook(() => useDownloadSnackbar(mockDownloadFn));
    const wrappedDownloadFn = result.current;

    await act(async () => {
      await wrappedDownloadFn();
    });

    expect(mockDownloadFn).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      showErrorIcon: true,
      showCloseIcon: true,
      text: 'Download failed. Please try again later.',
      actionLabel: 'RETRY',
      onAction: expect.any(Function),
      duration: 0,
    });

    const snackbarAction = mockShowSnackbar.mock.calls[0][0].onAction;
    await act(async () => {
      await snackbarAction({ hideAfterCall: true });
    });

    expect(mockDownloadFn).toHaveBeenCalledTimes(2);
  });

  it('[NEGATIVE] should not show error snackbar when download is aborted', async () => {
    const mockDownloadFn = jest.fn().mockRejectedValue(new Error('The user aborted a request'));
    const mockShowSnackbar = jest.fn();
    jest.spyOn(require('src/modules/snackbar'), 'useShowSnackbar').mockReturnValue(mockShowSnackbar);


    const { result } = renderHook(() => useDownloadSnackbar(mockDownloadFn));
    const wrappedDownloadFn = result.current;

    await act(async () => {
      await wrappedDownloadFn();
    });

    expect(mockDownloadFn).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });
});
