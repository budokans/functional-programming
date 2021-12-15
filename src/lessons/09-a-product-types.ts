// Algebraic Data Types are one way to define an application or feature's domain model in TypeScript.
// Definition: A composite type formed by combining other types.

// Two common families:

//*** Product types ***//
// Struct
// Tuple

//*** Sum types ***//
// ReadonlyArray
// RadonlyMap
// Option
// Either
// etc.

//////////////////
///
/// Product Types
///
//////////////////

// Definition: A collection types Ti indexed by a set I.

// n-tuples, where I is an interval of natural numbers:

type Tuple1 = [string] // I = [0]
type Tuple2 = [string, number] // I = [0, 1]
type Tuple3 = [string, number, boolean] // I = [0, 1, 2]

// Accessing by index
type Fst = Tuple2[0] // string
type Snd = Tuple2[1] // number

// structs, where I is a 'record' type, or set of labels:

// I = { "name", "age" }
interface Person {
  name: string
  age: number
}

// Accessing by label

type Name = Person['name'] // string
type Age = Person['age'] // number

// Polymorphism: The use of a single symbol to represent different types or the provision of a single interface to entities of different types (generics in TypeScript).

// Product types can be polymorphic

//                ↓ type parameter
type HttpResponse<A> = {
  readonly code: number
  readonly body: A
}

// Why are they called "product" types?

// Because the following equation must hold true, where C(A) is the cardinality of set A:
// C([A, B]) === C(A) * C(B)

// The cardinality of a product (type) is the product of the cardinalities.

// E.G. the null type has a cardinality of 1 because it has only one member: null.
// E.G. the boolean """""""""""""""""""""" 2 """""""""""""" two members: true, false

type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = [Hour, Period]

// Clock has a cardinality of 24, as C(Hour) * C(Period) = 24.

//////////////////
///
/// When can you use a product type?
///
//////////////////

// Whenever the values of the component types are independent, as with the Clock type immediately above.
