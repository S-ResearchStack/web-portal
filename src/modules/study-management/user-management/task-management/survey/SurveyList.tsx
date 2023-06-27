import React, { useMemo } from 'react';

import EmptyStateImg from 'src/assets/illustrations/copy-state.svg';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import CardList, {
  CardListProps,
} from 'src/modules/study-management/user-management/common/CardList';
import SurveyCard from './SurveyCard';
import { SurveyListItem, useSurveyListData } from './surveyList.slice';

type SurveyListProps = {
  isLoading?: boolean;
};

const SurveyList = ({ isLoading }: SurveyListProps) => {
  const studyId = useSelectedStudyId();
  const { data, isLoading: isListLoading } = useSurveyListData(
    {
      fetchArgs: !!studyId && { studyId },
      refetchSilentlyOnMount: true,
    },
    {
      text: GENERIC_SERVER_ERROR_TEXT,
      showErrorIcon: true,
    }
  );

  const cardListProps: CardListProps<SurveyListItem> = useMemo(
    () => ({
      data: [
        {
          key: 'drafts',
          title: 'Drafts',
          list: data?.drafts,
          isLoading: isLoading || (isListLoading && !data?.drafts),
          renderItem: (item) => <SurveyCard item={item} />,
          keyExtractor: (item) => item.id,
        },
        {
          key: 'published',
          title: 'Published',
          list: data?.published,
          isLoading: isLoading || (isListLoading && !data?.published),
          renderItem: (item) => <SurveyCard item={item} />,
          keyExtractor: (item) => item.id,
        },
      ],
      empty: {
        title: 'No surveys yet',
        description: 'Your surveys will appear here after you create them.',
        picture: <EmptyStateImg />,
      },
    }),
    [data, isLoading, isListLoading]
  );

  return <CardList {...cardListProps} />;
};

export default React.memo(SurveyList);
