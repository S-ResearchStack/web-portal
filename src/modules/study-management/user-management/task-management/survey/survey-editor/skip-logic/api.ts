import _isString from 'lodash/isString';
import _reverse from 'lodash/reverse';
import _isArray from 'lodash/isArray';
import _uniqueId from 'lodash/uniqueId';
import _last from 'lodash/last';
import antlr4 from 'antlr4';

import type { QuestionType, SelectableAnswer } from '../questions';
import BranchRuleVisitor from '../antlr/BranchRuleVisitor';
import BranchRuleParser, { ExpressionContext } from '../antlr/BranchRuleParser';
import BranchRuleLexer from '../antlr/BranchRuleLexer';

import {
  SkipLogicCondition,
  SkipLogicConditionClause,
  SkipLogicConditionOperator,
  SkipLogicMembershipOperator,
} from './types';
import { isConditionComplete, newId } from './helpers';

// represents comparison or condition operator
type SkipLogicTreeLeafNode = [[string, string, string]];
// represents logical operator (and / or)
type SkipLogicTreeClauseNode = [[string, SkipLogicTreeNode, SkipLogicTreeNode]];

type SkipLogicTreeNode = SkipLogicTreeLeafNode | SkipLogicTreeClauseNode;
type SkipLogicTree = SkipLogicTreeNode;

type InputComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';

const transformComparisonOperatorFromApi = (
  operator: InputComparisonOperator
): SkipLogicConditionOperator =>
  ((
    {
      gt: 'greater',
      gte: 'greater_or_equal',
      lt: 'less',
      lte: 'less_or_equal',
      eq: 'equal',
      neq: 'not_equal',
    } as Record<InputComparisonOperator, SkipLogicConditionOperator>
  )[operator]);

const transformComparisonOperatorToApi = (
  operator: SkipLogicConditionOperator
): InputComparisonOperator =>
  ((
    {
      greater: 'gt',
      greater_or_equal: 'gte',
      less: 'lt',
      less_or_equal: 'lte',
      equal: 'eq',
      not_equal: 'neq',
    } as Record<SkipLogicConditionOperator, InputComparisonOperator>
  )[operator]);

type InputMembershipOperator = 'contains' | 'notcontains';

const transformMultiSelectionMembershipOperatorFromApi = (
  operator: InputMembershipOperator
): SkipLogicMembershipOperator =>
  ((
    {
      contains: 'selected',
      notcontains: 'not_selected',
    } as Record<InputMembershipOperator, SkipLogicMembershipOperator>
  )[operator]);

const transformMultiSelectionMembershipOperatorToApi = (
  operator: SkipLogicMembershipOperator
): InputMembershipOperator =>
  ((
    {
      selected: 'contains',
      not_selected: 'notcontains',
    } as Record<SkipLogicMembershipOperator, InputMembershipOperator>
  )[operator]);

const transformSingleSelectionMembershipOperatorFromApi = (
  operator: InputComparisonOperator
): SkipLogicMembershipOperator =>
  ((
    {
      eq: 'selected',
      neq: 'not_selected',
    } as Record<InputComparisonOperator, SkipLogicMembershipOperator>
  )[operator]);

const transformSingleSelectionMembershipOperatorToApi = (
  operator: SkipLogicMembershipOperator
): InputComparisonOperator =>
  ((
    {
      selected: 'eq',
      not_selected: 'neq',
    } as Record<SkipLogicMembershipOperator, InputComparisonOperator>
  )[operator]);

type SkipLogicRawTree = (string | SkipLogicRawTree)[];

class SkipLogicVisitor extends BranchRuleVisitor<SkipLogicRawTree> {
  static DELIMITER = ' ';

  visitChildren = (ctx: antlr4.ParserRuleContext): SkipLogicRawTree => {
    if (!ctx?.children) {
      return [];
    }

    return (ctx.children as ExpressionContext[]).map((child) => {
      if (child.getChildCount()) {
        return child.accept(this).filter((n) => n !== SkipLogicVisitor.DELIMITER);
      }

      return child.getText();
    });
  };
}

