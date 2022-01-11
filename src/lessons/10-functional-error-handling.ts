//////////////////
///
/// Functional Error-Handling
///
//////////////////

import { readonlyArray } from 'fp-ts'

// Any function that can return errors or throw exceptions is a partial function, and partial functions can be made total by supplying a None value to their codomain for every value of X for which the function is undefined.
// f': X -> Option(Y)

//////////////////
///
/// Option
///
//////////////////

// represents a failure
interface None {
  readonly _tag: 'None'
}

// represents a success
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>

// Constructors and pattern-matching with match() - alias of fold()

const none: Option<never> = { _tag: 'None' }
const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })

const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (
  fa: Option<A>
) => {
  switch (fa._tag) {
    case 'None':
      return onNone()
    case 'Some':
      return onSome(fa.value)
  }
}

// Without the Option type, the type system is ignorant about the possibility of failure and we have to throw exceptions:
//                             this is a lie ↓
const headWrong = <A>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}

let s: string
try {
  s = String(headWrong([]))
} catch (e: any) {
  s = e.message
}

console.log(s) // => "Empty array"

// Compare this to:
import { pipe } from 'fp-ts/function'
const headCorrect = <A>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])

declare const numbers: ReadonlyArray<number>

// const result = pipe(
//   headCorrect(numbers),
//   match(
//     () => 'Empty array',
//     (n) => String(n)
//   )
// )

// where the possibility of an error is encoded into the type system.
// E.G.
// const result2 = headCorrect(numbers)
// result2.value // Property 'value' does not exist on type 'Option<number>'.

//////////////////
///
/// An Eq instance
///
//////////////////

// Checking if two values of Option<string> are equal.

import { option as Option } from 'fp-ts'

const o1: Option<string> = some('foo')
const o2: Option<string> = some('bar')

const result3 = pipe(
  o1,
  match(
    () =>
      pipe(
        o2,
        match(
          () => true,
          () => false
        )
      ),
    (s1) =>
      pipe(
        o2,
        match(
          () => false,
          (s2) => s1 === s2
        )
      )
  )
)

// But then suppose we have to compare for equality two values of Option<number>. It's hassle to repeat all the above code, only changing the line for comparing equality.
// Instead we can abstract this idea away into a combinator that, given an Eq<A>, returns an Eq<Option<A>>.
// To this we can pass a StringEq, NumberEq - or whatever - and the correct equality check will be encoded.

import { eq as Eq, string as S } from 'fp-ts'

const getEq = <A>(E: Eq.Eq<A>): Eq.Eq<Option<A>> => ({
  equals: (first, second) =>
    pipe(
      first,
      Option.fold(
        () =>
          pipe(
            second,
            Option.fold(
              () => true,
              () => false
            )
          ),
        (a1) =>
          pipe(
            second,
            Option.fold(
              () => false,
              (a2) => E.equals(a1, a2)
            )
          )
      )
    )
})

const EqOptionString = getEq(S.Eq)

console.log(EqOptionString.equals(none, none)) // => true
console.log(EqOptionString.equals(none, some('b'))) // => false
console.log(EqOptionString.equals(some('a'), none)) // => false
console.log(EqOptionString.equals(some('a'), some('b'))) // => false
console.log(EqOptionString.equals(some('a'), some('a'))) // => true

// Now that we can define an Eq instance for Option<A>, we can leverage all the combinators for Eq.

import { tuple } from 'fp-ts/Eq'
import { number as N } from 'fp-ts'

type MyTuple = readonly [string, number]
const EqMyTuple = tuple<MyTuple>(S.Eq, N.Eq)
const EqOptionMyTuple = getEq(EqMyTuple)

const o3: Option<MyTuple> = some(['a', 1])
const o4: Option<MyTuple> = some(['a', 2])
const o5: Option<MyTuple> = some(['b', 1])

console.log(EqOptionMyTuple.equals(o3, o3)) // => true
console.log(EqOptionMyTuple.equals(o3, o4)) // => false
console.log(EqOptionMyTuple.equals(o3, o5)) // => false

// Slightly modifying the imports above, we can obtain an Ord instance for Option<A>

import { getOrd, isNone } from 'fp-ts/Option'
import { tuple as tupleOrd } from 'fp-ts/Ord'

