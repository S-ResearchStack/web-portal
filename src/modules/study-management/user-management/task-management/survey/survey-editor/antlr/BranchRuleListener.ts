/* eslint-disable */
// @ts-nocheck
// Generated from BranchRule.g4 by ANTLR 4.12.0

import { ParseTreeListener } from 'antlr4';

import { ExpressionContext } from './BranchRuleParser';
import { LogicalExpressionContext } from './BranchRuleParser';
import { ComparisonExpressionContext } from './BranchRuleParser';
import { MembershipExpressionContext } from './BranchRuleParser';

/**
 * This interface defines a complete listener for a parse tree produced by
 * `BranchRuleParser`.
 */
export default class BranchRuleListener extends ParseTreeListener {
  /**
   * Enter a parse tree produced by `BranchRuleParser.expression`.
   * @param ctx the parse tree
   */
  enterExpression?: (ctx: ExpressionContext) => void;
  /**
   * Exit a parse tree produced by `BranchRuleParser.expression`.
   * @param ctx the parse tree
   */
  exitExpression?: (ctx: ExpressionContext) => void;
  /**
   * Enter a parse tree produced by `BranchRuleParser.logicalExpression`.
   * @param ctx the parse tree
   */
  enterLogicalExpression?: (ctx: LogicalExpressionContext) => void;
  /**
   * Exit a parse tree produced by `BranchRuleParser.logicalExpression`.
   * @param ctx the parse tree
   */
  exitLogicalExpression?: (ctx: LogicalExpressionContext) => void;
  /**
   * Enter a parse tree produced by `BranchRuleParser.comparisonExpression`.
   * @param ctx the parse tree
   */
  enterComparisonExpression?: (ctx: ComparisonExpressionContext) => void;
  /**
   * Exit a parse tree produced by `BranchRuleParser.comparisonExpression`.
   * @param ctx the parse tree
   */
  exitComparisonExpression?: (ctx: ComparisonExpressionContext) => void;
  /**
   * Enter a parse tree produced by `BranchRuleParser.membershipExpression`.
   * @param ctx the parse tree
   */
  enterMembershipExpression?: (ctx: MembershipExpressionContext) => void;
  /**
   * Exit a parse tree produced by `BranchRuleParser.membershipExpression`.
   * @param ctx the parse tree
   */
  exitMembershipExpression?: (ctx: MembershipExpressionContext) => void;
}
