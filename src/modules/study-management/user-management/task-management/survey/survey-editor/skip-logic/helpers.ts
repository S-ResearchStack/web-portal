import _cloneDeep from 'lodash/cloneDeep';
import _last from 'lodash/last';
import _range from 'lodash/range';
import _isNumber from 'lodash/isNumber';
import _uniqueId from 'lodash/uniqueId';

import type { QuestionItem, SelectableAnswer } from '../questions';
import type { PreviewQuestionAnswers } from '../questions/common/types';
import type { SurveyItem, SurveySection } from '../surveyEditor.slice';
import type {
  QuestionItemSkipLogic,
  SkipLogicCondition,
  SkipLogicConditionClause,
  SkipLogicDestination,
  SkipLogicDestinationTargetType,
  SkipLogicRule,
  SkipLogicSelectedCountCondition,
} from './types';

export const newId = () => _uniqueId('skip-logic');

export const emptySkipLogicCondition = (isMulti: boolean): SkipLogicCondition => ({
  id: newId(),
  type: isMulti ? 'empty' : 'specific_option',
  clause: 'and',
});

export const emptySkipLogicRule = (isMulti: boolean): SkipLogicRule => ({
  id: newId(),
  conditions: [emptySkipLogicCondition(isMulti)],
  destination: {},
});

const isDestinationComplete = (d: SkipLogicDestination) => d.targetType && d.targetId;

export const isConditionComplete = (c: SkipLogicCondition) => {
  switch (c.type) {
    case 'specific_option':
      return c.optionCondition && c.optionId;
    case 'selected_count':
      return c.countCondition && Number.isFinite(c.count);
    case 'empty':
    default:
      return false;
  }
};

const isRuleComplete = (r: SkipLogicRule) =>
  r.conditions.every(isConditionComplete) && isDestinationComplete(r.destination);

export const isSkipLogicComplete = (l?: QuestionItemSkipLogic) =>
  l ? l.rules.every(isRuleComplete) : true;

export const isEmptyCondition = (c: SkipLogicCondition) => {
  switch (c.type) {
    case 'specific_option':
      return !c.optionId && !c.optionCondition;
    case 'selected_count':
      return !Number.isFinite(c.count) && !c.countCondition;
    case 'empty':
    default:
      return true;
  }
};

const isEmptyDestination = (d: SkipLogicDestination) => !d.targetId;

export const isEmptyRule = (r: SkipLogicRule) =>
  r.conditions.every(isEmptyCondition) && isEmptyDestination(r.destination);

export const isEmptyRules = (rs: SkipLogicRule[]) => rs.every(isEmptyRule);

export const getAllowedSpecificOptions = (question: QuestionItem) => {
  if (question.type !== 'single' && question.type !== 'multiple' && question.type !== 'dropdown') {
    return [];
  }

  // TODO: filter out some options to prevent duplication
  return question.answers.map((a, idx) => ({
    optionId: a.id,
    label: a.value || `Option ${idx + 1}`,
  }));
};

export const getAllowedSelectedCountValues = (
  question: QuestionItem,
  c: SkipLogicSelectedCountCondition
) => {
  let minMax = undefined as [number, number] | undefined;
  const numAnswers = question.answers.length;
  if (numAnswers < 1) {
    return [];
  }

  switch (c.countCondition) {
    case 'equal':
    case 'not_equal':
    case 'greater_or_equal':
    case 'less_or_equal':
      minMax = [0, numAnswers];
      break;
    case 'greater':
      minMax = [0, numAnswers - 1];
      break;
    case 'less':
      minMax = [1, numAnswers];
      break;
    default:
      minMax = undefined;
  }

  if (!minMax) {
    return [];
  }

  return _range(minMax[0], minMax[1] + 1);
};

export const isSectionTargetAllowed = (question: QuestionItem, sections: SurveySection[]) =>
  sections.length > 1 && !_last(sections)?.children.find((i) => i.id === question.id);

// TODO: check if all possible cases has been exhausted
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isNewRulesCanBeAdded = (q: QuestionItem, qs: QuestionItem[]) => true;

export const getAllowedTargets = (
  d: SkipLogicDestination,
  question: QuestionItem,
  sections: SurveySection[]
) => {
  if (d.targetType === 'question') {
    const questions = sections.map((s) => s.children).flat();
    const questionIdx = questions.findIndex((q) => question.id === q.id) || 0;
    return questions
      .map((qq, idx) => ({
        targetId: qq.id,
        label: `${idx + 1} - ${qq.title || 'Question title'}`,
      }))
      .slice(questionIdx + 1);
  }

  if (d.targetType === 'section') {
    if (!isSectionTargetAllowed(question, sections)) {
      return [];
    }
    const sectionIdx = sections.findIndex((s) => s.children.find((i) => i.id === question.id));
    return sections
      .map((s, idx) => ({
        targetId: s.id,
        label: `${idx + 1} - ${s.title || 'Untitled'}`,
      }))
      .slice(sectionIdx + 1);
  }
  return [];
};

