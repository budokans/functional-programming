// Monoids are an extension of a Semigroup.

// If there is a Semigroup of set A where for some element in A (we'll call this element empty or unit) and the following two equations hold true, then it is Monoid.

// Right identity: concat(a, empty) => a
// Left identity: concat(empty, a) => a

// Modelling a Monoid with a TypeScript interface:

import { Semigroup } from 'fp-ts/Semigroup'

// interface Monoid<A> extends Semigroup<A> {
//   readonly empty: A;
// }

// Many Semigroups we're familiar with can be extended to become Monoids.
import { Monoid } from 'fp-ts/Monoid'

// Number Monoid under addition
const MonoidSum: Monoid<number> = {
  concat: (first, second) => first + second,
  empty: 0
}

// Number Monoid under multiplication
const MonoidProduct: Monoid<number> = {
  concat: (first, second) => first * second,
  empty: 1
}

// String Monoid
const MonoidString: Monoid<string> = {
  concat: (first, second) => first + second,
  empty: ''
}

// Boolean Monoid under conjunction
const MonoidAll: Monoid<boolean> = {
  concat: (first, second) => first && second,
  empty: true
}

// Boolean Monoid under disjunction
const MonoidAny: Monoid<boolean> = {
  concat: (first, second) => first || second,
  empty: false
}

// Not all Monoids are Semigroups:
import { pipe } from 'fp-ts/function'
import { intercalate } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'))

console.log(S.Semigroup.concat('a', 'b')) // => 'ab'
console.log(SemigroupIntercalate.concat('a', 'b')) // => 'a|b'
console.log(SemigroupIntercalate.concat('a', '')) // => 'a|'
// This Semigroup doesn't satisfy the need for an 'empty' property where concat(a, empty) = a;

//////////////////
///
/// Endomorphisms
///
//////////////////

// Endomorphisms: A function whose input and output type is the same
// type Endomorphism<A> = (a: A) => A

// For an Endomorphism Monoid, the unit is an identity function

import { Endomorphism, flow, identity } from 'fp-ts/function'

const getEndoMorphismMonoid = <A>(): Monoid<Endomorphism<A>> => ({
  concat: flow,
  empty: identity
})

//////////////////
///
/// concatAll
///
//////////////////

// Compared to the concatAll operation of Semigroups, Monoids' concatAll operation is even easier - an initial value doesn't need to be passed.

import { concatAll } from 'fp-ts/Monoid'
import * as N from 'fp-ts/Number'
import * as B from 'fp-ts/Boolean'

console.log(concatAll(N.MonoidSum)([1, 2, 3, 4])) // => 10
console.log(concatAll(S.Monoid)(['The', 'Hamptons', 'sucks'])) // => 'TheHamptonssucks'

// Why is the initial value not needed anymore?

// Product Monoid
// Like with Semigroups, it's possible to define a monoid instance for a struct if we can defined a monoid instance for each of its fields. Similar to the struct combinator, tuple works with tuples.

import { struct, tuple } from 'fp-ts/Monoid'

type Point = {
  readonly x: number
  readonly y: number
}

const Monoid: Monoid<Point> = struct({
  x: N.MonoidSum,
  y: N.MonoidSum
})

type PointTuple = readonly [number, number]

const MondoidTuple: Monoid<PointTuple> = tuple(N.MonoidSum, N.MonoidSum)
