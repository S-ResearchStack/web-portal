import React, { useMemo } from 'react';
import EducationImg from 'src/assets/education/education.svg';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import CardList, { CardListProps } from 'src/modules/common/CardList';
import EducationCard from './EducationCard';
import { useEducationList, EducationalContentListItem } from './educationList.slice';

const EducationList = () => {
  const studyId = useSelectedStudyId();
  const { data, isLoading, refetch } = useEducationList(
    {
      fetchArgs: !!studyId && { studyId },
      refetchSilentlyOnMount: true,
    },
    {
      text: GENERIC_SERVER_ERROR_TEXT,
      showErrorIcon: true,
    }
  );

  const cardListProps: CardListProps<EducationalContentListItem> = useMemo(
    () => ({
      data: [
        {
          key: 'drafts',
          title: 'Drafts',
          list: data?.drafts,
          isLoading: isLoading && !data?.drafts,
          renderItem: (item) => <EducationCard item={item} refetchList={refetch} />,
          keyExtractor: (item) => item.id,
        },
        {
          key: 'published',
          title: 'Published',
          list: data?.published,
          isLoading: isLoading && !data?.published,
          renderItem: (item) => <EducationCard item={item} refetchList={refetch} />,
          keyExtractor: (item) => item.id,
        },
      ],
      empty: {
        title: 'No content yet',
        description: 'Your educational content will appear here after you create them.',
        picture: <EducationImg />,
      },
    }),
    [data, isLoading]
  );

  return <CardList {...cardListProps} />;
};

export default React.memo(EducationList);
