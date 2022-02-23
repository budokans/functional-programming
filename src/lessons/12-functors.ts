//////////////////
///
/// Case study
///
//////////////////

import {
  option as O,
  readonlyNonEmptyArray as REA,
  readonlyArray as A
} from 'fp-ts'

// We're trying to compose two functions, one which returns the first number of a non-empty array of numbers, and one which takes that value and doubles it.

// Our case study relates to 2. directly above, where F is the Option type.
declare const head: (as: REA.ReadonlyNonEmptyArray<number>) => O.Option<number>
declare const double: (n: number) => number

//////////////////
///
/// Functors
///
//////////////////

// Finding a solution to composing two generic functions is so important because if it's true that Categories can be used to model typed programming languages, then morphisms can be able to model programs => A concrete way of composing programs in a generic way.

// ** Functions as Programs ** //

// Immediate issue: How do we model a programs that produces side effects with pure functions?
// Answer: Model side effects through effects - special types that represent side effects.

// Two ways to model side effects with effects in JavaScript:
// 1. Domain Specific Language (DSL) for effects: combine effects and define an interpreter able to execute the side effects when launching the final program.
// 2. Thunks: a subroutine used to inject a calculation into another subroutine. They delay calculation until the result is needed. They can also be used to insert operations and the beginning or end of another subroutine.

// 1.
// DSL would mean modifying a program like:
const log = (message: string): void => console.log(message)

// to:
type DSL = { type: 'log'; message: string } | { type: 'modifyState' } // sum type of every possible side effect handled by the system

const log2 = (message: string): DSL => ({ type: 'log', message })
// NOTE: This log2 function isn't pure because of object referential inequality.

// 2. THUNKS!
// type IO<A> = () => A;
import { io as IO } from 'fp-ts'
const logIO = (message: string): IO.IO<void> => () => console.log(message)
const main = logIO('Hello!')
// This won't be executed until launching the program. Currently log only returns a value representating the computation - an action.
// Main is an inert value and nothing is logged yet.
main()
// Only when running the final program does the effect occur.

// In functional programming, it is a tendency to shove side effects (in the form of effects) towards the border of the sytem - the main() function - where they are executed by an interpreter with the following schema:

// system = pure core + imperative shell

// Even with this thunk technique, we still need a way to combine effects, meaning we need to be able to compose functions in a generic way.

// ** A pure program ** //
// (a: A) => B
// E.G. The len program
const len = (str: string): number => str.length

// ** An effectful program ** //
// (a: A) => F<B>

// This latter signature models a program that accepts an input of type A, but returns B together with an effect F, which represents some kind of type constructor.

// TYPE CONSTRUCTOR:
// An n-ary type operator that takes one or more types as arguments and returns another type. Option, ReadonlyArray and Either are type constructors.

// E.G. The head program
const headEG = <A>(as: ReadonlyArray<A>): O.Option<A> =>
  as.length > 0 ? O.some(as[0]) : O.none
// The head program is a program with an Option effect.

// With effects, we are talking about n-ary contructors where n >= 1.

//////////////////
///
/// Type Constructors and their effect interpretations
///
//////////////////

// 1. ReadonlyArray<A> - A non-deterministic computation
// 2. Option<A> - a computation that may fail
// 3. Either<E, A> - a computation that may fail
// 4. IO<A> - a synchronous computation that never fails
// 5. Task<A> - an asynchronous computation that never fails
// 6. Reader<R, A> - reading from an environment

// where

// A thunk returning a promise
type Task<A> = () => Promise<A>

// R represents an environment that can be 'read' from; A is the result.
type Reader<R, A> = (r: R) => A

//////////////////
///
/// Back to the core problem
///
//////////////////

// If B = C, then we con use the usual function composition to compose two generic functions f: (a: A) => B, and g: (c: C) => D.

// If B != C, we need to add boundaries to B and C.

//////////////////
///
/// A Boundary that leads to Functors
///
//////////////////

// If we introduce the boundary B = F<C> for a given Functor F, then
// f: (a: A) => F<B> is an effectful program
// g: (b: B) => C is a pure program