const OrdMyTuple = tupleOrd<MyTuple>(S.Ord, N.Ord)
const OrdOptionMyTuple = getOrd(OrdMyTuple)

const o6: Option<MyTuple> = some(['a', 1])
const o7: Option<MyTuple> = some(['a', 2])
const o8: Option<MyTuple> = some(['b', 1])

console.log(OrdOptionMyTuple.compare(o6, o6)) // => 0
console.log(OrdOptionMyTuple.compare(o6, o7)) // => -1
console.log(OrdOptionMyTuple.compare(o6, o8)) // => -1

//////////////////
///
/// Semigroup and Monoid instances
///
//////////////////

// Suppose we want to merge/concat two Option<A>s.
// Four cases:
// 1. x = none, y = none, concat(x, y) = none
// 2. x = some(a), y = none, concat(x, y) = none
// 3. x = none, y = some(a), concat(x, y) = none
// 4. x = some(a), y = some(b), concat(x, y) = ?

// To solve 4., just provide a Semigroup instance for A and then derive a Semigroup instance for Option<A>.

// It's also possible to define a Monoid instance for Option<A> that behaves like:
// 1. x = none, y = none, concat(x, y) = none
// 2. x = some(a1), y = none, concat(x, y) = some(a1)
// 3. x = none, y = some(a2), concat(x, y) = some(a2)
// 4. x = some(a1), y = some(a2), concat(x, y) = some(S.concat(a1, a2))

// To achieve this, use the getMonoid() combinator for a given Semigroup instance.

// 2 more useful Monoids

// 1. Returning the left-most non-None value

// 1. x = none, y = none, concat(x, y) = none
// 2. x = some(a1), y = none, concat(x, y) = some(a1)
// 3. x = none, y = some(a2), concat(x, y) = some(a2)
// 4. x = some(a1), y = some(a2), concat(x, y) = some(a1)

import { monoid as M } from 'fp-ts'
import { getMonoid } from 'fp-ts/Option'
import { first, last } from 'fp-ts/Semigroup'

const getFirstMonoid = <A = never>(): M.Monoid<Option<A>> => getMonoid(first())

// and 2. Its dual (Monoid returning the right-most non-None value)

// 1. x = none, y = none, concat(x, y) = none
// 2. x = some(a1), y = none, concat(x, y) = some(a1)
// 3. x = none, y = some(a2), concat(x, y) = some(a2)
// 4. x = some(a1), y = some(a2), concat(x, y) = some(a2)

const getLastMonoid = <A = never>(): M.Monoid<Option<A>> => getMonoid(last())

// getLastMonoid can be useful to handle optional values.

import { struct } from 'fp-ts/Monoid'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  readonly fontFamily: Option<string>
  /** Controls the font size in pixels */
  readonly fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
  readonly maxColumn: Option<number>
}

const monoidSettings: M.Monoid<Settings> = struct({
  fontFamily: getMonoid(last()),
  fontSize: getMonoid(last()),
  maxColumn: getMonoid(last())
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

// userSettings overrides workspaceSettings as it is in the 'a2' position, i.e. last, and monoidSettings derives a monoid whose concat function returns the 'last'.

console.log(monoidSettings.concat(workspaceSettings, userSettings))

//////////////////
///
/// The Either type
///
//////////////////

// Options are useful to handle the results of partial functions, but the None type gives us no information on why the computation failed.

// Enter: Either.

// represents a failure
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

// represents a success
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>

const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })

const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right })

const foldEither = <E, R, A>(
  onLeft: (left: E) => R,
  onRight: (right: A) => R
) => (fa: Either<E, A>) => {
  switch (fa._tag) {
    case 'Left':
      return onLeft(fa.left)
    case 'Right':
      return onRight(fa.right)
  }
}

// Using the Either type in the node callback example (Either is a sum type that is great for error handling)

declare const readFile: (
  path: string,
  callback: (result: Either<Error, string>) => void
) => void

readFile('./somePath', (e) =>
  pipe(
    e,
    foldEither(
      (err) => `Error: ${err.message}`,
      (data) => `Data: ${data.trim()}`
    ),
    console.log
  )
)
