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

const Semigroup = <Se.Semigroup<ReadonlyArray<string>>>{
  concat: (first, second) => first.concat(second)
}

// concat can have differing meanings: sum, fusion, combination, substitution, merging etc.

// Implementation of the semigroup (number, +) where + is number addition
const SemigroupSum = <Se.Semigroup<number>>{
  concat: (first, second) => first + second
}

// Implementation of the semigroup (number, *) where * is number multiplication
const SemigroupProduct = <Se.Semigroup<number>>{
  concat: (first, second) => first * second
}

// Note: don't think of "semigroups of numbers" etc., because there are multiple semigroups for the type number, given the different associtative operations available. Also, it is possible for semigroups to share operations but differ in type.

//////////////////////
//
// concatAll
//
//////////////////////
