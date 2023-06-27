import { DateTime } from 'luxon';
import _max from 'lodash/max';
import _sortBy from 'lodash/sortBy';
import { px } from 'src/styles';

export type TimeZoneIanaName = string;

export type TimeZoneOffset = number;

export type TimeZone = {
  iana: TimeZoneIanaName;
  offset: TimeZoneOffset;
};

export const getCurrentTimezone = (): TimeZone => {
  const currentTime = DateTime.local();

  return {
    iana: currentTime.zoneName,
    offset: currentTime.offset,
  };
};

export const getMaxTimezone = (offsets?: TimeZoneIanaName[]): TimeZone => {
  if (!offsets?.length) {
    return getCurrentTimezone();
  }

  const timezones: TimeZone[] = offsets.map((iana) => ({
    offset: DateTime.local().setZone(iana).offset,
    iana,
  }));

  const maxOffset = _max(timezones.map((tz) => tz.offset));

  return timezones.find((tz) => tz.offset === maxOffset) || getCurrentTimezone();
};

type MoveListItemToPublishItemType = {
  id: string;
  modifiedAt?: number | string;
  publishedAt?: number | string;
};

type MoveListItemToPublishListType<D> = {
  drafts: D[];
  published: D[];
};

export const pushDraftItem = <
  D extends MoveListItemToPublishItemType,
  L extends MoveListItemToPublishListType<D>,
  T extends (item: D) => D
>(
  item: D,
  list: L,
  transformBeforeAdd: T
): L => {
  const drafts = [...list.drafts];
  drafts.push(transformBeforeAdd(item));

  return {
    ...list,
    drafts,
  } as L;
};

export const updateDraftItem = <
  D extends MoveListItemToPublishItemType,
  L extends MoveListItemToPublishListType<D>,
  T extends (item: D) => D
>(
  item: D,
  list: L,
  transformBeforeUpdate: T
): L => {
  const drafts = [...list.drafts];
  const currentItemId = drafts.findIndex((i) => i.id === item.id);
  const hasItem = currentItemId > -1;

  if (hasItem) {
    drafts[currentItemId] = transformBeforeUpdate({
      ...drafts[currentItemId],
      ...item,
    });
  }

  return {
    ...list,
    drafts,
  } as L;
};

export const moveListItemToPublish = <
  D extends MoveListItemToPublishItemType,
  L extends MoveListItemToPublishListType<D>,
  T extends (item: D) => D
>(
  item: D,
  list: L,
  transformBeforeMove: T
): L => {
  const drafts = [...list.drafts];
  const currentItemId = drafts.findIndex((i) => i.id === item.id);
  const hasItem = currentItemId > -1;
  const currentItem = transformBeforeMove(hasItem ? drafts.splice(currentItemId, 1)[0] : item);
  const published = list?.published ? [...list.published, currentItem] : [currentItem];

  return {
    drafts,
    published,
  } as L;
};

export const sortTaskList = <
  D extends MoveListItemToPublishItemType,
  L extends MoveListItemToPublishListType<D>
>(
  categories: L
): L =>
  ({
    published: _sortBy(categories.published, ['publishedAt']).reverse(),
    drafts: _sortBy(categories.drafts, ['modifiedAt']).reverse(),
  } as L);

export const createHiddenCloneOfElement = (element: HTMLElement) => {
  const node = document.createElement('div');

  const elementStyles = window.getComputedStyle(element);
  for (let i = 0; i < elementStyles.length; i += 1) {
    const propertyName = elementStyles[i];
    node.style.setProperty(propertyName, elementStyles.getPropertyValue(propertyName));
  }

  Object.assign(node.style, {
    height: 'auto',
    maxHeight: 'auto',
    position: 'absolute',
    left: px(Number.MIN_SAFE_INTEGER),
    top: px(Number.MIN_SAFE_INTEGER),
  });

  return node;
};

export const calculateLines = (element: HTMLElement) =>
  Math.floor(element.offsetHeight / parseInt(window.getComputedStyle(element).lineHeight, 10));
