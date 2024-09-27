import _uniqueId from 'lodash/uniqueId';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const getVideoPoster = async (src: string) =>
  new Promise<string>((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = src;
      video.preload = 'metadata';
      video.addEventListener('error', () => {
        reject(video.error);
        console.error(video.error);
      });
      video.addEventListener(
        'loadedmetadata',
        () => {
          video.currentTime = Math.min(0.01, video.duration);
        },
        { once: true }
      );

      video.addEventListener(
        'seeked',
        () => {
          try {
            const width = video.videoWidth;
            const height = video.videoHeight;
            const canvas = document.createElement('canvas');

            video.width = width;
            video.height = height;
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');

            if (context) {
              context.drawImage(video, 0, 0, width, height);
            }

            resolve(canvas.toDataURL());
          } catch (e) {
            reject(e);
          }
        },
        { once: true }
      );
    } catch (e) {
      reject(e);
    }
  });

export const getPdfPoster = async (src: string) => {
  const doc = await pdfjs.getDocument(src).promise;
  if (!doc.numPages) {
    return undefined;
  }

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (canvasContext) {
    await page.render({ canvasContext, viewport }).promise;
  }

  return canvas.toDataURL();
};

export const newId = () => _uniqueId('education');
