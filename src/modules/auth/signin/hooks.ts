import { useEffect } from 'react';
import { useKeyPress } from 'react-use';

export const useEnterPress = (onMainButtonClick: () => void) => {
  const isEnterPressed = useKeyPress('Enter')[0];

  useEffect(() => {
    if (isEnterPressed) {
      onMainButtonClick();
    }
  }, [isEnterPressed, onMainButtonClick]);
};
