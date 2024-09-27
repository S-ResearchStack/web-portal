import React, { ReactElement, useMemo } from 'react';

import CardsView from './CardsView';
import EmptyList from './EmptyList';

type CardListItem<T> = {
  key: React.Key;
  title: string;
  list: T[] | undefined;
  isLoading?: boolean;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => React.Key;
};

export type CardListProps<T> = {
  data: CardListItem<T>[];
  empty: {
    title: string | ReactElement;
    description: string | ReactElement;
    picture: ReactElement;
  };
};

const CardList = <T,>({ data, empty }: CardListProps<T>) => {
  const isLoading = useMemo(() => data.map((i) => !!i.isLoading).every(Boolean), [data]);
  const isLoaded = useMemo(() => data.map((i) => !!i.list && !i.isLoading).every(Boolean), [data]);
  const { title, description, picture } = empty;

  const list = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        isEmpty: isLoaded ? !item.list?.length : false,
      })),
    [data, isLoaded]
  );

  const isEmpty = useMemo(() => list.every((i) => i.isEmpty), [list]);

  return isEmpty ? (
    <EmptyList picture={picture} title={title} description={description} />
  ) : (
    <>
      {list.map((i) =>
        !i.isEmpty ? (
          <CardsView
            key={i.key}
            title={i.title}
            list={i.list || []}
            isLoading={isLoading}
            renderItem={i.renderItem}
            keyExtractor={i.keyExtractor}
          />
        ) : null
      )}
    </>
  );
};

export default CardList;
