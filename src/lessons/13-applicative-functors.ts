//////////////////
///
/// Applicative Functors
///
//////////////////

// When g is a n-ary (n > 1) function and we need to compose it with f, we can start by currying it.

// g: (b: B, c: C) => D
// g: (b: B) => (c: C) => D

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User, user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

// refactored using currying

const addFollowerC = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

const user: User = { id: 1, name: 'Ruth R. Gonzalez', followers: [] }
const follower: User = { id: 3, name: 'Marsha J. Joslyn', followers: [] }

console.log(addFollowerC(follower)(user))
/*
{
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [ { id: 3, name: 'Marsha J. Joslyn', followers: [] } ]
}
*/

//////////////////
///
/// The ap operation
///
//////////////////

// This doesn't work so great with effects though. Consider that we only have ids for both user and follower, and we need to use an API fetchUser that, given an id, queries an endpoint and returns the correspondeing User.

import { task as T } from 'fp-ts'

declare const fetchUser: (id: number) => T.Task<User>
const userId = 1
const followerId = 3

const result = addFollowerC(fetchUser(userId))(fetchUser(followerId)) // does not compile as fetchUser returns a Task.

// If only we had a function like:

declare const addFollowerAsync: (
  follower: T.Task<User>
) => (user: T.Task<User>) => T.Task<User>

const result2 = addFollowerAsync(fetchUser(userId))(fetchUser(followerId)) // compiles

// Instead of implementing something like addFollowerAsync manually, it'd be really nice to have a transformation that can transform a function:

// g: (b: B) => (c: C) => D
// to
// g: (fb: F<B>) => (fc: F<C>) => F<D>

//////////////////
///
/// liftA2
///
//////////////////

// Given that g is now a unary function, we can obtain this transformation using the functor instance and the good old map:

// map(g): (fb: F<B>) => F<(c: C) => D>

// But now's we're blocked because there's no legal operation provided by the functor instance to unpack the type F<(c: C) => D> into (fc: F<C>) => F<D>.

// For this we need a function ap - think applying a function wrapped in an effect to a value wrapped in an effect.

// apply applies a function to a value
//                       value        returned function
declare const apply: <A>(a: A) => <B>(f: (a: A) => B) => B

// ap applies a function wrapped in an effect to a value wrapped in an effect
//                value in effect                    function wrapped in effect
declare const ap: <A>(
  fa: T.Task<A>
) => <B>(fab: T.Task<(a: A) => B>) => T.Task<B>

// With ap we can define liftA2:

import { function as F } from 'fp-ts'

const liftA2 = <B, C, D>(g: (b: B) => (c: C) => D) => (fb: T.Task<B>) => (
  fc: T.Task<C>
): T.Task<D> => F.pipe(fb, T.map(g), ap(fc))
//                              apply fc to the function contained in the F<(c: C) => D>

// And now we can lift the types for the function addFollowerC
const addFollowerLifted = liftA2(addFollowerC)

// And now we can finally compose fetchUser with the previous result.
//             f: (a: A) => F<B>  g: (fb: F<B>) => (fc: F<C>) => F<D>
const program = F.flow(fetchUser, liftA2(addFollowerC))
const resultTask = program(followerId)(fetchUser(userId))

// Now we have a standard procedure to compose two functions:
// f: (a: A) => B
// g: (b: B, c: C) => D

// 1. Curry the function g
// 2. Define ap for the effect F
// 3. Define liftA2 for the effect F
// 4. Obtain the composition flow(f, liftA2(g))

// Here's ap implement for some familiar type constructors:

//////////////////
///
/// 1. F = ReadonlyArray
///
//////////////////

const apREA = <A>(fa: ReadonlyArray<A>) => <B>(
  fab: ReadonlyArray<(a: A) => B>
): ReadonlyArray<B> => {
  const out: Array<B> = []
  for (const f of fab) {
    for (const a of fa) {
      out.push(f(a))
    }
  }
  return out
}

const double = (n: number): number => n * 2

F.pipe([double, F.increment], apREA([1, 2, 3]), console.log)

//////////////////
///
/// 2. F = Option
///
//////////////////

import { option as O } from 'fp-ts'

const apO = <A>(fa: O.Option<A>) => <B>(
  fab: O.Option<(a: A) => B>
): O.Option<B> =>
  F.pipe(
    fab,
    O.fold(
      () => O.none,
      (f) =>
        F.pipe(
          fa,
          O.fold(
            () => O.none,
            (a) => O.some(f(a))
          )
        )
    )
  )

F.pipe(O.some(double), apO(O.some(3)), console.log) //  => some(6)
F.pipe(O.some(double), apO(O.none), console.log) // => none
F.pipe(O.none, apO(O.some(2)), console.log) // => none
F.pipe(O.none, apO(O.none), console.log) // => none

//////////////////
///
/// 3. F = IO
///
//////////////////

import { io as IO } from 'fp-ts'

const apIO = <A>(fa: IO.IO<A>) => <B>(
  fab: IO.IO<(a: A) => B>
): IO.IO<B> => () => {
  const f = fab()
  const a = fa()
  return f(a)
}

//////////////////
///
/// 4. F = Task
///
//////////////////

const apT = <A>(fa: T.Task<A>) => <B>(
  fab: T.Task<(a: A) => B>
): T.Task<B> => () => Promise.all([fa(), fab()]).then(([a, f]) => f(a))

//////////////////
///
/// 5. F = Reader
///
//////////////////

import { reader as R } from 'fp-ts'

const apR = <R, A>(fa: R.Reader<R, A>) => <B>(
  fab: R.Reader<R, (a: A) => B>
): R.Reader<R, B> => (r) => {
  const a = fa(r)
  const f = fab(r)
  return f(a)
}

// For function whose arity is higher than 2, we can compose function liftAn with map and ap.

const liftA3 = <B, C, D, E>(g: (b: B) => (c: C) => (d: D) => E) => (
  fb: T.Task<B>
) => (fc: T.Task<C>) => (fd: T.Task<D>): T.Task<E> =>
  F.pipe(fb, T.map(g), apT(fc), apT(fd))

// etc

// Now we can update the Composition Table

// Program f      Program g            Composition
// pure           pure                 g ∘ f
// effectful      pure (unary)         map(g) ∘ f
// effectful      pure (n-ary, n > 1)  liftAn(g) ∘ f