// To compose f with g, we need to find a way to get the codomain of f to be the same as the domain of g.

// In other words, we need to find some procedure that will turn function g from (b: B) => C to (fb: F<B>) => F<C> in order to use the usual function composition.

// We can introduce a function, map, that operates in this way.

//////////////////
///
/// Example 1: ReadonlyArray
///
//////////////////

import { pipe } from 'fp-ts/function'

const mapRA = <B, C>(g: (b: B) => C) => (
  fb: ReadonlyArray<B>
): ReadonlyArray<C> => fb.map(g)

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers
const getName = (user: User): string => user.name

const getFollowersNames = (user: User) =>
  pipe(user, getFollowers, mapRA(getName))

const user: User = {
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [
    { id: 2, name: 'Terry R. Emerson', followers: [] },
    { id: 3, name: 'Marsha J. Joslyn', followers: [] }
  ]
}

console.log(getFollowersNames(user)) // => [ 'Terry R. Emerson', 'Marsha J. Joslyn' ]

//////////////////
///
/// Example 2: Option
///
//////////////////

import { flow } from 'fp-ts/function'

const mapOpt = <B, C>(g: (b: B) => C): ((fb: O.Option<B>) => O.Option<C>) =>
  O.fold(
    () => O.none,
    (b) => {
      const c = g(b)
      return O.some(c)
    }
  )

const head2: (input: ReadonlyArray<number>) => O.Option<number> = A.head
const doubleVal = (n: number): number => n * 2
const getDoubleHead = flow(head2, mapOpt(doubleVal))

console.log(getDoubleHead([1, 2, 3])) // => some(2)
console.log(getDoubleHead([])) // => none

//////////////////
///
/// Example 3: IO
///
//////////////////

const mapIO = <B, C>(g: (b: B) => C) => (fb: IO.IO<B>): IO.IO<C> => () => {
  const b = fb()
  return g(b)
}

interface User2 {
  readonly id: number
  readonly name: string
}

const database: Record<number, User2> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): IO.IO<User2> => () => database[id]
const getName2 = (user: User2): string => user.name
const getUserName = flow(getUser, mapIO(getName2))

console.log(getUserName(1)()) // 'Ruth R. Gonzalez'

//////////////////
///
/// Example 4: Task
///
//////////////////

import { task as T } from 'fp-ts'

const mapT = <B, C>(g: (b: B) => C) => (fb: T.Task<B>): Task<C> => () => {
  const promise = fb()
  return promise.then(g)
}

const getUserT = (id: number): Task<User2> => () =>
  Promise.resolve(database[id])

const getUserNameT = flow(getUserT, mapT(getName2))

getUserNameT(1)().then(console.log) // 'Ruth R. Gonzalez'

//////////////////
///
/// Example 5: Reader
///
//////////////////

import { reader as R } from 'fp-ts'

const mapR = <B, C>(g: (b: B) => C) => <R>(
  fb: R.Reader<R, B>
): R.Reader<R, C> => (r) => {
  const b = fb(r)
  return g(b)
}

interface Env {
  // a dummy in-memory database
  readonly database: Record<string, User2>
}

const getUserR = (id: number): R.Reader<Env, User2> => (env) => env.database[id]
const getUserNameR = flow(getUserR, mapR(getName2))

console.log(getUserNameR(2)({ database })) // Ruth R. Gonzalez

// Functors are maps between categories that preserve the structure of the category, meaning they preserve the identity morphisms and the composition operation.

// A functor, like a category, is a pair of two things:
//   1. A map between objects that binds every object X in C to an object in D.
//   2. A map between morphisms that binds every morphism f in C to a morphism map(f) in D.
//   Where C and D are two categories (AKA two typed programming languages).

//   We're more interested in a map where C and D are the same (the TS category). In this case we're talking about endofunctors. Unless otherwise specified, we refer to endofunctors when talking about functors."

// Definition:
// A pair (F, map where):
// 1. F is an n-ary (n >= 1) type constructor mapping every type X in a type F<X> (map between objects)
// 2. map is a function such that <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>) that maps every function f: (a: A) => B in a function map(f): (fa: F<A>) => F<B> (map between morphisms)

