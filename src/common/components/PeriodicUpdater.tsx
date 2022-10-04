import useIntervalUpdater from 'src/common/useIntervalUpdater';

interface PeriodicUpdaterProps {
  interval: number;
  children?: (props: { key: string }) => JSX.Element;
}

const PeriodicUpdater = ({ interval, children }: PeriodicUpdaterProps): JSX.Element | null => {
  const key = useIntervalUpdater(interval);

  return children?.({ key }) || null;
};

export default PeriodicUpdater;
