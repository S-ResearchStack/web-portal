import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Path } from 'src/modules/navigation/store';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import TaskAnalytics from '../common/TaskAnalytics';
import TaskPage, { ContentContainer } from '../common/TaskPage';
import {
  useActivityDetailsData,
  ActivityResults,
  ActivityResultsActivityInfo,
} from './activityPage.slice';
import { activitiesListDataSelector } from './activitiesList.slice';
import ActivityResponses from './ActivityResponses';
import useHistoryChangeOnce from '../../common/useHistoryChangeOnce';

const ActivityPage = () => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const history = useHistory();
  const params = useParams<{ activityId: string }>();
  const studyId = useSelectedStudyId();

  const activitiesList = useSelector(activitiesListDataSelector);
  const initialData: ActivityResults | undefined = useMemo(() => {
    const selectedItem = activitiesList?.published.find((i) => i.id === params.activityId);

    return (
      selectedItem && {
        activityInfo: selectedItem as ActivityResultsActivityInfo,
      }
    );
  }, [params.activityId, activitiesList?.published]);

  const { data, isLoading, error, fetch, fetchArgs, reset } = useActivityDetailsData(
    {
      initialData,
      fetchArgs: !!studyId && {
        id: params.activityId,
        studyId,
      },
    },
    {
      text: "Can't get activity data.",
      duration: 0,
      onAction: () => history.push(Path.StudyManagement),
      actionLabel: 'back',
      showErrorIcon: true,
    }
  );

  useHistoryChangeOnce(reset, [reset]);

  const content = useMemo(
    () => (
      <ContentContainer>
        {!activePageIndex ? (
          <ActivityResponses
            data={data?.responses}
            isLoading={isLoading}
            refetch={() => fetchArgs && fetch(fetchArgs)}
            error={error}
          />
        ) : (
          <TaskAnalytics loading={isLoading} analytics={data?.analytics} type="activity" />
        )}
      </ContentContainer>
    ),
    [activePageIndex, data, isLoading, error, fetch, fetchArgs]
  );

  if (error) {
    return null;
  }

  return (
    <div data-testid="activity-page">
      <TaskPage
        tabs={['Raw Data', 'Analytics']}
        content={content}
        title={data?.activityInfo?.title}
        publishedAt={data?.activityInfo?.publishedAt}
        activePageIndex={activePageIndex}
        setActivePageIndex={setActivePageIndex}
      />
    </div>
  );
};

export default ActivityPage;