// The following properties must hold true:
// 1. map(1x) = 1FX (identities map to identities)
// 2. map(g ∘ f) = map(g) ∘ map(f)

// The second law allows us to refactor and optimize something like:

import { increment } from 'fp-ts/function'
import { map } from 'fp-ts/ReadonlyArray'

const double2 = (n: number): number => n * 2

// iterates array twice
console.log(pipe([1, 2, 3], map(double2), map(increment))) // => [ 3, 5, 7 ]

// single iteration
console.log(pipe([1, 2, 3], map(flow(double2, increment)))) // => [ 3, 5, 7 ]

//////////////////
///
/// Functors and Functional Error-Handling
///
//////////////////

// Functors are great for functional error handling. Consider the following function: The findIndex API requires an if branch to test whether a the result is different than -1. This -1 could be unintentionally passed to doSomethingWithIndex.

declare const doSomethingWithIndex: (index: number) => string

export const program = (ns: ReadonlyArray<number>): string => {
  // -1 indicates that no element has been found
  const i = ns.findIndex((n) => n > 0)
  if (i !== -1) {
    return doSomethingWithIndex(i)
  }
  throw new Error('cannot find a positive number')
}

// With an Option and its functor instance, error-handling takes place behind the scenes thanks to map.

const betterProgram = (ns: ReadonlyArray<number>): O.Option<string> =>
  pipe(
    ns,
    A.findIndex((n) => n > 0),
    O.map(doSomethingWithIndex)
  )

//////////////////
///
/// Functors Compose
///
//////////////////

// Given two functors F and G, the composition F<G<A>> is still a functor and map of this composition is the composition of the maps.

// Example: F = Task, G = Option

type TaskOption<A> = T.Task<O.Option<A>>

const mapTO: <A, B>(
  f: (a: A) => B
) => (fa: TaskOption<A>) => TaskOption<B> = flow(O.map, T.map)

const getUserTO = (id: number): TaskOption<User2> => () =>
  Promise.resolve(O.fromNullable(database[id]))

const getUserNameTO = flow(getUserTO, mapTO(getName2))

getUserNameTO(1)().then(console.log) // some('Ruth R. Gonzalez)
getUserNameTO(4)().then(console.log) // none

//////////////////
///
/// Contravariant Functors
///
//////////////////

// The hitherto-discussed functors are covariant functors.
// A variant of the functor concept is the contravariant functor. The definition is the same, except for the signature of its fundamental operation, which is contramap instead of map.

import { eq as Eq, number as Number } from 'fp-ts'

const getId = (_: User2): number => _.id

// Map operates like: (fa: Option<User2) => Option<number>
const getIdOption = O.map(getId)

// Contramap is like: (fa: Eq<number>) => Eq<User>
const getIdEq = Eq.contramap(getId)

const EqID = getIdEq(Number.Eq)

//////////////////
///
/// Functors in fp-ts
///
//////////////////

// Type classes with parametric properties are good candidates for functor instances because functors must be n-ary (where n >= 1) type constructors, by definition.

// Defining a functor instance in fp-ts requires the definition of a map function that maps a function f: (a: A) => B to fa: (fa: F<A>) => F<B>.

import { Functor1 } from 'fp-ts/Functor'

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>
  }
}

// body is parametric, so Response is a good candidate
interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

const mapResponse = <A, B>(f: (a: A) => B) => (
  fa: Response<A>
): Response<B> => ({
  ...fa,
  body: f(fa.body)
})

const FunctorR: Functor1<'Response'> = {
  URI: 'Response',
  map: (fa, f) => pipe(fa, mapResponse(f))
}

//////////////////
///
/// Do Functors solve the general problem?
///
//////////////////

// So far, Functors have allowed us to compose an effectful program f with a pure program g.
// But g is a unary function - what if g needs to take two or more arguments?

// Program f      Program g            Composition
// pure           pure                 g ∘ f
// effectful      pure (unary)         map(g) ∘ f
// effectful      pure (n-ary, n > 1)  ???
