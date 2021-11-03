import { pipe } from 'fp-ts/function'

// Two pillars of functional programming
// 1. Referential Transparency
// 2. Composition as a universal design pattern.

//////////////////////
//
// COMPOSITION
//
//////////////////////

// Def: Composing small units of code that accomplish very specific taks into larger and more complex units of code.

// This is done with through modular programming by way of combinators, whose goal it is to create new Things from Things already defined.

// Def (The Combinator Pattern): A style of organizing libraries centered around the idea of combining things.

// combinator: Thing -> Thing

// The output of a combinator - the new Thing - can be passed as input to other combinators and programs, and result in a 'combinatorial explosion' of opportunies.

/*********** Example 1 ************/

const double = (n: number): number => n * 2
console.log(pipe(2, double, double, double)) // 16

// Functional module design pattern is usually:

// 1. A model for some type, T
// 2. A small set of primitives of type T
// 3. Combinators for combining the primitive into complex structures.
