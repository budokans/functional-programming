// Category Theory helps with forming a basis for a
// 1. Model for a generic programming language
// 2. A notion of composition

import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

// Definition

// 1. Constituents
// A Category is a pair of (Objects, Morphisms) where:
// Objects is a collection of objects (not JavaScript objects) and
// Morphisms is a collection of morphisms between objects

// Every morphism f owns a source object A and a target object B.

// 2. Composition
// // a. Composition of Morphisms: Every time we have two morphisms f: A ⟼ B and g: B ⟼ C in Morphisms, there must be a third morphism g ∘ f: A ⟼ C in Morphisms which is the composition of f and g (or, g composed with f).

// // b. Associativity: if f: A ⟼ B, g: B ⟼ C, and h: C ⟼ D, then h ∘ (g ∘ f) = (h ∘ g) ∘ f.

// // c. Identity: for every object X, there is an identity morphism X ⟼ X, the identity morphism of X, such that for every morphism f: A ⟼ X and g: X ⟼ B, indentity ∘ f = f and g ∘ identity = g.

//////////////////
///
/// Modelling programs with Categories
///
//////////////////

// A Category can be seen as model for a typed programming language where:
// 1. Objects are types
// 2. Morphisms are functions
// 3. ∘ is function composition

// A basic implementation of a typed programming language with j: A ⟼ B, k: B ⟼ C

const idA = (s: string): string => s
const idB = (n: number): number => n
const idC = (b: boolean): boolean => b
const j = (s: string): number => s.length
const k = (n: number): boolean => n > 1
const jk = (s: string): boolean => k(j(s))

//////////////////
///
/// A Category for TypeScript
///
//////////////////

// Objects are types like number, string, ReadonlyNonemptyArray etc.
// Morphisms are TypeScript functions like (a: A) => B, (b: B) => C where A, B and C are all TypeScript types.
// The identity morphisms are encoded in a single, polymorphic function:
const identity = <A>(a: A): A => a
// These morphisms' composition is the usual, associative function composition.

//////////////////
///
/// Composition's core problem
///
//////////////////

// We can compose two generic functions, f: (a: A) => B, and g: (c: C) => D, so long as B = C;

const flow = <A, B, C>(f: (a: A) => B, g: (b: B) => C): ((a: A) => C) => (a) =>
  g(f(a))
const pipe = <A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C => flow(f, g)(a)

// But what happens if B !== C?

// To compose:
// 1. f: (a: A) => B with g: (b: B) => C, use normal function composition.
// 2. f: (a: A) => F<B> wiith g: (b: B) => C, we need a functor instance for F.
// 3.

//////////////////
///
/// Case study
///
//////////////////

import { option as O } from 'fp-ts'

// We're trying to compose two functions, one which returns the first number of a non-empty array of numbers, and one which takes that value and doubles it.

// Our case study relates to 2. directly above, where F is the Option type.
declare const head: (as: ReadonlyNonEmptyArray<number>) => O.Option<number>
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
import { IO } from 'fp-ts/IO'
import { string } from 'fast-check'
const logIO = (message: string): IO<void> => () => console.log(message)
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
