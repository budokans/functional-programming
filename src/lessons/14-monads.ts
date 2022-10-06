// Applicatives don't solve problems that arise when BOTH programs are effectful, e.g.

// f: (a: A) => F<B>
// g: (b: B) => F<C>

// For that, we need monads

//////////////////
///
/// The problem with nested contexts
///
//////////////////

// The flatten function, which lifts the value nested within a monad within a monad is constantly in need when mapping functions that admit a monad instance over a monad.

// Think ReadonlyArrays of ReadonlyArrays - ReadonlyArray<ReadonlyArray<A>>
// ... Options of Options - Option<Option<A>>

//////////////////
///
/// Monad Definition
///
//////////////////

// A Monad is combination of three things, and its of and chain operations must obey three laws.

// A Monad is:
// 1. A type constructor that admits a Functor instance.
// 2. An of function (also called 'pure' or 'return') with signature
//                      of: <A>(a: A) => M<A>
// 3. A chain operation (also called flatMap or bind) with the following signaature
//          chain: <A, B>(f: (a: A) => M<B>) => (ma: M<A>) => M<B>

// The 3 Laws:
// chain(of) ∘ f = f (Left identity)
// chain(f) ∘ of = f (Right identity)
// chain(h) ∘ (chain(g) ∘ f) === chain((chain(h) ∘ g)) ∘ f (Associativity)

// Where f, g, h are all effectful functions and ∘ is the usual function composition.

//////////////////
///
/// The core problem
///
//////////////////

// How do we compose two effectful functions,
// f: (a: A) => F<B>
// g: (b: B) => F<C>

// NOTE: Effectful functions are also called Kleisli Arrows.

// Because Categories capture the essence of composition, can we find a category that can model the composition of Kleisli Arrows?

//////////////////
///
/// Getting to (a: A) => M<C>
///
//////////////////

// Because we know that Monads must admit a Functor instance, we know we can use map.
// Using map, from g: (b: B) => M<C> we can derive a function with the following signature
// map(g): <B>(ma: M<B>) => M<M<C>>

// But now we're stuck. There is no legal operation to flatten a value of type M<M<C>> into M<C>.
// Enter: flatten.

// h = flatten ∘ map(g) ∘ f
// flatten + map = flatMap!
// chain = flatten ∘ map(g) (in other words, flatMap)

// Now we can update the Composition Table

// Program f      Program g            Composition
// pure           pure                 g ∘ f
// effectful      pure (unary)         map(g) ∘ f
// effectful      pure (n-ary, n > 1)  liftAn(g) ∘ f
// effectuful     effectful            chain(g) ∘ f

// of comes from the identity morphisms. For every identity morphism 1A in Category TS, there must be a corresponding function from A to M<A>.

// Examples of usage

import { function as F, option as O, readonlyArray as A } from 'fp-ts'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers

declare const user: User

const followersOfFollowers: ReadonlyArray<User> = F.pipe(
  user,
  getFollowers,
  A.chain(getFollowers)
)

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n)

const inverseHead: O.Option<number> = F.pipe(
  [1, 2, 3],
  A.head,
  O.chain(inverse)
)

//////////////////
///
/// Chain Implementations
///
//////////////////

//////////////////
///
/// 1. F = ReadonlyArray
///
//////////////////

const chainRA = <B, C>(g: (b: B) => ReadonlyArray<C>) => (
  mb: ReadonlyArray<B>
) => {
  const out: Array<C> = []
  for (const b of mb) {
    out.push(...g(b))
  }
  return out
}

//////////////////
///
/// 2. F = Option
///
//////////////////

const chainO = <B, C>(
  g: (b: B) => O.Option<C>
): ((mb: O.Option<B>) => O.Option<C>) => O.match(() => O.none, g)

//////////////////
///
/// 3. F = IO
///
//////////////////

import { io as IO } from 'fp-ts'

const chainIO = <B, C>(g: (b: B) => IO.IO<C>) => (
  mb: IO.IO<B>
): IO.IO<C> => () => g(mb())()

//////////////////
///
/// 4. F = Task
///
//////////////////

import { task as T } from 'fp-ts'

const chainT = <B, C>(g: (b: B) => T.Task<C>) => (
  mb: T.Task<B>
): T.Task<C> => () => mb().then((b) => g(b)())

//////////////////
///
/// 5. R = Reader
///
//////////////////

import { reader as Reader } from 'fp-ts'

const chainR = <B, R, C>(g: (b: B) => Reader.Reader<R, C>) => (
  mb: Reader.Reader<R, B>
): Reader.Reader<R, C> => (r) => g(mb(r))(r)
