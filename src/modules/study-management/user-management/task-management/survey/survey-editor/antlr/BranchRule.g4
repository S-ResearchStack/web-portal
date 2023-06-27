grammar BranchRule;

expression
    : logicalExpression
    | comparisonExpression
    | membershipExpression
    ;

logicalExpression : op=LOGICAL_OPERATOR ' ' left=expression ' ' right=expression;
comparisonExpression : op=COMPARISON_OPERATOR ' ' left=Identifier ' ' right=Value;
membershipExpression : op=MEMBERSHIP_OPERATOR ' ' left=Identifier ' ' right=Value;

Identifier
    : VAR_ANS
    | VAR_CNT
    ;

VAR_ANS: 'val' Integer;
VAR_CNT: 'cnt' Integer;

LOGICAL_OPERATOR
    : AND | OR
    ;

COMPARISON_OPERATOR
    : GT | GTE | LT | LTE | EQ | NEQ
    ;

MEMBERSHIP_OPERATOR
    : CONTAINS | NCONTAINS ;

Value
    : Sign? Float
    | Sign? Integer
    | String
    ;

Float
    :  Integer? '.' Integer
    |  Integer '.' Integer?
    ;
Integer : Digit+;
String : '"' Char+ '"';

fragment Char : ~'"' ;
fragment Digit : [0-9];
fragment Sign : '-' | '+';

AND: 'and';
OR: 'or';
GT: 'gt';
GTE: 'gte';
LT: 'lt';
LTE: 'lte';
EQ: 'eq';
NEQ: 'neq';
CONTAINS: 'contains';
NCONTAINS: 'notcontains';
