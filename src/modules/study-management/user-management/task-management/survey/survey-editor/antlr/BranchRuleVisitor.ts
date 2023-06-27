/* eslint-disable */
// @ts-nocheck
// Generated from BranchRule.g4 by ANTLR 4.12.0

import { ParseTreeVisitor } from 'antlr4';

import { ExpressionContext } from './BranchRuleParser';
import { LogicalExpressionContext } from './BranchRuleParser';
import { ComparisonExpressionContext } from './BranchRuleParser';
import { MembershipExpressionContext } from './BranchRuleParser';

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `BranchRuleParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class BranchRuleVisitor<Result> extends ParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `BranchRuleParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression?: (ctx: ExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `BranchRuleParser.logicalExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `BranchRuleParser.comparisonExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitComparisonExpression?: (ctx: ComparisonExpressionContext) => Result;
  /**
   * Visit a parse tree produced by `BranchRuleParser.membershipExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitMembershipExpression?: (ctx: MembershipExpressionContext) => Result;
}
