import _uniqueId from 'lodash/uniqueId';

export const newActivityId = (): string => _uniqueId('activity');
