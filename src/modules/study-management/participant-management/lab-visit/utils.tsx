import { useEffect, useRef } from 'react';
import _last from 'lodash/last';
import _debounce from 'lodash/debounce';
import usePrevious from 'react-use/lib/usePrevious';

export const getFilePath = (path: string, fileName: string) => `${path}/${fileName}`;

export const useFirstMount = (effect: () => void, deps: unknown[]) => {
  useEffect(() => {
    const fn = _debounce(effect, 0);
    fn();
    return () => fn.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export const getFilenameInfo = (fileName: string) => {
  const name = _last(fileName.split('/'));

  if (!name) {
    return {
      fullName: undefined,
      name: undefined,
      extension: undefined,
    };
  }

  const firstDotPos = name.indexOf('.') ?? -1;
  if (firstDotPos < 1) {
    return {
      fullName: name,
      name,
      extension: undefined,
    };
  }

  return {
    fullName: name,
    name: name.slice(0, firstDotPos),
    extension: name.slice(firstDotPos + 1),
  };
};

export const acceptMimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'application/xml',
  'text/xml',
  'text/csv',
];

const checkIsAllowedByMimeType = (file: File) => acceptMimeTypes.includes(file.type);

export const cleanFileList = (files: File[]) => files.filter(checkIsAllowedByMimeType); // TODO: add check for size

export const useScrollToBottomWhenArrayLengthChange = <T extends HTMLElement>(arr?: unknown[]) => {
  const ref = useRef<T>(null);
  const prevLength = usePrevious(arr?.length);

  useEffect(() => {
    if (prevLength !== undefined && arr !== undefined && prevLength < arr.length) {
      ref.current?.scrollTo({
        behavior: 'smooth',
        top: ref.current?.scrollHeight,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arr?.length]);

  return ref;
};

export const calcFilesSize = (list: { sizeBytes: number }[]) =>
  list.reduce((value, item) => item.sizeBytes + value, 0);

export function checkFileExistOrThrowError(file?: File): asserts file is File {
  if (!(file instanceof File)) {
    throw new Error('File does not exist');
  }
}
