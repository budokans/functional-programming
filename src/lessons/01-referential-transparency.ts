// Two pillars of functional programming
// 1. Referential Transparency
// 2. Composition as a universal design pattern.

//////////////////////////////
//
// REFERENTIAL TRANSPARENCY
//
//////////////////////////////

// Def: An expression is referentially transparent if it can be replaced with its corresponding value without changing the program's behaviour.

/*********** Example 1 ************/

// The expression double(2) is referentially transparent as it may be replaced with its corresponding value, 4.

const double = (x: number): number => x * 2
const x = double(2) // 4
const y = double(2) // 4

// So, this refactor is fine.

// const x = 4; // 4 (same as double(2))
// const y = x; // 4

/*********** Example 2 ************/

// Not all expressions are referentially transparent:
// N.B. Referential transparency implies not throwing exceptions.

const inverse = (n: number): number => {
  if (n === 0) throw new Error('Cannot divide by 0')
  return 1 / n
}

const i = inverse(0) + 1

// I can't replace inverse(0) with its value, thus it does not meet the referential transparency condition.

/*********** Example 3 ************/

// Referential transparency requires the use of immutable data structures.

const numArr = [1, 2, 3]

const append = (xs: Array<number>): void => {
  xs.push(4)
}

append(numArr)

const newNumArr = numArr // Not the same: the data was mutated by append();

// Referential Transparency is important because it allows us to
// 1. Reason about code locally.
// Without knowledge of external context, a fragment of the code can easily be understood.
// 2. Refactor without changing our system's behaviour.
