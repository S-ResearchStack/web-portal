import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Path } from 'src/modules/navigation/store';
import TaskAnalytics from 'src/modules/study-management/user-management/task-management/common/TaskAnalytics';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import TaskPage, {
  ContentContainer,
} from 'src/modules/study-management/user-management/task-management/common/TaskPage';
import { surveyListDataSelector } from './surveyList.slice';
import { SurveyResults, SurveyResultsSurveyInfo, useSurveyDetailsData } from './surveyPage.slice';
import SurveyResponses from './SurveyResponses';
import useHistoryChangeOnce from '../../common/useHistoryChangeOnce';

const SurveyPage = () => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const history = useHistory();
  const params = useParams<{ surveyId: string }>();
  const studyId = useSelectedStudyId();

  const surveyList = useSelector(surveyListDataSelector);
  const initialData: SurveyResults | undefined = useMemo(() => {
    const selectedItem = surveyList?.published.find((i) => i.id === params.surveyId);

    return (
      selectedItem && {
        surveyInfo: selectedItem as SurveyResultsSurveyInfo,
      }
    );
  }, [params.surveyId, surveyList?.published]);

  const { data, isLoading, error, reset } = useSurveyDetailsData(
    {
      initialData,
      fetchArgs: !!studyId && {
        id: params.surveyId,
        studyId,
      },
    },
    {
      text: "Can't get survey data.",
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
          <SurveyResponses loading={isLoading} responses={data?.responses} />
        ) : (
          <TaskAnalytics loading={isLoading} analytics={data?.analytics} type="survey" />
        )}
      </ContentContainer>
    ),
    [activePageIndex, data, isLoading]
  );

  if (error) {
    return null;
  }

  return (
    <div data-testid="survey-page">
      <TaskPage
        tabs={['Responses', 'Analytics']}
        content={content}
        title={data?.surveyInfo?.title}
        publishedAt={data?.surveyInfo?.publishedAt}
        activePageIndex={activePageIndex}
        setActivePageIndex={setActivePageIndex}
      />
    </div>
  );
};

export default SurveyPage;
