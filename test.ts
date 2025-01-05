import type {
  $,
  AST,
  Eval,
  Interpret,
  NIL,
  Parse,
  Preformat,
  TRUE,
  Tokenise,
} from "./lisp";
import type { Equals, Expect, Not, Split, ZipObject } from "./utils";

type Equals0 = Expect<Equals<never, never>>;
type Equals1 = Expect<Equals<1, 1>>;
type Equals2 = Expect<Not<Equals<never, 1>>>;
type Equals3 = Expect<Not<Equals<1, never>>>;

type Split0 = Expect<Equals<Split<"a b c", " ">, ["a", "b", "c"]>>;

type Preformat0 = Expect<
  Equals<
    Preformat<"(one (define r 10) (* pi (* r r)))">,
    " ( one  ( define r 10 )   ( * pi  ( * r r )  )  ) "
  >
>;

type Tokenise0 = Expect<
  Equals<
    Tokenise<Preformat<"(one (define r 10) (* pi (* r r)))">>,
    [
      "(",
      "one",
      "(",
      "define",
      "r",
      "10",
      ")",
      "(",
      "*",
      "pi",
      "(",
      "*",
      "r",
      "r",
      ")",
      ")",
      ")",
    ]
  >
>;
type Tokenise1 = Expect<
  Equals<
    Tokenise<
      Preformat<`(one
`>
    >,
    ["(", "one"]
  >
>;

type Parse0 = Expect<Equals<Parse<"()">, []>>;
type Parse1 = Expect<Equals<Parse<"(one)">, ["one"]>>;
type Parse2 = Expect<Equals<Parse<`(one two three)`>, ["one", "two", "three"]>>;
type Parse3 = Expect<
  Equals<Parse<`(one (define r))`>, ["one", ["define", "r"]]>
>;
type Parse5 = Expect<
  Equals<Parse<"(()">["message"], "Syntax error: Missing )">
>;
type Parse6 = Expect<
  Equals<Parse<"())">["message"], "Syntax error: Missing (">
>;

type ZipObject0 = Expect<
  Equals<ZipObject<["a", "b", "c"], [1, 2, 3, 4]>, { a: 1; b: 2; c: 3 }>
>;

type Eval7 = Expect<
  Equals<Eval<{ $exp: "foo"; $scope: { foo: "bar" } }>["$exp"], "bar">
>;

//Quote returns the unevaluated expression
type Quote0 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(quote (quote 2))">; $scope: {} }>["$exp"],
    ["quote", "2"]
  >
>;

// Numbers and strings are atomic
type Atom1 = Expect<
  Equals<Eval<{ $exp: Parse<"(atom 2)">; $scope: {} }>["$exp"], TRUE>
>;
// Nil is atomic
type Atom2 = Expect<
  Equals<Eval<{ $exp: Parse<"(atom ())">; $scope: {} }>["$exp"], TRUE>
>;
// T is atomic
type Atom3 = Expect<
  Equals<Eval<{ $exp: Parse<"(atom t)">; $scope: {} }>["$exp"], TRUE>
>;
// Atom returns true if the contained atom expression evaluates to true
type Atom4 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(atom (atom (quote a)))">; $scope: {} }>["$exp"],
    TRUE
  >
>;
// Lists are not atomic
type Atom5 = Expect<
  Equals<
    Eval<{
      $exp: Parse<"(atom (quote (atom (quote a))))">;
      $scope: {};
    }>["$exp"],
    []
  >
>;

// Atoms are equivalent if their string values are the same
type Eq0 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(eq (quote a) (quote a))">; $scope: {} }>["$exp"],
    TRUE
  >
>;
// Atoms are not equivalent if their string values are different
type Eq1 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(eq (quote a) (quote b))">; $scope: {} }>["$exp"],
    []
  >
>;
type Eq2 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(eq (quote ()) (quote ()))">; $scope: {} }>["$exp"],
    TRUE
  >
>;
type Eq3 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(eq (quote t) (quote t))">; $scope: {} }>["$exp"],
    TRUE
  >
>;

type Car0 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(car (quote (a b c)))">; $scope: {} }>["$exp"],
    "a"
  >
>;
type Car1 = Expect<
  Equals<Eval<{ $exp: Parse<"(car (quote ()))">; $scope: {} }>["$exp"], never>
>;

type Cdr0 = Expect<
  Equals<
    Eval<{ $exp: Parse<"(cdr (quote (a (b c))))">; $scope: {} }>["$exp"],
    ["b", "c"]
  >
>;

type Cons0 = Expect<
  Equals<
    Eval<{
      $exp: Parse<"(cons (quote a) (quote (b (c ()))) )">;
      $scope: {};
    }>["$exp"],
    ["a", ["b", ["c", []]]]
  >
