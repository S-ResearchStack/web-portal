import { useState } from 'react';
import useInterval from 'react-use/lib/useInterval';
import _uniqueId from 'lodash/uniqueId';

const useIntervalUpdater = (ms: number): string => {
  const [key, setKey] = useState(_uniqueId());
  useInterval(() => setKey(_uniqueId()), ms);
  return key;
};

export default useIntervalUpdater;
