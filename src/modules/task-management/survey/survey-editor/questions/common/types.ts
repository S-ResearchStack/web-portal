export type CommonAnswer = {
  id: string;
};

export type CommonQuestionOptions = {
  optional: boolean;
};

export type CommonQuestionItem = {
  id: string;
  title: string;
  description?: string;
};

export type SelectableAnswer = CommonAnswer & {
  value: string;
};

export type RankAnswer = CommonAnswer & {
  value: string;
};

export type DateTimeAnswers = { date: Date; time: Date; datesRange: Date[]; timesRange: Date[] };
export type PreviewQuestionAnswers = Record<string, number | string | undefined | DateTimeAnswers>; // TODO rename to answer (one)

export type ConfirmOptionRemovalFn = (onConfirmed: () => void) => void;
