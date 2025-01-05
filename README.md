# tslisp

tslisp is an implementation of LISP that's able to bootstrap John McCarthy's meta-circular evaluator in Typescripts type system. The implementation for the metacircular evaluator is the same as the one used by [sectorlisp](https://github.com/jart/sectorlisp/blob/main/lisp.lisp).

## Getting Started

The code for the interpreter lives in `src/lisp.ts`. The code for the metacircular evaluator lives in `src/metacircular.ts`. You can see the result of evaluation by hovering over the `Result` type.

During development you might find it convenient to run `pnpm test` to ensure the project type checks. You might also want to make this change to prevent VSCode truncating type annotations: https://stackoverflow.com/a/67746753.

## Glossary:

Required constructs:

- CONS: Takes two arguments, a value and a list, and returns a new list where the first argument is the first element (the head) and the second argument is the rest of the list (the tail).
- CAR: Takes a list as an argument and returns the first element (the head) of that list.
- CDR: Takes a list as an argument and returns the rest of the list (the tail), excluding the first element.
- QUOTE: Prevents evaluation of its argument, returning the argument as-is. It's often used to represent literal symbols or lists.
- ATOM: Takes a single argument and returns T if the argument is an atom (i.e., not a list), otherwise returns NIL.
- EQ: Tests if two atoms are the same (i.e., identical symbols or pointers), returning T for true or NIL for false.
- LAMBDA: Defines an anonymous function. Takes a list of parameters and a body, returning a function object that can be applied.
- COND: A conditional construct. Takes a series of test-expression pairs and evaluates the expression corresponding to the first true test.

Derived constructs:

- APPLY: Applies a function to a list of arguments. Takes two arguments: a function and a list of arguments, and returns the result of the function applied to those arguments.
- EVLIS: Evaluates each element of a list of expressions in sequence, returning a list of their results.
- PAIRLIS: Takes two lists (keys and values) and an existing association list, and constructs a new association list where each key is paired with the corresponding value.
- EVCON: Evaluates the conditions in a COND statement until it finds a true one, then evaluates and returns the corresponding expression.
- ASSOC: Takes a key and a list of key value pairs and returns the value associated with that key

## References

https://github.com/jart/sectorlisp

https://norvig.com/lispy.html

LISP 1.5 Programmer's Manual, McCarthy et al.

Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I, McCarthy et al.

The Roots of Lisp, Paul Graham
