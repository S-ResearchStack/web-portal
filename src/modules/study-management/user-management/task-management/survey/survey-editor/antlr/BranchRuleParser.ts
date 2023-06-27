/* eslint-disable */
// @ts-nocheck
// Generated from BranchRule.g4 by ANTLR 4.12.0
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
  ATN,
  ATNDeserializer,
  DecisionState,
  DFA,
  FailedPredicateException,
  RecognitionException,
  NoViableAltException,
  BailErrorStrategy,
  Parser,
  ParserATNSimulator,
  RuleContext,
  ParserRuleContext,
  PredictionMode,
  PredictionContextCache,
  TerminalNode,
  RuleNode,
  Token,
  TokenStream,
  Interval,
  IntervalSet,
} from 'antlr4';
import BranchRuleListener from './BranchRuleListener.js';
import BranchRuleVisitor from './BranchRuleVisitor.js';

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class BranchRuleParser extends Parser {
  public static readonly T__0 = 1;
  public static readonly Identifier = 2;
  public static readonly VAR_ANS = 3;
  public static readonly VAR_CNT = 4;
  public static readonly LOGICAL_OPERATOR = 5;
  public static readonly COMPARISON_OPERATOR = 6;
  public static readonly MEMBERSHIP_OPERATOR = 7;
  public static readonly Value = 8;
  public static readonly Float = 9;
  public static readonly Integer = 10;
  public static readonly String = 11;
  public static readonly AND = 12;
  public static readonly OR = 13;
  public static readonly GT = 14;
  public static readonly GTE = 15;
  public static readonly LT = 16;
  public static readonly LTE = 17;
  public static readonly EQ = 18;
  public static readonly NEQ = 19;
  public static readonly CONTAINS = 20;
  public static readonly NCONTAINS = 21;
  public static readonly EOF = Token.EOF;
  public static readonly RULE_expression = 0;
  public static readonly RULE_logicalExpression = 1;
  public static readonly RULE_comparisonExpression = 2;
  public static readonly RULE_membershipExpression = 3;
  public static readonly literalNames: (string | null)[] = [
    null,
    "' '",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "'and'",
    "'or'",
    "'gt'",
    "'gte'",
    "'lt'",
    "'lte'",
    "'eq'",
    "'neq'",
    "'contains'",
    "'notcontains'",
  ];
  public static readonly symbolicNames: (string | null)[] = [
    null,
    null,
    'Identifier',
    'VAR_ANS',
    'VAR_CNT',
    'LOGICAL_OPERATOR',
    'COMPARISON_OPERATOR',
    'MEMBERSHIP_OPERATOR',
    'Value',
    'Float',
    'Integer',
    'String',
    'AND',
    'OR',
    'GT',
    'GTE',
    'LT',
    'LTE',
    'EQ',
    'NEQ',
    'CONTAINS',
    'NCONTAINS',
  ];
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    'expression',
    'logicalExpression',
    'comparisonExpression',
    'membershipExpression',
  ];
  public get grammarFileName(): string {
    return 'BranchRule.g4';
  }
  public get literalNames(): (string | null)[] {
    return BranchRuleParser.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return BranchRuleParser.symbolicNames;
  }
  public get ruleNames(): string[] {
    return BranchRuleParser.ruleNames;
  }
  public get serializedATN(): number[] {
    return BranchRuleParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message);
  }

  constructor(input: TokenStream) {
    super(input);
    this._interp = new ParserATNSimulator(
      this,
      BranchRuleParser._ATN,
      BranchRuleParser.DecisionsToDFA,
      new PredictionContextCache()
    );
  }
  // @RuleVersion(0)
  public expression(): ExpressionContext {
    let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, BranchRuleParser.RULE_expression);
    try {
      this.state = 11;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 5:
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 8;
            this.logicalExpression();
          }
          break;
        case 6:
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 9;
            this.comparisonExpression();
          }
          break;
        case 7:
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 10;
            this.membershipExpression();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public logicalExpression(): LogicalExpressionContext {
    let localctx: LogicalExpressionContext = new LogicalExpressionContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 2, BranchRuleParser.RULE_logicalExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 13;
        localctx._op = this.match(BranchRuleParser.LOGICAL_OPERATOR);
        this.state = 14;
        this.match(BranchRuleParser.T__0);
        this.state = 15;
        localctx._left = this.expression();
        this.state = 16;
        this.match(BranchRuleParser.T__0);
        this.state = 17;
        localctx._right = this.expression();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public comparisonExpression(): ComparisonExpressionContext {
    let localctx: ComparisonExpressionContext = new ComparisonExpressionContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 4, BranchRuleParser.RULE_comparisonExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 19;
        localctx._op = this.match(BranchRuleParser.COMPARISON_OPERATOR);
        this.state = 20;
        this.match(BranchRuleParser.T__0);
        this.state = 21;
        localctx._left = this.match(BranchRuleParser.Identifier);
        this.state = 22;
        this.match(BranchRuleParser.T__0);
        this.state = 23;
        localctx._right = this.match(BranchRuleParser.Value);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public membershipExpression(): MembershipExpressionContext {
    let localctx: MembershipExpressionContext = new MembershipExpressionContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 6, BranchRuleParser.RULE_membershipExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 25;
        localctx._op = this.match(BranchRuleParser.MEMBERSHIP_OPERATOR);
        this.state = 26;
        this.match(BranchRuleParser.T__0);
        this.state = 27;
        localctx._left = this.match(BranchRuleParser.Identifier);
        this.state = 28;
        this.match(BranchRuleParser.T__0);
        this.state = 29;
        localctx._right = this.match(BranchRuleParser.Value);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 21, 32, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 1, 0, 1, 0, 1, 0, 3, 0, 12, 8, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 1, 3,
    1, 3, 1, 3, 1, 3, 0, 0, 4, 0, 2, 4, 6, 0, 0, 29, 0, 11, 1, 0, 0, 0, 2, 13, 1, 0, 0, 0, 4, 19, 1,
    0, 0, 0, 6, 25, 1, 0, 0, 0, 8, 12, 3, 2, 1, 0, 9, 12, 3, 4, 2, 0, 10, 12, 3, 6, 3, 0, 11, 8, 1,
    0, 0, 0, 11, 9, 1, 0, 0, 0, 11, 10, 1, 0, 0, 0, 12, 1, 1, 0, 0, 0, 13, 14, 5, 5, 0, 0, 14, 15,
    5, 1, 0, 0, 15, 16, 3, 0, 0, 0, 16, 17, 5, 1, 0, 0, 17, 18, 3, 0, 0, 0, 18, 3, 1, 0, 0, 0, 19,
    20, 5, 6, 0, 0, 20, 21, 5, 1, 0, 0, 21, 22, 5, 2, 0, 0, 22, 23, 5, 1, 0, 0, 23, 24, 5, 8, 0, 0,
    24, 5, 1, 0, 0, 0, 25, 26, 5, 7, 0, 0, 26, 27, 5, 1, 0, 0, 27, 28, 5, 2, 0, 0, 28, 29, 5, 1, 0,
    0, 29, 30, 5, 8, 0, 0, 30, 7, 1, 0, 0, 0, 1, 11,
  ];

  private static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!BranchRuleParser.__ATN) {
      BranchRuleParser.__ATN = new ATNDeserializer().deserialize(BranchRuleParser._serializedATN);
    }

    return BranchRuleParser.__ATN;
  }

  static DecisionsToDFA = BranchRuleParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  );
}

