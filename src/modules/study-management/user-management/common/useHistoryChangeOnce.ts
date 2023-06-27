import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { LocationListener } from 'history';

const useHistoryChangeOnce = (cb: LocationListener, deps: unknown[]) => {
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen(cb);
    return () => {
      unlisten();
    };
  }, [deps, cb, history]);
};

export default useHistoryChangeOnce;
