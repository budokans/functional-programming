// Note: In TS, these are called discriminated unions.

// Sum types are a data type that can:
// 1. Hold different (but limited) types
// 2. Only one of these types can be used in a single instance
// 3. Usually have a 'tag' type differentiating those types.

// Note: The members of the union must be disjoint, i.e. there cannot be values that belong to more than one member.

// E.G.

type StringsOrNumbers = ReadonlyArray<string> | ReadonlyArray<number>
declare const sn: StringsOrNumbers
// sn.map() // => Not callable

// This is not a disjoint union because the value [] can belong to both members.

// You can guarantee that a union is disjoint by adding a field that works as a tag.

// Sum types can be polymorphic and recursive, e.g., linked list:
//               ↓ type parameter
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }
//                                                              ↑ recursion

//////////////////
///
/// Constructors
///
//////////////////

// A sum type with n elements needs at least n constructors - one for each member.

// E.g. Redux action creators:

export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }

export const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text
})

export const update = (
  id: number,
  text: string,
  completed: boolean
): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed
})

export const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id
})

// E.g. linked lists

// Nullary constructor can be implemented as a constant
export const nil: List<never> = { _tag: 'Nil' }
export const cons = <A>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail
})

// equivalent to [1, 2, 3]
const myList = cons(1, cons(2, cons(3, nil)))

//////////////////
///
/// Pattern Matching
///
//////////////////

// Neither JavaScript nor TypeScript support pattern-matching, but it can be simulated with a match function.

interface Nil {
  readonly _tag: 'Nil'
}

interface Cons<A> {
  readonly _tag: 'Cons'
  readonly head: A
  readonly tail: List<A>
}

type List2<A> = Nil | Cons<A>

const match = <R, A>(
  onNil: () => R,
  onCons: (head: A, tail: List2<A>) => R
) => (fa: List2<A>): R => {
  switch (fa._tag) {
    case 'Nil':
      return onNil()
    case 'Cons':
      return onCons(fa.head, fa.tail)
  }
}

const isEmpty = match(
  () => true,
  () => false
)
console.log(isEmpty({ _tag: 'Nil' })) // => true
console.log(isEmpty({ _tag: 'Cons', head: 'foo', tail: { _tag: 'Nil' } })) // => false

const head = match(
  () => undefined,
  (head, _) => head
)

console.log(head({ _tag: 'Nil' })) // => undefined
console.log(head({ _tag: 'Cons', head: 'foo', tail: { _tag: 'Nil' } })) // => 'foo'
