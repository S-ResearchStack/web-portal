import { RefObject, useCallback, useEffect } from 'react';

const useClickAwayGroup = (
  refs: RefObject<HTMLElement | null>[],
  onClickAway: (evt: MouseEvent) => void
): void => {
  const onClick = useCallback(
    (evt: MouseEvent) => {
      const isClickAwayNeeded =
        refs.length && !refs.map((ref) => ref.current?.contains(evt.target as Node)).some((v) => v);

      if (isClickAwayNeeded) {
        onClickAway(evt);
      }
    },
    [onClickAway, refs]
  );

  useEffect(() => {
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, [onClick]);
};

export default useClickAwayGroup;
