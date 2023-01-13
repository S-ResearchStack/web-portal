import React from 'react';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import EmptyStateImg from 'src/assets/illustrations/copy-state.svg';

import { useSurveyListData } from './surveyList.slice';
import SurveyCardsView from './SurveyCardsView';
import EmptyList from './EmptyList';

const SurveyList = () => {
  const studyId = useSelectedStudyId();
  const { data, isLoading } = useSurveyListData(
    {
      fetchArgs: !!studyId && { studyId },
    },
    {
      text: "Can't get surveys data.",
      showErrorIcon: true,
    }
  );

  const isLoaded = !!data && !isLoading; // the `data` is `undefined` before a request will be finished
  const isEmptyDrafts = isLoaded ? !data?.drafts.length : false;
  const isEmptyPublished = isLoaded ? !data?.published.length : false;

  return isEmptyDrafts && isEmptyPublished ? (
    <EmptyList
      picture={<EmptyStateImg />}
      title="No surveys yet"
      description="Your surveys will appear here after you create them."
    />
  ) : (
    <>
      {!isEmptyDrafts && (
        <SurveyCardsView title="Drafts" list={data?.drafts || []} isLoading={isLoading} />
      )}
      {!isEmptyPublished && (
        <SurveyCardsView title="Published" list={data?.published || []} isLoading={isLoading} />
      )}
    </>
  );
};

export default React.memo(SurveyList);
