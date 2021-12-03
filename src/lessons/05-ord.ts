// A total order relation can be implemented in TS thusly:

import { Eq } from 'fp-ts/Eq'

type Ordering = -1 | 0 | 1

interface OrdInterface<A> extends Eq<A> {
  compare: (x: A, y: A) => Ordering
}

// This results in:

// x < y only if compare(x, y) = -1
// x = y only if compare(x, y) = 0
// x > y only if compare(x, y) = 1

// Defining an Ord instance of number

const OrdNumber: OrdInterface<number> = {
  equals: (first, second) => first === second,
  compare: (first, second) => (first < second ? -1 : first > second ? 1 : 0)
}

// The following laws must hold true for any Ord instance:
// 1. Reflexivity: compare(x, x) <= 0 for every x in A
// 2. Antisymmetry: if compare(x, y) <= 0 and compare(y, x) <= 0 then x = y for every x, y in A.
// 3. Transitivity: if compare(x, y) <= 0 and compare(y, z) <= 0 then compare(x, z) <= 0 for every x, y, z in A.

// compare must also be compatible with the equals operation from Eq.
// compare(x, y) === 0 if and only if equals(x, y) === true for every x, y in A.

// Equals can of course be derived from compare:
// equals: (first, second) => compare(first, second) === 0

// Defining an Ord can be easily achieved with fp-ts by supplying the compare function to the helper, fromCompare

import { Ord, fromCompare } from 'fp-ts/Ord'

const OrdNumberFromCompare: Ord<number> = fromCompare((first, second) =>
  first < second ? -1 : first > second ? 1 : 0
)

// A practical usage of an Ord instance in a sort method for ReadOnlyArray
// It leverages the native Array slice method so it doesn't mutate the passed in Array.

import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'

const sort = <A>(O: Ord<A>) => (as: ReadonlyArray<A>) =>
  as.slice().sort(O.compare)

pipe([3, 2, 4], sort(N.Ord), console.log) // => [2, 3, 4]

// Another practical usage - a min function that returns a the smallest of two vals

const min = <A>(O: Ord<A>) => (second: A) => (first: A) =>
  O.compare(first, second) === -1 ? first : second

pipe(2, min(N.Ord)(1), console.log) // => 1

//////////////////////
//
// Dual Ordering
//
//////////////////////

// Just as we can use a reverse combinator to invert a Semigroup's concat operation and obtain a dual semigroup, we can invert an Ord's compare function to get dual ordering.

// Reverse combinator for ord:

const reverse = <A>(O: Ord<A>): Ord<A> =>
  fromCompare((first, second) => O.compare(second, first))

// Usage example: obtaining a max function from the min function
import { flow } from 'fp-ts/function'

const max = flow(reverse, min)

pipe(2, max(N.Ord)(1), console.log) // => 2

// The totality of ordering (meaning that one of two conditions needs to hold true: x <= y or y <= z for any given x and y) is clear for numbers but not so clear for complex data types.

type User = {
  name: string
  age: number
}

// Defining an Ord<User> instance depends on context. But perhaps by age -

const byAgeFromCompare: Ord<User> = fromCompare((first, second) =>
  N.Ord.compare(first.age, second.age)
)

// Again, some boilerplate can be removed by using the combinator: given an Ord<A> instance and a function from B to A, it is possible to derive Ord<B>

import { contramap } from 'fp-ts/Ord'

const byAge: Ord<User> = pipe(
  N.Ord,
  contramap((user: User) => user.age)
)

// Get the youngest of two users using previously defined min()

const getYounger = min(byAge)

pipe(
  { name: 'Steven', age: 33 },
  getYounger({ name: 'Harvin', age: 27 }),
  console.log
)

// Now, with the Ord abstraction, it's possible to capture the notion of total ordering for types other than number, like we did with Semigroups

import { Semigroup } from 'fp-ts/Semigroup'

// const SemigroupMin: Semigroup<number> = {
//   concat: (first, second) => Math.min(first, second)
// }

// const SemigroupMax: Semigroup<number> = {
//   concat: (first, second) => Math.max(first, second)
// }

const SemigroupMin = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? second : first)
})

const SemigroupMax = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? first : second)
})

console.log(
  SemigroupMin(byAge).concat(
    { name: 'Steven', age: 33 },
    { name: 'Harvin', age: 27 }
  )
)

console.log(
  SemigroupMax(byAge).concat(
    { name: 'Steven', age: 33 },
    { name: 'Harvin', age: 27 }
  )
)
