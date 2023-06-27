// eslint-disable-next-line max-classes-per-file
import {
  ReadableStream as ReadableStreamPonyfill,
  WritableStream as WritableStreamPonyfill,
  TransformStream as TransformStreamPonyfill,
  ReadableStream,
} from 'web-streams-polyfill/ponyfill';
import { Writer as ZipTransformer } from '@transcend-io/conflux';
import streamSaver from 'streamsaver';

import { downloadFile } from './file';

const ModernReadableStream = (window.WritableStream
  ? window.ReadableStream
  : ReadableStreamPonyfill) as unknown as typeof window.ReadableStream;

const ModernTransformStream = (window.TransformStream
  ? window.TransformStream
  : TransformStreamPonyfill) as unknown as typeof window.TransformStream;

const ModernWritableStream = (window.WritableStream
  ? window.WritableStream
  : WritableStreamPonyfill) as unknown as typeof window.WritableStream;

const DEFAULT_FILE_NAME = 'download.zip';
const DEFAULT_PARALLEL_STREAMS_NUMBER = 1;

const FILE_HEADER_LENGTH = 30;
const DESCRIPTOR_LENGTH = 16;
const CENTRAL_HEADER_LENGTH = 46;
const END_LENGTH = 22;
const BYTES_PER_FILE = 2;

interface FileItem {
  url: string;
  name: string;
  size: number;
  error?: string;
  filePath?: string;
}

export type FilesList = FileItem[];

type ProgressEventHandler = (totalSize: number, currentSize: number) => void;
type DoneEventHandler = (totalSize: number) => void;
type ErrorEventHandler = (e: unknown) => void;

export interface Options<T extends FilesReadableFile> {
  fileName?: string;
  maxParallelStreams?: number;
  downloadStream?: WritableStream;
  filesStream?: typeof AbstractFilesReadableStream<T>;
  onProgress?: ProgressEventHandler;
  onDone?: DoneEventHandler;
  onError?: ErrorEventHandler;
}

type CancelCallback = () => void;

type ProgressHandler = (chunkSize: number) => void;
type DoneHandler = () => void;
type StartHandler = () => void;

export const createLimit = (max: number) => {
  let current = 0;
  const pending: { resolve: () => void; reject: (reason?: unknown) => void }[] = [];

  const tryUnlockNext = () => {
    if (current < max) {
      const next = pending.shift();
      if (next) {
        current += 1;
        next.resolve();
      }
    }
  };

  const waitAndLock = () =>
    new Promise<void>((resolve, reject) => {
      pending.push({ resolve, reject });
      tryUnlockNext();
    });

  const unlock = () => {
    current -= 1;
    tryUnlockNext();
  };

  const cancelPending = () => {
    pending.forEach(({ reject }) => reject(new Error('Canceled')));
  };

  return {
    waitAndLock,
    unlock,
    cancelPending,
  };
};

interface ProgressWatcherConstructorArgs {
  onProgress?: ProgressHandler;
  onDone?: DoneHandler;
  onStart?: StartHandler;
}

class ProgressWatcher extends ModernTransformStream {
  constructor({ onProgress, onDone, onStart }: ProgressWatcherConstructorArgs) {
    super({
      start: () => onStart?.(),
      flush: () => onDone?.(),
      transform: async (ch, controller) => {
        const part = await ch;
        onProgress?.(part.byteLength);
        controller.enqueue(part);
      },
    });
  }
}

