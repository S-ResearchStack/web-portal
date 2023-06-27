export type SkipLogicDestinationTargetType = 'question' | 'section';

export type SkipLogicDestination = {
  targetType?: SkipLogicDestinationTargetType;
  targetId?: string;
};

export type SkipLogicMembershipOperator = 'selected' | 'not_selected';

export type SkipLogicConditionClause = 'and' | 'or';

type SkipLogicConditionCommon = {
  id: string;
  clause: SkipLogicConditionClause;
};

type SkipLogicSpecificOptionCondition = {
  type: 'specific_option';
  optionId?: string;
  optionCondition?: SkipLogicMembershipOperator;
} & SkipLogicConditionCommon;

export type SkipLogicConditionOperator =
  | 'equal'
  | 'not_equal'
  | 'greater'
  | 'greater_or_equal'
  | 'less'
  | 'less_or_equal';

export type SkipLogicSelectedCountCondition = {
  type: 'selected_count';
  countCondition?: SkipLogicConditionOperator;
  count?: number;
} & SkipLogicConditionCommon;

type SkipLogicEmptyCondition = {
  type: 'empty';
} & SkipLogicConditionCommon;

export type SkipLogicCondition =
  | SkipLogicEmptyCondition
  | SkipLogicSpecificOptionCondition
  | SkipLogicSelectedCountCondition;

export type SkipLogicRule = {
  id: string;
  conditions: SkipLogicCondition[];
  destination: SkipLogicDestination;
};

export type QuestionItemSkipLogic = {
  rules: SkipLogicRule[];
};
