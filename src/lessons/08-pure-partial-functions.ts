//////////////////
///
/// Formal definiton of a function
///
//////////////////

import { getIntercalateSemigroup } from 'fp-ts/lib/Semigroup'

// If X and Y are sets, then X x Y is their cartesian product. Meaning that:
// X x Y = { (x, y) | x ∈ X, y ∈ Y }

// Function: f: X -> Y is a subset of X x Y such that for every x ∈ X there's exactly one y ∈ Y such that (x, y) ∈ f.

// The set X is the domain of f, while Y is its codomain.

// Example: the function double: Nat -> Nat is the subset of the cartesian product Nat x Nat given by { (1, 2), (2, 4), (3, 6), ... }

//////////////////
///
/// Extensional Definition
///
//////////////////

// An extensional definition of a function, where each element of its domain is enumerated along with its corresponding codomain in TypeScript:

const f: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6
}

// etc.
// This is problematic when a set is infinite. To get around this we use the intensional definition.

//////////////////
///
/// Intensional Definition
///
//////////////////

// In the intensional definition we express a condition that must hold for every couple (x, y) ∈ f, meaning y = x * 2.

const doubleIt = (x: number): number => x * 2

// The definition of a function as a subset of a cartesian product shows how in mathematics, every fn is pure. No action, no state mutation or elements modified. In FP our function implementations must follow this ideal model as closely as possile.

// Pure functions don't automatically imply a ban on local mutability, as long as this doesn't leak outside of their scope.

// In general, mutabilibity is terrible when combined with share state, but passes if the state isn't shared.
// The ultimate goal is referential transparency.

// We define side effects by negating referential transparency: An expression that doesn't benefit from referential transparency contains side effects.

//////////////////
///
/// Composition
///
//////////////////

// Functions demonstrate not only this first pillar of FP, but also composition, as functions compose.
// For f: Y -> Z and g: X -> Y, h: X -> Z is composed as h(x) = f(g(x))
// Where get is composed with g.
// h = f ∘ g
// f is included in the codomain of g, and this is compulsory when composing functions.

//////////////////
///
/// Partial Functions
///
//////////////////

// A partial function is not defined for each value in its domain. Cf. a total function is defined for all values in its domain.

// Example f(x) = 1 / x. This f: number -> number is not defined for x = 0.

// Example
// Get the first element of a `ReadonlyArray`
declare const head: <A>(as: ReadonlyArray<A>) => A

// The head function is partial because it is not defined for '[]';
// Is JSON.parse() a total function? Yes, because it's domain contains 'any'.
// Is JSON.stringify() a total function? Not sure... Probably not.

// A partial function f: X -> Y can always be made total by adding a special value - let's call it None - to the codomain and assigning it to the output of f for every value of X where the function is not defined.

// f': X -> Y ∪ None
// Let's call Y ∪ None = Option(Y), so
// f': X -> Option(Y)