const conditionApiStringToTree = (input: string): SkipLogicTree | undefined => {
  if (!input) {
    return undefined;
  }

  let hasError = false;
  const errorListener = {
    syntaxError(_r, _s, _l, _c, msg) {
      hasError = true;
      console.error(`Failed to parse condition expression: ${msg}, input: ${input}`);
    },
  } as antlr4.ErrorListener<unknown>;

  const lexer = new BranchRuleLexer(new antlr4.CharStream(input));
  lexer.addErrorListener(errorListener);

  const parser = new BranchRuleParser(new antlr4.CommonTokenStream(lexer));
  parser.buildParseTrees = true;
  parser.addErrorListener(errorListener);

  const expr = parser.expression();
  const tree = expr.accept(new SkipLogicVisitor()) as SkipLogicTree;
  return hasError ? undefined : tree;
};

export const transformConditionsFromApi = (
  questionType: QuestionType,
  conditionStr: string,
  values: SelectableAnswer[]
): SkipLogicCondition[] => {
  const tree = conditionApiStringToTree(conditionStr);
  if (!tree) {
    return [];
  }

  const conditions = [] as SkipLogicCondition[];

  const isValidNode = (node: SkipLogicTreeNode) => _isArray(node) && node?.[0]?.length === 3;
  const isLeafNode = (node: SkipLogicTreeNode): node is SkipLogicTreeLeafNode =>
    node[0].every(_isString);

  type OperatorId = string;
  const operatorIdByNode = new Map<SkipLogicTreeNode, OperatorId>();
  const operatorById = new Map<OperatorId, SkipLogicConditionClause>();
  const operatorAncestorsByCondition = new Map<SkipLogicCondition, OperatorId[]>();

  const traverseNode = (node: SkipLogicTreeNode, ancestors: OperatorId[]) => {
    if (!isValidNode(node)) {
      // insert empty condition to fail validation later
      conditions.push({
        id: newId(),
        type: 'empty',
        clause: 'and',
      });
      return;
    }

    if (isLeafNode(node)) {
      // The idea is to find lowest common operator ancestor between current condition and previous one.
      // This should give a clause to put in the prev condition
      const prevCondition = _last(conditions);
      if (prevCondition) {
        const prevConditionAncestors = operatorAncestorsByCondition.get(prevCondition);
        for (const pId of _reverse(prevConditionAncestors || [])) {
          const commonAncestor = ancestors.find((id) => pId === id);
          const commonAncestorOp = operatorById.get(commonAncestor || '');
          if (commonAncestorOp) {
            prevCondition.clause = commonAncestorOp;
            break;
          }
        }
      }

      const [opStr, variableStr, valStr] = node[0];
      const clause = 'and'; // use and by default, will be updated later
      let c = {
        type: 'empty',
        clause,
      } as SkipLogicCondition;
      if (variableStr.startsWith('val')) {
        let val = '';
        try {
          val = JSON.parse(valStr as string);
        } catch {
          // ignore error, it will be detected later by empty optionId
        }

        let optionCondition = '' as SkipLogicMembershipOperator;
        if (questionType === 'multiple') {
          optionCondition = transformMultiSelectionMembershipOperatorFromApi(
            opStr as InputMembershipOperator
          );
        } else if (questionType === 'single' || questionType === 'dropdown') {
          optionCondition = transformSingleSelectionMembershipOperatorFromApi(
            opStr as InputComparisonOperator
          );
        }

        c = {
          id: newId(),
          type: 'specific_option',
          optionId: values.find((a) => a.value === val)?.id,
          optionCondition,
          clause,
        };
      } else if (variableStr.startsWith('cnt')) {
        c = {
          id: newId(),
          type: 'selected_count',
          countCondition: transformComparisonOperatorFromApi(opStr as InputComparisonOperator),
          count: parseInt(valStr as string, 10),
          clause,
        };
      }
      operatorAncestorsByCondition.set(c, ancestors);
      conditions.push(c);
    } else {
      const [clause, left, right] = node[0];
      let opId = operatorIdByNode.get(node);
      if (!opId) {
        opId = _uniqueId('op');
        operatorIdByNode.set(node, opId);
        operatorById.set(opId, clause as SkipLogicConditionClause);
      }
      const ops = [...ancestors, opId];
      traverseNode(left, ops);
      traverseNode(right, ops);
    }
  };
  traverseNode(tree, []);

  for (const c of conditions) {
    if (
      !isConditionComplete(c) ||
      !(['and', 'or'] as SkipLogicConditionClause[]).includes(c.clause)
    ) {
      console.error(
        `Failed to interpret skip logic conditions, input: ${JSON.stringify(conditionStr)}`
      );
      return [];
    }
  }

  return conditions;
};

