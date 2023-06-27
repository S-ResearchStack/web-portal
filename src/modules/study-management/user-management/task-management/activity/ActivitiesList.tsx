import React, { useMemo } from 'react';

import EmptyStateImg from 'src/assets/illustrations/copy-state.svg';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import CardList, {
  CardListProps,
} from 'src/modules/study-management/user-management/common/CardList';

import { ActivitiesListItem, useActivitiesListData } from './activitiesList.slice';
import ActivityCard from './ActivityCard';

type SurveyListProps = {
  isLoading?: boolean;
};

const ActivitiesList = ({ isLoading }: SurveyListProps) => {
  const studyId = useSelectedStudyId();
  const { data, isLoading: isActivitiesLoading } = useActivitiesListData(
    {
      fetchArgs: !!studyId && { studyId },
      refetchSilentlyOnMount: true,
    },
    {
      text: GENERIC_SERVER_ERROR_TEXT,
      showErrorIcon: true,
    }
  );

  const cardListProps: CardListProps<ActivitiesListItem> = useMemo(
    () => ({
      data: [
        {
          key: 'drafts',
          title: 'Drafts',
          list: data?.drafts,
          isLoading: isLoading || (isActivitiesLoading && !data?.drafts),
          renderItem: (item) => <ActivityCard item={item} />,
          keyExtractor: (item) => item.id,
        },
        {
          key: 'published',
          title: 'Published',
          list: data?.published,
          isLoading: isLoading || (isActivitiesLoading && !data?.published),
          renderItem: (item) => <ActivityCard item={item} />,
          keyExtractor: (item) => item.id,
        },
      ],
      empty: {
        title: 'No activity tasks yet',
        description: 'Your activity tasks will appear here after you create them.',
        picture: <EmptyStateImg />,
      },
    }),
    [data, isActivitiesLoading, isLoading]
  );

  return <CardList {...cardListProps} />;
};

export default React.memo(ActivitiesList);
