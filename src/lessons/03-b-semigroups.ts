// Definition: A magma whose concat operation is associative.

// Associativity:
// (x * y) * z === x * (y * z)
// Basically, the position of the parentheses doesn't have any bearing on the result.
// String concatenation is an example.

// All semigroups are magmas, but not vice versa. That is, semigroups extend magmas but have more laws to obey.

import { Magma } from 'fp-ts/Magma'

interface Semigroup<A> extends Magma<A> {}

// Semigroups capture the essense of parallelizable operations. If we know that an operation follows the associativity law, in can be broken down into subcomputations, and those subcomputations broken down further.

// If S is a semigroup, the following law must hold for every x, y, and z of type A:

// S.concat(S.concat(x, y), z) === S.concat(x, S.concat(y, z))

// NOTE: TypeScript's type system unfortunately cannot encode this law.

// Implementing a semigroup for set ReadonlyArray<string>

import * as Se from 'fp-ts/Semigroup'

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second)
}

// concat can have differing meanings: sum, fusion, combination, substitution, merging etc.

// Implementation of the semigroup (number, +) where + is number addition
const SemigroupSum: Se.Semigroup<number> = {
  concat: (first, second) => first + second
}

// Implementation of the semigroup (number, *) where * is number multiplication
const SemigroupProduct: Se.Semigroup<number> = {
  concat: (first, second) => first * second
}

// Two instances of Semigroup<boolean>

const SemigroupAll: Se.Semigroup<boolean> = {
  concat: (first, second) => first && second
}

const SemigroupAny: Se.Semigroup<boolean> = {
  concat: (first, second) => first || second
}

// Note: don't think of "semigroups of numbers" etc., because there are multiple semigroups for the type number, given the different associtative operations available. Also, it is possible for semigroups to share operations but differ in type.

//////////////////////
//
// concatAll
//
//////////////////////

// Concat combines two elements of type A. concatAll may be used to combine any number of elements. It takes:

// 1. An instance of a semigroup
// 2. An initial value
// 3. An array of elements

import { number as N, boolean as B, struct as Struct } from 'fp-ts'

const sum = Se.concatAll(N.SemigroupSum)(2)

console.log(sum([3, 4, 1, 2])) // => 12

const product = Se.concatAll(N.SemigroupProduct)(3)

console.log(product([2, 4, 3])) // => 72

// Applications - some fns from the standard JS library

const every = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => Se.concatAll(B.SemigroupAll)(true)(as.map(predicate))

const some = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => Se.concatAll(B.SemigroupAny)(false)(as.map(predicate))

const assign: (as: ReadonlyArray<object>) => object = Se.concatAll(
  Struct.getAssignSemigroup<object>()
)({})

//////////////////////
//
// Dual Semigroups
//
//////////////////////

// Given a semigroup instance, you can obtain a new instance by swapping the order in which the operands are combined within the concat fn

import { pipe } from 'fp-ts/function'
import { string as S } from 'fp-ts'

const reverse = <A>(S: Semigroup<A>): Semigroup<A> => ({
  concat: (first, second) => S.concat(second, first)
})

pipe(S.Semigroup.concat('a', 'b'), console.log) // => 'ab'
pipe(reverse(S.Semigroup).concat('a', 'b'), console.log) // => 'ba'

// Commutativity

// A binary operation is commutative if changing the order of operands doesn't change the result.

// In the above example of a Semigroup combinator, the concat function is not commutative (and in general, concat functions are not)
// An example of a commutative concat function might be a (first: boolean, second: boolean) => first && second;

//////////////////////
//
// Semigroup Product
//
//////////////////////

// Semigroups instances for more complex types can be achieved manually or with helper combinators from the fp-ts library

type Vector = {
  readonly x: number
  readonly y: number
}

const v1: Vector = { x: 1, y: 1 }
const v2: Vector = { x: 1, y: 2 }

// Models a sum of two vectors (manually)

const SemigroupVector: Semigroup<Vector> = {
  concat: (first, second) => ({
    x: N.SemigroupSum.concat(first.x, second.x),
    y: N.SemigroupSum.concat(second.x, second.y)
  })
}

console.log(SemigroupVector.concat(v1, v2))

// With the struct combinator

import { struct, tuple } from 'fp-ts/Semigroup'

const SemigroupVector2: Semigroup<Vector> = struct({
  x: N.SemigroupSum,
  y: N.SemigroupSum
})

// Vectors can be expressed as tuples, and combined with the combinator tuple

type VectorTuple = readonly [number, number]
const SemigroupVector3: Semigroup<VectorTuple> = tuple(
  N.SemigroupSum,
  N.SemigroupSum
)

const v3: VectorTuple = [1, 3]
const v4: VectorTuple = [3, 1]

console.log(SemigroupVector3.concat(v3, v4)) // => [4, 4]

//////////////////////
//
// Finding a Semigroup instance for any type
//
//////////////////////

// Sometimes it's unclear about whether merging or taking a selection of pieces of the same data type will be associative.
// You can always define a Semigroup instance not for type A itself but for NonEmptyArray<A>.

// This is called a Free Semigroup of A.

// type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
//   readonly 0: A
// }

// The concatentation of two NonEmptyArrays is still a NonEmptyArray

// const getSemigroup = <A>(): Se.Semigroup<ReadonlyNonEmptyArray<A>> => ({
//   concat: (first, second) => [first[0], ...first.slice(1), ...second]
// })

// Then map the contents of A to singletons (ReadonlyNonEmptyArrays<A> containing a single element).

// const of = <A>(a: A): ReadonlyNonEmptyArray<A> => [a];

// Applying this to a User type

import {
  getSemigroup,
  of,
  ReadonlyNonEmptyArray
} from 'fp-ts/ReadonlyNonEmptyArray'

type User = {
  readonly id: number
  readonly name: string
}

// This is a Semigroup instance of ReadonlyNonEmptyArray<User>, not User itself

const FSUser: Semigroup<ReadonlyNonEmptyArray<User>> = getSemigroup<User>()

declare const user1: User
declare const user2: User
declare const user3: User

// The merge/concat operation can now be achieved by passing singletons of A

const merge: ReadonlyNonEmptyArray<User> = FSUser.concat(
  FSUser.concat(of(user1), of(user2)),
  of(user3)
)

// So, the free semigroup of A is just another semigroup whose elements are all possible, non-empty, finite sequences of A.

// The free semigroup of A can be seen as a lazy way to concat elements of type A while preserving their data content. The value of merge tells us which elements to concatenate and which order they're in.

//////////////////////
//
// Order-derivable Semigroups
//
//////////////////////

// number is a total order.
// For total orders, given any x and y, the following law must hold true:

// x <= y or y <= x

// We can thus define another two Semigroup<number> instances using the min and max operations.

const SemigroupMin: Se.Semigroup<number> = {
  concat: (first, second) => Math.min(first, second)
}

const SemigroupMax: Se.Semigroup<number> = {
  concat: (first, second) => Math.max(first, second)
}

// The total ordering of number is important here, because the concatentation operation is closed on number.
// To define such semigroups for other data types, equality must be considered
