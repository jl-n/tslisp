export type Expect<T extends true> = T;

export type Not<T extends boolean> =
  T extends true ? false
  : T extends false ? true
  : never;

export type Head<T extends string> =
  T extends `${infer H}${infer _}` ? H : never;

export type Rest<T extends string> =
  T extends `${infer _}${infer R}` ? R : never;

export type RestA<T extends unknown[]> =
  T extends [infer _, ...infer R] ? R : never;

export type Equals<A, B> =
  [A] extends [never] ?
    [B] extends [never] ?
      true
    : false
  : [B] extends [never] ? false
  : A extends B ?
    B extends A ?
      true
    : false
  : false;

export type Split<
  Input extends string,
  Delim extends string,
  Groups extends string[] = [],
> =
  Input extends `${infer A}${Delim}${infer R}` ?
    A extends "" ?
      Split<R, Delim, Groups>
    : Split<R, Delim, [...Groups, A]>
  : [...Groups, Input];

export type Flatten<A extends string[][], Acc extends string[] = []> =
  A extends [infer First extends string[], ...infer Rest extends string[][]] ?
    Flatten<Rest, [...Acc, ...First]>
  : Acc;

export type ZipObject<
  Keys extends string[],
  Values extends any[],
  T extends Record<Keys[number], Values> | {} = {},
> =
  Keys extends [] ? T
  : ZipObject<RestA<Keys>, RestA<Values>, T & { [K in Keys[0]]: Values[0] }>;