export const hasQuestionAssociatedSkipLogic = (question: QuestionItem, questions: QuestionItem[]) =>
  !!question.skipLogic ||
  questions.some((qq) =>
    qq.skipLogic?.rules.some(
      (r) => r.destination.targetType === 'question' && r.destination.targetId === question.id
    )
  );

export const hasQuestionAnswerAssociatedSkipLogic = (question: QuestionItem, a: SelectableAnswer) =>
  !!question.skipLogic?.rules.some((r) =>
    r.conditions.some((c) => c.type === 'specific_option' && c.optionId === a.id)
  );

// few things could have happened on survey update:
// option removed, question removed, questions reordered, sections reordered
// in that case we need to cleanup invalid ids
export const removeInvalidSkipLogic = (survey: SurveyItem) => {
  const newSurvey = _cloneDeep(survey);
  const questions = newSurvey.questions.map((s) => s.children).flat();
  const validTargetType: SkipLogicDestinationTargetType =
    newSurvey.questions.length > 1 ? 'section' : 'question';

  for (const q of questions) {
    for (const rule of q.skipLogic?.rules || []) {
      if (rule.destination.targetType !== validTargetType) {
        rule.destination.targetType = validTargetType;
        rule.destination.targetId = undefined;
      }

      const allowedTargets = getAllowedTargets(rule.destination, q, newSurvey.questions);
      const isTargetAllowed = !!allowedTargets.find(
        (t) => t.targetId === rule.destination.targetId
      );
      if (!isTargetAllowed) {
        rule.destination.targetId = undefined;
      }

      for (const condition of rule.conditions) {
        if (condition.type === 'specific_option') {
          const allowedOptions = getAllowedSpecificOptions(q);
          const { optionId } = condition;
          const isOptionAllowed = !!allowedOptions.find((o) => o.optionId === optionId);
          if (!isOptionAllowed) {
            condition.optionId = undefined;
          }
        } else if (condition.type === 'selected_count') {
          const allowedOptions = getAllowedSelectedCountValues(q, condition);
          const isOptionAllowed = allowedOptions.includes(condition.count ?? -1);
          if (!isOptionAllowed) {
            condition.count = undefined;
          }
        }
      }
    }
  }

  return newSurvey;
};

function isRuleConditionMet(cond: SkipLogicCondition, answers: PreviewQuestionAnswers) {
  // TODO: maybe move to common constants and reuse in renderPreviewContent handlers
  const ANSWER_SELECTED = 1;

  switch (cond.type) {
    case 'specific_option': {
      if (!cond.optionId) {
        return false;
      }
      if (cond.optionCondition === 'selected') {
        return answers[cond.optionId] === ANSWER_SELECTED;
      }
      if (cond.optionCondition === 'not_selected') {
        return answers[cond.optionId] !== ANSWER_SELECTED;
      }
      return false;
    }
    case 'selected_count': {
      const count = Object.values(answers).filter((a) => a === ANSWER_SELECTED).length;
      if (!_isNumber(cond.count)) {
        return false;
      }
      switch (cond.countCondition) {
        case 'equal':
          return count === cond.count;
        case 'not_equal':
          return count !== cond.count;
        case 'greater':
          return count > cond.count;
        case 'greater_or_equal':
          return count >= cond.count;
        case 'less':
          return count < cond.count;
        case 'less_or_equal':
          return count <= cond.count;
        default:
          return false;
      }
    }
    default:
      return false;
  }
}

export function evaluateSkipLogicDestination(
  question: QuestionItem,
  answers: PreviewQuestionAnswers
): SkipLogicDestination | undefined {
  const rules = [...(question.skipLogic?.rules || [])];
  // in case of conflicting rules we should execute last defined
  rules.reverse();

  for (const rule of rules) {
    // Convert to array of booleans and and/or clauses
    const expression: (boolean | SkipLogicConditionClause)[] = [];
    rule.conditions.forEach((c, idx) => {
      const isLast = idx === rule.conditions.length - 1;
      expression.push(isRuleConditionMet(c, answers));
      if (!isLast) {
        expression.push(c.clause);
      }
    });

    // Evaluate expression by finding next operator and executing operation
    (['and', 'or'] as SkipLogicConditionClause[]).forEach((op) => {
      let loopCount = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        loopCount += 1;
        // to avoid infinite loop in case of some error in the logic
        if (loopCount > 50) {
          console.error(`Reached loop count limit while evaluating skip logic`);
          break;
        }

        const opIdx = expression.findIndex((t) => t === op);
        if (opIdx === -1) {
          break;
        }
        const arg1 = expression[opIdx - 1];
        const arg2 = expression[opIdx + 1];
        let res = false;
        switch (op) {
          case 'and':
            res = (arg1 && arg2) as boolean;
            break;
          case 'or':
            res = (arg1 || arg2) as boolean;
            break;
          default:
            console.error(`Unhandled operation ${op}`);
        }
        expression.splice(opIdx - 1, 3, res);
      }
    });

    if (expression.length !== 1 || typeof expression[0] !== 'boolean') {
      console.error(`Failed to evaluate skip logic result: ${JSON.stringify(expression)}`);
      break;
    }

    if (expression[0] === true) {
      return rule.destination;
    }
  }
  return undefined;
}
