import _uniqueId from 'lodash/uniqueId';

export const newSurveyId = (): string => _uniqueId('survey');

export const newQuestionId = (): string => _uniqueId('question');