class UrlDownloadWritableStream extends ModernWritableStream {
  constructor(fileName: string, totalSize: number) {
    const chunks: Uint8Array = new Uint8Array(totalSize);
    let position = 0;

    super({
      write: (chunk) => {
        chunks.set(chunk, position);
        position += chunk.length;
      },
      close: () => {
        const content = new Blob([chunks.buffer]);
        downloadFile(fileName, content);
      },
    });
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class PonyfillDecoratorReadableStream extends ModernReadableStream {
  constructor(stream: ReadableStream) {
    const streamReader = stream.getReader();
    super({
      pull: async (controller) => {
        const { done, value } = await streamReader.read();

        if (done) {
          controller.close();
        }

        return controller.enqueue(value);
      },
    });
  }
}

type FilesReadableStreamChunk = {
  name: string;
  stream: () => PonyfillDecoratorReadableStream;
};

export type FilesReadableFile = {
  name: string;
  size: number;
};

export abstract class AbstractFilesReadableStream<
  T extends FilesReadableFile
> extends ModernReadableStream<FilesReadableStreamChunk> {
  constructor(files: T[], limit: ReturnType<typeof createLimit>, protected noSlash = false) {
    const filesIterator: Iterator<T, T> = files.values();

    super({
      pull: async (controller) => {
        const { done, value: file } = filesIterator.next();

        if (done) {
          return controller.close();
        }

        await limit.waitAndLock();

        const stream = await this.getFileStream(file);
        const fileName = this.getFilePath(file);

        if (!stream) {
          controller.close();
          throw new Error(`File body is empty: ${fileName}`);
        }

        const onDone = () => limit.unlock();

        return controller.enqueue({
          name: fileName,
          stream: () =>
            stream &&
            new PonyfillDecoratorReadableStream(stream).pipeThrough(
              new ProgressWatcher({ onDone })
            ),
        });
      },
    });
  }

  abstract getFilePath(file: T): string;

  abstract getFileStream(file: T): Promise<ReadableStream<Uint8Array> | null>;
}

class FilesReadableStream extends AbstractFilesReadableStream<FileItem> {
  getFilePath(file: FileItem) {
    return `${this.noSlash ? '' : '/'}${file.name.split('/').filter(Boolean).join('/')}`;
  }

  // eslint-disable-next-line class-methods-use-this
  async getFileStream(file: FileItem): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(file.url);
    return response.body as ReadableStream<Uint8Array> | null;
  }
}

export const getFileZipMetaSize = (file: FilesReadableFile): number => {
  const encodedFileNameLength = new TextEncoder().encode(file.name).byteLength;
  return (
    FILE_HEADER_LENGTH +
    DESCRIPTOR_LENGTH +
    CENTRAL_HEADER_LENGTH +
    BYTES_PER_FILE +
    encodedFileNameLength * 2
  );
};

export const predictZipFileSize = (
  files: FilesReadableFile[],
  options?: { onlyMeta: boolean }
): number => {
  let length = END_LENGTH;
  for (const file of files) {
    length += getFileZipMetaSize(file) + (options?.onlyMeta ? 0 : file.size);
  }
  return length;
};

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

interface DownloadMultipleReturnType {
  listenOrThrow: (onProgressHandler?: ProgressEventHandler) => Promise<number>;
  cancel: CancelCallback;
}

const hasBrowserFilePickerSupported = 'showSaveFilePicker' in window;

const createDownloadStream = async (
  suggestedName: string,
  totalSize?: number
): Promise<WritableStream> => {
  if (hasBrowserFilePickerSupported) {
    const fileHandle = await window.showSaveFilePicker({ suggestedName });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return fileHandle.createWritable();
  }

  if (!totalSize) {
    throw new RangeError('Need total file sizes for use UrlDownloadWritableStream constructor');
  }

  if (isFirefox) {
    return new UrlDownloadWritableStream(suggestedName, totalSize);
  }

  return streamSaver.createWriteStream(suggestedName, { size: totalSize });
};

const downloadMultiple = async <T extends FilesReadableFile>(
  files: T[],
  options?: Options<T>,
  noSlash = false
): Promise<DownloadMultipleReturnType> => {
  const limit = createLimit(options?.maxParallelStreams || DEFAULT_PARALLEL_STREAMS_NUMBER);
  const totalSize = predictZipFileSize(files);
  const suggestedName = options?.fileName || DEFAULT_FILE_NAME;
  const fileWriteStream =
    options?.downloadStream || (await createDownloadStream(suggestedName, totalSize));

  let currentSize = 0;
  let asyncProgressListener: ProgressEventHandler | undefined;

  const onProgress: ProgressHandler = (chunkSize): void => {
    currentSize += chunkSize;
    options?.onProgress?.(totalSize, currentSize);
    asyncProgressListener?.(totalSize, currentSize);
  };

  const FilesStream = options?.filesStream ?? FilesReadableStream;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fileReader = new FilesStream(files, limit, noSlash);

  const done: Promise<void> = fileReader
    .pipeThrough(new ZipTransformer())
    .pipeThrough(new ProgressWatcher({ onProgress }))
    .pipeTo(fileWriteStream);

  const endWaiter = new Promise<number>((resolve, reject) => {
    done
      .then(() => {
        resolve(totalSize);
        options?.onDone?.(totalSize);
      })
      .catch((reason) => {
        reject(reason);
        options?.onError?.(reason);
      });
  });

  return {
    listenOrThrow: (onProgressHandler) => {
      asyncProgressListener = onProgressHandler;
      return endWaiter;
    },
    cancel: fileReader.cancel,
  };
};

export default downloadMultiple;
