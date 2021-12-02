// Equivalence relations denote equivalence between elements of the same type.
// This notion of equivalence relation can be implemented in TS thus

// interface Eq<A> {
//   readonly equals: (first: A, second: A) => boolean
// }

import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

// This is an instance of Eq for the number type

const EqNumber: Eq<number> = {
  equals: (first, second) => first === second
}

pipe(EqNumber.equals(1, 1), console.log) // => true
pipe(EqNumber.equals(2, 1), console.log) // => false

// The following laws must hold true for any instance of Eq
// Reflexivity: equals(x, x) === true for every x in A
// Symmetry: equals(x, y) === equals(y, x) for every x and y in A
// Transitivity: equals(x, y) === true and equals(y, z) === true, then equals(x, z) must be true for every x, y, and z in A

// A 'reverse' combinator works fine because of the symmetry rule.
// A 'not' combinator... I don't think so.

import * as N from 'fp-ts/number'

// Defining a fn elem that checks if a given value is an element of a ReadonlyArray

const elem = <A>(E: Eq<A>) => (a: A) => (as: ReadonlyArray<A>): boolean =>
  as.some((e) => E.equals(e, a))

pipe([1, 2, 3], elem(N.Eq)(2), console.log) // true
pipe([1, 2, 3], elem(N.Eq)(4), console.log) // false

// Why wouldn't we use the native includes Array method?
// Let's see why with some more complex types

type Point = {
  readonly x: number
  readonly y: number
}

const EqPoint: Eq<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y
}

EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 }) // => true
EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: -2 }) // => false

const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]

const search: Point = { x: 1, y: 1 }

console.log(points.includes(search)) // => false :-(
pipe(points, elem(EqPoint)(search), console.log) // => true! :-)

// Array.includes compares objects by identity, not the data they hold (pass by reference)

// The data type Set suffers the same issue, i.e. it doesn't offer handy APIs for testing user-defined equality.

const pointsSet: Set<Point> = new Set([{ x: 0, y: 0 }])
pointsSet.add({ x: 0, y: 0 })
console.log(pointsSet) // => Set(2) { { x: 0, y: 0 }, { x: 0, y: 0 } }

// In order to check for equality in these cases, we must provide our own equality-testing API.
// Steps below

// Firstly, rather than all of the boilerplate of EqPoint, we can use the struct combinator to return an Eq instance with an appropriate equals method.

import { struct } from 'fp-ts/Eq'

const EqPoint2: Eq<Point> = struct({
  x: N.Eq,
  y: N.Eq
})

// As with Semigroups, we can also work with tuples

import { tuple } from 'fp-ts/Eq'

type PointTuple = [number, number]
const EqPointTuple: Eq<PointTuple> = tuple(N.Eq, N.Eq)

// We can also derive an Eq instance for ReadonlyArrays

import * as A from 'fp-ts/ReadonlyArray'

const EqPointA: Eq<ReadonlyArray<PointTuple>> = A.getEq(EqPointTuple)

// Importantly, it's possible to define multiple Eq instances for a given data type, cf. Haskell, which only allows one.

// The equality of, e.g., a User type, may differ depending on context. E.g. sometimes it might be necessary to define a standard Eq to check identicality, and another to check if only the ID property is the same.

import * as S from 'fp-ts/string'

type User = {
  readonly id: number
  readonly name: string
}

const EqStandard: Eq<User> = struct({
  id: N.Eq,
  name: S.Eq
})

// const EqId: Eq<User> = {
//   equals: (first, second) => N.Eq.equals(first.id, second.id)
// }

// Or, rather manually defining EqId, we could use the combinator contramap
// Given an instance Eq<A> and a function from B to A, we can derive an Eq<B>

// import { contramap } from "fp-ts/Eq"

// const EqId: Eq<User> = pipe(

// )
