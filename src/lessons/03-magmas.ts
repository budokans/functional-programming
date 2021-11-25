//////////////////////////////
//
// Modelling Composition with Semigroups
//
//////////////////////////////

// Semigroups are an algebra.

// Def (algebra):
// A combination of:
//   1. One or more sets (types - sets are basically all members of a type, e.g. all integers)
//   2. One or more operations on those sets
//   3. Zero or more laws on the previous operations

// Alegbras may be thought of as an abstraction of interfaces.
// "When an interface is modified, the only allowed operations are those defined by the interface itself in accordance with its own laws."

//////////////
//
// Magmas
//
//////////////

// Def: Magmas are a simple algebra that have:
//  1. A set or type (A)
//  2. A concat operation
//  3. No laws to obey

interface Magma<A> {
  readonly concat: (first: A, second: A) => A
}

// The concat operation is 'closed' on set A, meaning that whichever operations are performed on element/s of type A result in element/s of type A.

// Since the result is still an A, it can be input for concat and the operation can be repeated.
// Concat is a combinator for A, and a combinator is defined as Thing -> Thing.

import { Magma as M } from 'fp-ts/Magma'

const MagmaSub: M<number> = {
  concat: (first, second) => first - second
}

// helper

const getPipeableConcat = <A>(m: Magma<A>) => (second: A) => (first: A): A =>
  m.concat(first, second)
const concat = getPipeableConcat(MagmaSub)

// usage eg

import { pipe } from 'fp-ts/function'
pipe(10, concat(2), concat(3), concat(3), console.log)
// => 2

// DEFINITION: Given a non-empty set A and a binary operation * closed on A, then the pair (A, *) is a magma.
// They do not obey any law other than the closure requirement.
