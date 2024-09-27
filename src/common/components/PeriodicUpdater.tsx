import { ReactElement } from 'react';
import useIntervalUpdater from 'src/common/useIntervalUpdater';

interface PeriodicUpdaterProps {
  interval: number;
  children?: (props: { key: string }) => ReactElement;
}

const PeriodicUpdater = ({ interval, children }: PeriodicUpdaterProps): ReactElement | null => {
  const key = useIntervalUpdater(interval);

  return children?.({ key }) || null;
};

export default PeriodicUpdater;