>;
type Cons1 = Expect<
  Equals<
    Eval<{
      $exp: Parse<"(cons (quote a) (cons (quote b) (cons (quote c) ())))">;
      $scope: {};
    }>["$exp"],
    ["a", ["b", ["c", []]]]
  >
>;
type Cons2 = Expect<
  Equals<
    Eval<{
      $exp: Parse<"(car (cons (quote a) (quote (b c))))">;
      $scope: {};
    }>["$exp"],
    "a"
  >
>;
type Cons3 = Expect<
  Equals<
    Eval<{
      $exp: Parse<"(cdr (cons (quote a) (quote (b c))))">;
      $scope: {};
    }>["$exp"],
    ["b", "c"]
  >
>;

type Cond0 = Expect<
  Equals<
    Eval<{
      $exp: Parse<`
        (cond 
        ((eq (quote a) (quote b))   (quote first))
        ((atom         (quote a))   (quote second)))`>;
      $scope: {};
    }>["$exp"],
    "second"
  >
>;
type Cond1 = Expect<
  Equals<
    Eval<{
      $exp: Parse<`
        (cond 
        ((eq (quote a) (quote b)) (quote error))
        ((eq (quote a) (quote a)) (quote match))
        ((atom (quote a))(quote error)))`>;
      $scope: {};
    }>["$exp"],
    "match"
  >
>;

type Lambda0 = Expect<
  Equals<
    Eval<{
      $exp: Parse<`
        ((lambda (x y) (cons x (cdr y)))
        (quote z)
      (quote (a (b c))))`>;
      $scope: {};
    }>["$exp"],
    ["z", ["b", "c"]]
  >
>;
type Lambda1 = Expect<
  Equals<
    Eval<{
      $exp: Parse<`
      ((lambda (f) (f (quote (b c))))
        (quote (lambda (x) (cons (quote a) x))))`>;
      $scope: {};
    }>["$exp"],
    ["a", ["b", "c"]]
  >
>;

/**
 * Assoc
 * Takes a key and a list of key value pairs and returns the value associated with that key
 */
type MetaAssoc = `
  (quote  (lambda (x y)
    (cond ((eq y ()) ())
          ((eq x (car (car y)))
                 (cdr (car y)))
          ((quote t)
            (assoc x (cdr y))))))`;
type MetaAssocParsed = Parse<MetaAssoc>;

// Searching for a non-existent key should return empty list
type Assoc0 = Expect<
  Equals<
    Eval<{
      $exp: [["lambda", ["assoc"], ["assoc", "b", []]], MetaAssocParsed];
      $scope: {};
    }>["$exp"],
    []
  >
>;
// Searching for the first appearing key should return its value
type Assoc1 = Expect<
  Equals<
    Eval<{
      $exp: [
        ["lambda", ["assoc"], ["assoc", "a", [["a", "1"], [["b", "2"], NIL]]]],
        MetaAssocParsed,
      ];
      $scope: {};
    }>["$exp"],
    "1"
  >
>;
// Searching for the second appearing key should return its value
type Assoc2 = Eval<{
  $exp: [
    ["lambda", ["assoc"], ["assoc", "b", [["a", "1"], [["b", "2"], NIL]]]],
    MetaAssocParsed,
  ];
  $scope: {};
}>;

/**
 * Evcon
 * Takes a list of conditions and a list of actions and evaluates the first condition that is true
 */
type MetaEvcon = `
(quote (lambda (c a)
          (cond ((eval (car (car c)) a)
                 (eval (car (cdr (car c))) a))
                ((quote t) (evcon (cdr c) a)))))`;
type MetaEvconParsed = Parse<MetaEvcon>;

/**
 * Pairlis
 * Takes two lists and a list of key value pairs and returns a new list of key value pairs
 */
type MetaPairlis = `
(quote (lambda (x y a)
          (cond ((eq x ()) a)
                ((quote t) (cons (cons (car x) (car y))
                                 (pairlis (cdr x) (cdr y) a))))))`;
type MetaPairlisParsed = Parse<MetaPairlis>;

type Pairlis0 = Expect<
  Equals<
    Eval<{
      $exp: [
        [
          "lambda",
          ["pairlis"],
          ["pairlis", ["a", ["b", ["c", []]]], ["1", ["2", ["3", []]]], []],
        ],
        MetaPairlisParsed,
      ];
      $scope: {};
    }>["$exp"],
    [["a", "1"], [["b", "2"], [["c", "3"], []]]]
  >
>;

/**
 * Evlis
 * Takes a list of expressions and a list of key value pairs and evaluates each expression
 */
type MetaEvlis = `
(quote (lambda (m a)
          (cond ((eq m ()) ())
                ((quote t) (cons (eval (car m) a)
                                 (evlis (cdr m) a))))))`;
type MetaEvlisParsed = Parse<MetaEvlis>;

/**
 * Apply
 * Takes a function, a list of arguments and a list of key value pairs and applies the function to the arguments
 */
