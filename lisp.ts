import type {
  Equals,
  Flatten,
  Head,
  Rest,
  RestA,
  Split,
  ZipObject,
} from "./utils";

export type AST = string | AST[];
export type $<Exp, Scope> = { $exp: Exp; $scope: Scope };

type Error<M extends string = "Error", C = {}> = { message: M; context: C };

export type NIL = [];
export type TRUE = "t";

export type Preformat<T extends string, A extends string = ""> =
  T extends "" ? A
  : Head<T> extends "\n" ? Preformat<Rest<T>, A>
  : Head<T> extends "(" | ")" ? Preformat<Rest<T>, `${A} ${Head<T>} `>
  : Preformat<Rest<T>, `${A}${Head<T>}`>;

export type Tokenise<T extends string, A extends string[] = []> =
  Head<T> extends "" ? A
  : Head<T> extends " " ? Tokenise<Rest<T>, A>
  : Head<T> extends "(" | ")" ? Tokenise<Rest<T>, [...A, Head<T>]>
  : T extends `${infer W} ${infer R}` ? Tokenise<R, [...A, W]>
  : T extends `${infer W}` ? Tokenise<"", [...A, W]>
  : never;

export type Preprocess<Lines extends string[], A extends string[][] = []> =
  Lines extends [] ? A
  : Preprocess<RestA<Lines>, [...A, Tokenise<Preformat<Lines[0]>>]>;

export type BuildAST<State> =
  State extends (
    {
      $tokens: infer $Tokens extends string[];
      $ast: infer $Ast extends AST[];
      $balance: infer $Balance extends string[];
    }
  ) ?
    $Tokens extends [] ?
      $Balance extends [] ?
        State
      : Error<"Syntax error: Missing )", $Tokens>
    : $Tokens[0] extends "(" ?
      BuildAST<{
        $tokens: RestA<$Tokens>;
        $ast: [];
        $balance: [...$Balance, ")"];
      }> extends infer T ?
        T extends (
          {
            $tokens: infer TT extends string[];
            $ast: infer AA extends AST[];
            $balance: infer BB extends string[];
          }
        ) ?
          BuildAST<{ $tokens: TT; $ast: [...$Ast, AA]; $balance: BB }>
        : T
      : never
    : $Tokens[0] extends ")" ?
      $Balance extends [] ?
        Error<"Syntax error: Missing (", $Tokens>
      : { $tokens: RestA<$Tokens>; $ast: $Ast; $balance: RestA<$Balance> }
    : BuildAST<{
        $tokens: RestA<$Tokens>;
        $ast: [...$Ast, $Tokens[0]];
        $balance: $Balance;
      }>
  : State;

export type Parse<T extends string> =
  BuildAST<{
    $tokens: Flatten<Preprocess<Split<T, "\n">>>;
    $ast: [];
    $balance: [];
  }> extends infer TT ?
    TT extends { $ast: infer A extends AST[] } ?
      A[0]
    : TT
  : never;

type EvalArray<
  T extends {
    $in: AST[];
    $out: AST[];
    $scope: Record<string, AST>;
  },
> =
  T["$in"] extends [] ? $<T["$out"], T["$scope"]>
  : Eval<$<T["$in"][0], T["$scope"]>> extends (
    $<infer Exp extends AST, infer E extends Record<string, any>>
  ) ?
    EvalArray<{
      $in: RestA<T["$in"]>;
      $out: [...T["$out"], Exp];
      $scope: E;
    }>
  : Error<"Error: base clause of EvalArray.", T>;

type EvalCond<T extends $<AST[], Record<string, AST>>> =
  T["$exp"] extends [] ? T
  : T["$exp"][0] extends (
    [infer Test extends AST, infer Consequence extends AST]
  ) ?
    Eval<$<Test, T["$scope"]>>["$exp"] extends TRUE ?
      $<Eval<$<Consequence, T["$scope"]>>["$exp"], T["$scope"]>
    : EvalCond<$<RestA<T["$exp"]>, T["$scope"]>>
  : never;

export type Eval<State> =
  State extends $<infer $Exp, infer $Scope extends Record<string, any>> ?
    $Exp extends keyof $Scope ?
      // variable reference
      $<$Scope[$Exp], $Scope>
    : $Exp extends string ? State
    : // quote
    $Exp extends ["quote", infer A] ? $<A, $Scope>
    : // atom
    $Exp extends ["atom", infer A extends AST] ?
      Eval<$<A, $Scope>>["$exp"] extends [] | string ?
        $<TRUE, $Scope>
      : $<[], $Scope>
    : // equality
    $Exp extends ["eq", infer Left extends AST, infer Right extends AST] ?
      Equals<
        Eval<$<Left, $Scope>>["$exp"],
        Eval<$<Right, $Scope>>["$exp"]
      > extends true ?
        $<TRUE, $Scope>
      : $<[], $Scope>
    : // car
    $Exp extends ["car", infer L extends AST] ?
      Eval<$<L, $Scope>>["$exp"] extends [infer H, ...infer _] ?
        $<H, $Scope>
      : never
    : // cdr
    $Exp extends ["cdr", infer L extends AST] ?
      Eval<$<L, $Scope>>["$exp"] extends [infer _, infer R] ?
        $<R, $Scope>
      : never
    : // cons
    $Exp extends ["cons", infer H extends AST, infer R extends AST] ?
      Eval<$<R, $Scope>>["$exp"] extends infer RR ?
        $<[Eval<$<H, $Scope>>["$exp"], RR], $Scope>
      : never
    : // definition
    $Exp extends (
      ["define", infer Symbol extends string, infer Exp extends AST]
    ) ?
      $<[], $Scope & Record<Symbol, Eval<$<Exp, $Scope>>["$exp"]>>
    : // assignment
    $Exp extends (
      ["set!", infer Symbol extends keyof $Scope, infer E extends AST]
    ) ?
      $<
        Omit<$Scope, Symbol>,
        Omit<$Scope, Symbol> & {
          [K in Symbol]: Eval<{
            $exp: E;
            $scope: $Scope;
          }>["$exp"];
        }
      >
    : // cond
    $Exp extends ["cond", ...infer AArgs extends AST[]] ?
      EvalCond<$<AArgs, $Scope>>
    : // lambda
    $Exp extends (
      [
        ["lambda", infer Params extends string[], infer Def],
        ...infer Args extends AST[],
      ]
    ) ?
      EvalArray<{
        $in: Args;
        $scope: $Scope;
        $out: [];
      }> extends $<infer EvaluatedArgs extends AST[], any> ?
        Eval<
          $<
            Def,
            Omit<$Scope, Params[number]> & ZipObject<Params, EvaluatedArgs>
          >
        >
      : never
    : // lambda in scope
    $Exp extends (
      [infer ProcedureName extends keyof $Scope, ...infer Args extends AST[]]
    ) ?
      EvalArray<{
        $in: Args;
        $scope: $Scope;
        $out: [];
      }> extends $<infer EvaluatedArgs extends AST[], any> ?
        Eval<$<[$Scope[ProcedureName], ...EvaluatedArgs], $Scope>>
      : never
    : $Exp extends AST[] ? $<$Exp, $Scope>
    : never
  : Error<"Error: base clause of Eval.", State>;

export type Interpret<T extends string> = Eval<$<Parse<T>, {}>>["$scope"];
