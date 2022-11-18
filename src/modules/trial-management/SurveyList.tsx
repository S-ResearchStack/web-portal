import React from 'react';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useSurveyListData } from './surveyList.slice';
import SurveyCardsView from './SurveyCardsView';

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

  return (
    <>
      <SurveyCardsView title="Drafts" list={data?.drafts || []} isLoading={isLoading} />
      <SurveyCardsView title="Published" list={data?.published || []} isLoading={isLoading} />
    </>
  );
};

export default SurveyList;