export class ExpressionContext extends ParserRuleContext {
  constructor(parser?: BranchRuleParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public logicalExpression(): LogicalExpressionContext {
    return this.getTypedRuleContext(LogicalExpressionContext, 0) as LogicalExpressionContext;
  }
  public comparisonExpression(): ComparisonExpressionContext {
    return this.getTypedRuleContext(ComparisonExpressionContext, 0) as ComparisonExpressionContext;
  }
  public membershipExpression(): MembershipExpressionContext {
    return this.getTypedRuleContext(MembershipExpressionContext, 0) as MembershipExpressionContext;
  }
  public get ruleIndex(): number {
    return BranchRuleParser.RULE_expression;
  }
  public enterRule(listener: BranchRuleListener): void {
    if (listener.enterExpression) {
      listener.enterExpression(this);
    }
  }
  public exitRule(listener: BranchRuleListener): void {
    if (listener.exitExpression) {
      listener.exitExpression(this);
    }
  }
  // @Override
  public accept<Result>(visitor: BranchRuleVisitor<Result>): Result {
    if (visitor.visitExpression) {
      return visitor.visitExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class LogicalExpressionContext extends ParserRuleContext {
  public _op!: Token;
  public _left!: ExpressionContext;
  public _right!: ExpressionContext;
  constructor(parser?: BranchRuleParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public LOGICAL_OPERATOR(): TerminalNode {
    return this.getToken(BranchRuleParser.LOGICAL_OPERATOR, 0);
  }
  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }
  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }
  public get ruleIndex(): number {
    return BranchRuleParser.RULE_logicalExpression;
  }
  public enterRule(listener: BranchRuleListener): void {
    if (listener.enterLogicalExpression) {
      listener.enterLogicalExpression(this);
    }
  }
  public exitRule(listener: BranchRuleListener): void {
    if (listener.exitLogicalExpression) {
      listener.exitLogicalExpression(this);
    }
  }
  // @Override
  public accept<Result>(visitor: BranchRuleVisitor<Result>): Result {
    if (visitor.visitLogicalExpression) {
      return visitor.visitLogicalExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ComparisonExpressionContext extends ParserRuleContext {
  public _op!: Token;
  public _left!: Token;
  public _right!: Token;
  constructor(parser?: BranchRuleParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public COMPARISON_OPERATOR(): TerminalNode {
    return this.getToken(BranchRuleParser.COMPARISON_OPERATOR, 0);
  }
  public Identifier(): TerminalNode {
    return this.getToken(BranchRuleParser.Identifier, 0);
  }
  public Value(): TerminalNode {
    return this.getToken(BranchRuleParser.Value, 0);
  }
  public get ruleIndex(): number {
    return BranchRuleParser.RULE_comparisonExpression;
  }
  public enterRule(listener: BranchRuleListener): void {
    if (listener.enterComparisonExpression) {
      listener.enterComparisonExpression(this);
    }
  }
  public exitRule(listener: BranchRuleListener): void {
    if (listener.exitComparisonExpression) {
      listener.exitComparisonExpression(this);
    }
  }
  // @Override
  public accept<Result>(visitor: BranchRuleVisitor<Result>): Result {
    if (visitor.visitComparisonExpression) {
      return visitor.visitComparisonExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class MembershipExpressionContext extends ParserRuleContext {
  public _op!: Token;
  public _left!: Token;
  public _right!: Token;
  constructor(parser?: BranchRuleParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public MEMBERSHIP_OPERATOR(): TerminalNode {
    return this.getToken(BranchRuleParser.MEMBERSHIP_OPERATOR, 0);
  }
  public Identifier(): TerminalNode {
    return this.getToken(BranchRuleParser.Identifier, 0);
  }
  public Value(): TerminalNode {
    return this.getToken(BranchRuleParser.Value, 0);
  }
  public get ruleIndex(): number {
    return BranchRuleParser.RULE_membershipExpression;
  }
  public enterRule(listener: BranchRuleListener): void {
    if (listener.enterMembershipExpression) {
      listener.enterMembershipExpression(this);
    }
  }
  public exitRule(listener: BranchRuleListener): void {
    if (listener.exitMembershipExpression) {
      listener.exitMembershipExpression(this);
    }
  }
  // @Override
  public accept<Result>(visitor: BranchRuleVisitor<Result>): Result {
    if (visitor.visitMembershipExpression) {
      return visitor.visitMembershipExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
