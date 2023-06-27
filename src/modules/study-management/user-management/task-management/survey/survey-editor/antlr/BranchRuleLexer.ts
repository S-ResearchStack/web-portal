/* eslint-disable */
// @ts-nocheck
// Generated from BranchRule.g4 by ANTLR 4.12.0
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
  ATN,
  ATNDeserializer,
  CharStream,
  DecisionState,
  DFA,
  Lexer,
  LexerATNSimulator,
  RuleContext,
  PredictionContextCache,
  Token,
} from 'antlr4';
export default class BranchRuleLexer extends Lexer {
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

  public static readonly channelNames: string[] = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN'];
  public static readonly literalNames: string[] = [
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
  public static readonly symbolicNames: string[] = [
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
  public static readonly modeNames: string[] = ['DEFAULT_MODE'];

  public static readonly ruleNames: string[] = [
    'T__0',
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
    'Char',
    'Digit',
    'Sign',
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

  constructor(input: CharStream) {
    super(input);
    this._interp = new LexerATNSimulator(
      this,
      BranchRuleLexer._ATN,
      BranchRuleLexer.DecisionsToDFA,
      new PredictionContextCache()
    );
  }

  public get grammarFileName(): string {
    return 'BranchRule.g4';
  }

  public get literalNames(): (string | null)[] {
    return BranchRuleLexer.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return BranchRuleLexer.symbolicNames;
  }
  public get ruleNames(): string[] {
    return BranchRuleLexer.ruleNames;
  }

  public get serializedATN(): number[] {
    return BranchRuleLexer._serializedATN;
  }

  public get channelNames(): string[] {
    return BranchRuleLexer.channelNames;
  }

  public get modeNames(): string[] {
    return BranchRuleLexer.modeNames;
  }

  public static readonly _serializedATN: number[] = [
    4, 0, 21, 174, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2,
    6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7,
    13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 2, 20,
    7, 20, 2, 21, 7, 21, 2, 22, 7, 22, 2, 23, 7, 23, 1, 0, 1, 0, 1, 1, 1, 1, 3, 1, 54, 8, 1, 1, 2,
    1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 4, 1, 4, 3, 4, 70, 8, 4, 1,
    5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 3, 5, 78, 8, 5, 1, 6, 1, 6, 3, 6, 82, 8, 6, 1, 7, 3, 7, 85, 8,
    7, 1, 7, 1, 7, 3, 7, 89, 8, 7, 1, 7, 1, 7, 3, 7, 93, 8, 7, 1, 8, 3, 8, 96, 8, 8, 1, 8, 1, 8, 1,
    8, 1, 8, 1, 8, 3, 8, 103, 8, 8, 3, 8, 105, 8, 8, 1, 9, 4, 9, 108, 8, 9, 11, 9, 12, 9, 109, 1,
    10, 1, 10, 4, 10, 114, 8, 10, 11, 10, 12, 10, 115, 1, 10, 1, 10, 1, 11, 1, 11, 1, 12, 1, 12, 1,
    13, 1, 13, 1, 14, 1, 14, 1, 14, 1, 14, 1, 15, 1, 15, 1, 15, 1, 16, 1, 16, 1, 16, 1, 17, 1, 17,
    1, 17, 1, 17, 1, 18, 1, 18, 1, 18, 1, 19, 1, 19, 1, 19, 1, 19, 1, 20, 1, 20, 1, 20, 1, 21, 1,
    21, 1, 21, 1, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 23, 1, 23,
    1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 1, 23, 0, 0, 24, 1, 1, 3, 2, 5,
    3, 7, 4, 9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23, 0, 25, 0, 27, 0, 29, 12, 31, 13,
    33, 14, 35, 15, 37, 16, 39, 17, 41, 18, 43, 19, 45, 20, 47, 21, 1, 0, 3, 1, 0, 34, 34, 1, 0, 48,
    57, 2, 0, 43, 43, 45, 45, 187, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0,
    0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17, 1, 0, 0,
    0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0, 0, 33, 1, 0, 0,
    0, 0, 35, 1, 0, 0, 0, 0, 37, 1, 0, 0, 0, 0, 39, 1, 0, 0, 0, 0, 41, 1, 0, 0, 0, 0, 43, 1, 0, 0,
    0, 0, 45, 1, 0, 0, 0, 0, 47, 1, 0, 0, 0, 1, 49, 1, 0, 0, 0, 3, 53, 1, 0, 0, 0, 5, 55, 1, 0, 0,
    0, 7, 61, 1, 0, 0, 0, 9, 69, 1, 0, 0, 0, 11, 77, 1, 0, 0, 0, 13, 81, 1, 0, 0, 0, 15, 92, 1, 0,
    0, 0, 17, 104, 1, 0, 0, 0, 19, 107, 1, 0, 0, 0, 21, 111, 1, 0, 0, 0, 23, 119, 1, 0, 0, 0, 25,
    121, 1, 0, 0, 0, 27, 123, 1, 0, 0, 0, 29, 125, 1, 0, 0, 0, 31, 129, 1, 0, 0, 0, 33, 132, 1, 0,
    0, 0, 35, 135, 1, 0, 0, 0, 37, 139, 1, 0, 0, 0, 39, 142, 1, 0, 0, 0, 41, 146, 1, 0, 0, 0, 43,
    149, 1, 0, 0, 0, 45, 153, 1, 0, 0, 0, 47, 162, 1, 0, 0, 0, 49, 50, 5, 32, 0, 0, 50, 2, 1, 0, 0,
    0, 51, 54, 3, 5, 2, 0, 52, 54, 3, 7, 3, 0, 53, 51, 1, 0, 0, 0, 53, 52, 1, 0, 0, 0, 54, 4, 1, 0,
    0, 0, 55, 56, 5, 118, 0, 0, 56, 57, 5, 97, 0, 0, 57, 58, 5, 108, 0, 0, 58, 59, 1, 0, 0, 0, 59,
    60, 3, 19, 9, 0, 60, 6, 1, 0, 0, 0, 61, 62, 5, 99, 0, 0, 62, 63, 5, 110, 0, 0, 63, 64, 5, 116,
    0, 0, 64, 65, 1, 0, 0, 0, 65, 66, 3, 19, 9, 0, 66, 8, 1, 0, 0, 0, 67, 70, 3, 29, 14, 0, 68, 70,
    3, 31, 15, 0, 69, 67, 1, 0, 0, 0, 69, 68, 1, 0, 0, 0, 70, 10, 1, 0, 0, 0, 71, 78, 3, 33, 16, 0,
    72, 78, 3, 35, 17, 0, 73, 78, 3, 37, 18, 0, 74, 78, 3, 39, 19, 0, 75, 78, 3, 41, 20, 0, 76, 78,
    3, 43, 21, 0, 77, 71, 1, 0, 0, 0, 77, 72, 1, 0, 0, 0, 77, 73, 1, 0, 0, 0, 77, 74, 1, 0, 0, 0,
    77, 75, 1, 0, 0, 0, 77, 76, 1, 0, 0, 0, 78, 12, 1, 0, 0, 0, 79, 82, 3, 45, 22, 0, 80, 82, 3, 47,
    23, 0, 81, 79, 1, 0, 0, 0, 81, 80, 1, 0, 0, 0, 82, 14, 1, 0, 0, 0, 83, 85, 3, 27, 13, 0, 84, 83,
    1, 0, 0, 0, 84, 85, 1, 0, 0, 0, 85, 86, 1, 0, 0, 0, 86, 93, 3, 17, 8, 0, 87, 89, 3, 27, 13, 0,
    88, 87, 1, 0, 0, 0, 88, 89, 1, 0, 0, 0, 89, 90, 1, 0, 0, 0, 90, 93, 3, 19, 9, 0, 91, 93, 3, 21,
    10, 0, 92, 84, 1, 0, 0, 0, 92, 88, 1, 0, 0, 0, 92, 91, 1, 0, 0, 0, 93, 16, 1, 0, 0, 0, 94, 96,
    3, 19, 9, 0, 95, 94, 1, 0, 0, 0, 95, 96, 1, 0, 0, 0, 96, 97, 1, 0, 0, 0, 97, 98, 5, 46, 0, 0,
    98, 105, 3, 19, 9, 0, 99, 100, 3, 19, 9, 0, 100, 102, 5, 46, 0, 0, 101, 103, 3, 19, 9, 0, 102,
    101, 1, 0, 0, 0, 102, 103, 1, 0, 0, 0, 103, 105, 1, 0, 0, 0, 104, 95, 1, 0, 0, 0, 104, 99, 1, 0,
    0, 0, 105, 18, 1, 0, 0, 0, 106, 108, 3, 25, 12, 0, 107, 106, 1, 0, 0, 0, 108, 109, 1, 0, 0, 0,
    109, 107, 1, 0, 0, 0, 109, 110, 1, 0, 0, 0, 110, 20, 1, 0, 0, 0, 111, 113, 5, 34, 0, 0, 112,
    114, 3, 23, 11, 0, 113, 112, 1, 0, 0, 0, 114, 115, 1, 0, 0, 0, 115, 113, 1, 0, 0, 0, 115, 116,
    1, 0, 0, 0, 116, 117, 1, 0, 0, 0, 117, 118, 5, 34, 0, 0, 118, 22, 1, 0, 0, 0, 119, 120, 8, 0, 0,
    0, 120, 24, 1, 0, 0, 0, 121, 122, 7, 1, 0, 0, 122, 26, 1, 0, 0, 0, 123, 124, 7, 2, 0, 0, 124,
    28, 1, 0, 0, 0, 125, 126, 5, 97, 0, 0, 126, 127, 5, 110, 0, 0, 127, 128, 5, 100, 0, 0, 128, 30,
    1, 0, 0, 0, 129, 130, 5, 111, 0, 0, 130, 131, 5, 114, 0, 0, 131, 32, 1, 0, 0, 0, 132, 133, 5,
    103, 0, 0, 133, 134, 5, 116, 0, 0, 134, 34, 1, 0, 0, 0, 135, 136, 5, 103, 0, 0, 136, 137, 5,
    116, 0, 0, 137, 138, 5, 101, 0, 0, 138, 36, 1, 0, 0, 0, 139, 140, 5, 108, 0, 0, 140, 141, 5,
    116, 0, 0, 141, 38, 1, 0, 0, 0, 142, 143, 5, 108, 0, 0, 143, 144, 5, 116, 0, 0, 144, 145, 5,
    101, 0, 0, 145, 40, 1, 0, 0, 0, 146, 147, 5, 101, 0, 0, 147, 148, 5, 113, 0, 0, 148, 42, 1, 0,
    0, 0, 149, 150, 5, 110, 0, 0, 150, 151, 5, 101, 0, 0, 151, 152, 5, 113, 0, 0, 152, 44, 1, 0, 0,
    0, 153, 154, 5, 99, 0, 0, 154, 155, 5, 111, 0, 0, 155, 156, 5, 110, 0, 0, 156, 157, 5, 116, 0,
    0, 157, 158, 5, 97, 0, 0, 158, 159, 5, 105, 0, 0, 159, 160, 5, 110, 0, 0, 160, 161, 5, 115, 0,
    0, 161, 46, 1, 0, 0, 0, 162, 163, 5, 110, 0, 0, 163, 164, 5, 111, 0, 0, 164, 165, 5, 116, 0, 0,
    165, 166, 5, 99, 0, 0, 166, 167, 5, 111, 0, 0, 167, 168, 5, 110, 0, 0, 168, 169, 5, 116, 0, 0,
    169, 170, 5, 97, 0, 0, 170, 171, 5, 105, 0, 0, 171, 172, 5, 110, 0, 0, 172, 173, 5, 115, 0, 0,
    173, 48, 1, 0, 0, 0, 13, 0, 53, 69, 77, 81, 84, 88, 92, 95, 102, 104, 109, 115, 0,
  ];

  private static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!BranchRuleLexer.__ATN) {
      BranchRuleLexer.__ATN = new ATNDeserializer().deserialize(BranchRuleLexer._serializedATN);
    }

    return BranchRuleLexer.__ATN;
  }

  static DecisionsToDFA = BranchRuleLexer._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  );
}
