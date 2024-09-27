import { useCallback, useState } from 'react';

const createImg = (src: string) => {
  const image = new Image();
  image.src = src;
  return image;
};

const usePreloadImages = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>();

  const preload = useCallback(async (images: string[]) => {
    if (!images.length) {
      return;
    }

    try {
      setIsLoading(true);
      setIsLoaded(false);
      setError(undefined);
      await Promise.all(images.map((src) => createImg(src).decode()));
      setIsLoaded(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isLoaded,
    error,
    preload,
  };
};

export default usePreloadImages;