const transformConditionToApi = (
  questionType: QuestionType,
  condition: SkipLogicCondition,
  sequence: number,
  values: SelectableAnswer[]
): string => {
  if (condition.type === 'specific_option' && condition.optionCondition !== undefined) {
    const value = values.find((v) => v.id === condition.optionId)?.value;
    if (value === undefined) {
      return '';
    }

    if (questionType === 'multiple') {
      return `${transformMultiSelectionMembershipOperatorToApi(
        condition.optionCondition
      )} val${sequence} "${value}"`;
    }

    if (questionType === 'single' || questionType === 'dropdown') {
      return `${transformSingleSelectionMembershipOperatorToApi(
        condition.optionCondition
      )} val${sequence} "${value}"`;
    }
  }

  if (condition.type === 'selected_count' && condition.countCondition !== undefined) {
    if (condition.count === undefined) {
      return '';
    }

    return `${transformComparisonOperatorToApi(condition.countCondition)} cnt${sequence} ${
      condition.count
    }`;
  }

  return '';
};

type ExpressionToken = {
  type: 'operator' | 'operand';
  value: string;
};

// using https://en.wikipedia.org/wiki/Shunting_yard_algorithm
const infixToPrefix = (tokens: ExpressionToken[]): ExpressionToken[] => {
  const getOperatorPrecedence = (op: string) => {
    switch (op) {
      case 'and':
        return 1;
      case 'or':
      default:
        return 0;
    }
  };

  const stack = [] as ExpressionToken[];
  const out = [] as ExpressionToken[];
  for (const t of _reverse(tokens)) {
    if (t.type === 'operand') {
      out.push(t);
    }
    if (t.type === 'operator') {
      while (stack.length) {
        const prevOp = stack.pop() as ExpressionToken;
        if (getOperatorPrecedence(prevOp.value) >= getOperatorPrecedence(t.value)) {
          out.push(prevOp);
        } else {
          stack.push(prevOp);
          break;
        }
      }
      stack.push(t);
    }
  }
  while (stack.length) {
    out.push(stack.pop() as ExpressionToken);
  }

  return _reverse(out);
};

export const transformConditionsToApi = (
  questionType: QuestionType,
  conditions: SkipLogicCondition[],
  sequence: number,
  values: SelectableAnswer[]
): string => {
  // transform conditions list to a list of operands (eq/gt/etc) and operators (and/or)
  let tokens = conditions.reduce((acc, c, idx) => {
    const isLast = idx === conditions.length - 1;
    const conditionValue = transformConditionToApi(questionType, c, sequence, values);
    if (!conditionValue) {
      return acc;
    }

    acc.push({
      type: 'operand',
      value: conditionValue,
    });

    if (!isLast) {
      acc.push({
        type: 'operator',
        value: c.clause,
      });
    }

    return acc;
  }, [] as ExpressionToken[]);

  tokens = infixToPrefix(tokens);

  return tokens.map((t) => t.value).join(' ');
};
