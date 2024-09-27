import { useCallback, useState } from 'react';

import { transformDataQueryResponse } from '../dashboard.utils';
import API, { QueryResponse, QueryErrorResponse, ChartSource } from 'src/modules/api';

export const useChartItem = (studyId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<QueryResponse | undefined>();
  const [error, setError] = useState<QueryErrorResponse | undefined>();

  const loadData = useCallback(async (source: ChartSource) => {
    setIsLoading(true);
    try {
      const executeRes = await API.executeChartDataQuery({ studyId }, source);
      executeRes.checkError();

      setData(transformDataQueryResponse(executeRes.data));
      setError(undefined);
    } catch (err) {
      setError({
        message: 'Error',
        details: 'Oops, something went wrong. Please try again later.',
      });
      setData(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [studyId]);

  return {
    isLoading,
    data,
    error,
    loadData,
  };
};