type MetaApply = `
(quote (lambda (fn x a)
          (cond
            ((atom fn)
             (cond ((eq fn (quote car))  (car  (car x)))
                   ((eq fn (quote cdr))  (cdr  (car x)))
                   ((eq fn (quote atom)) (atom (car x)))
                   ((eq fn (quote cons)) (cons (car x) (car (cdr x))))
                   ((eq fn (quote eq))   (eq   (car x) (car (cdr x))))
                   ((quote t)            (apply (eval fn a) x a))))
            ((eq (car fn) (quote lambda))
             (eval (car (cdr (cdr fn)))
                   (pairlis (car (cdr fn)) x a))))))`;
type MetaApplyParsed = Parse<MetaApply>;

/**
 * Eval
 * Takes an expression, a list of key value pairs and evaluates the expression
 */
type MetaEval = `
(quote (lambda (e a)
          (cond
            ((atom e) (assoc e a))
            ((atom (car e))
             (cond ((eq (car e) (quote quote)) (car (cdr e)))
                   ((eq (car e) (quote cond)) (evcon (cdr e) a))
                   ((quote t) (apply (car e) (evlis (cdr e) a) a))))
            ((quote t) (apply (car e) (evlis (cdr e) a) a)))))`;
type MetaEvalParsed = Parse<MetaEval>;

/**
 * The program we want to run with our interpreter
 */
type FindFirstAtom = `
  (eval (quote ((lambda (ff x) (ff x))
                (quote (lambda (x)
                          (cond ((atom x) x)
                                ((quote t) (ff (car x))))))
                (quote ((a) b c))))
        ())`;
type FindFirstAtomParsed = Parse<FindFirstAtom>;

/**
 * Combine all the functions into a metacircular evaluator
 */
type MetacircularEvaluator<T extends AST> = Eval<
  $<
    [
      ["lambda", ["assoc", "evcon", "pairlis", "evlis", "apply", "eval"], T],
      MetaAssocParsed,
      MetaEvconParsed,
      MetaPairlisParsed,
      MetaEvlisParsed,
      MetaApplyParsed,
      MetaEvalParsed,
    ],
    {}
  >
>;

/** Run FindFirstAtomParsed and expect `a` */
type MetacircularEvaluator0 = Expect<
  Equals<MetacircularEvaluator<FindFirstAtomParsed>["$scope"]["e"], "a">
>;

/** Evaluate quote and and expect `b` */
type MetacircularEvaluator1 = Expect<
  Equals<
    MetacircularEvaluator<Parse<"(eval (quote b) ())">>["$scope"]["e"],
    "b"
  >
>;

export type MetacircularEvaluatorSource = `
((lambda (assoc evcon pairlis evlis apply eval)
  (eval (quote ((lambda (ff x) (ff x))
               (quote (lambda (x)
                        (cond ((atom x) x)
                              ((quote t) (ff (car x))))))
               (quote ((a) b c))))
       ()))
  (quote (lambda (x y)
          (cond ((eq y ()) ())
                ((eq x (car (car y)))
                      (cdr (car y)))
                ((quote t)
                (assoc x (cdr y))))))
  (quote (lambda (c a)
          (cond ((eval (car (car c)) a)
                (eval (car (cdr (car c))) a))
                ((quote t) (evcon (cdr c) a)))))
  (quote (lambda (x y a)
          (cond ((eq x ()) a)
                ((quote t) (cons (cons (car x) (car y))
                                (pairlis (cdr x) (cdr y) a))))))
  (quote (lambda (m a)
          (cond ((eq m ()) ())
                ((quote t) (cons (eval (car m) a)
                                (evlis (cdr m) a))))))
  (quote (lambda (fn x a)
          (cond
            ((atom fn)
            (cond ((eq fn (quote car))  (car  (car x)))
                  ((eq fn (quote cdr))  (cdr  (car x)))
                  ((eq fn (quote atom)) (atom (car x)))
                  ((eq fn (quote cons)) (cons (car x) (car (cdr x))))
                  ((eq fn (quote eq))   (eq   (car x) (car (cdr x))))
                  ((quote t)            (apply (eval fn a) x a))))
            ((eq (car fn) (quote lambda))
            (eval (car (cdr (cdr fn)))
                  (pairlis (car (cdr fn)) x a))))))
  (quote (lambda (e a)
          (cond
            ((atom e) (assoc e a))
            ((atom (car e))
            (cond ((eq (car e) (quote quote)) (car (cdr e)))
                  ((eq (car e) (quote cond)) (evcon (cdr e) a))
                  ((quote t) (apply (car e) (evlis (cdr e) a) a))))
            ((quote t) (apply (car e) (evlis (cdr e) a) a))))))`;

type MetacircularEvaluator2 = Expect<
  Equals<
    Interpret<MetacircularEvaluatorSource>["e"],
    MetacircularEvaluator<FindFirstAtomParsed>["$scope"]["e"]
  >
>;
