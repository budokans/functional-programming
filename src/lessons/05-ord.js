"use strict";
// A total order relation can be implemented in TS thusly:
exports.__esModule = true;
// This results in:
// x < y only if compare(x, y) = -1
// x = y only if compare(x, y) = 0
// x > y only if compare(x, y) = 1
// Defining an Ord instance of number
var OrdNumber = {
    equals: function (first, second) { return first === second; },
    compare: function (first, second) { return (first < second ? -1 : first > second ? 1 : 0); }
};
// The following laws must hold true for any Ord instance:
// 1. Reflexivity: compare(x, x) <= 0 for every x in A
// 2. Antisymmetry: if compare(x, y) <= 0 and compare(y, x) <= 0 then x = y for every x, y in A.
// 3. Transitivity: if compare(x, y) <= 0 and compare(y, z) <= 0 then compare(x, z) <= 0 for every x, y, z in A.
// compare must also be compatible with the equals operation from Eq.
// compare(x, y) === 0 if and only if equals(x, y) === true for every x, y in A.
// Equals can of course be derived from compare:
// equals: (first, second) => compare(first, second) === 0
// Defining an Ord can be easily achieved with fp-ts by supplying the compare function to the helper, fromCompare
var Ord_1 = require("fp-ts/Ord");
var OrdNumberFromCompare = (0, Ord_1.fromCompare)(function (first, second) {
    return first < second ? -1 : first > second ? 1 : 0;
});
// A practical usage of an Ord instance in a sort method for ReadOnlyArray
// It leverages the native Array slice method so it doesn't mutate the passed in Array.
var function_1 = require("fp-ts/function");
var N = require("fp-ts/number");
var sort = function (O) { return function (as) {
    return as.slice().sort(O.compare);
}; };
(0, function_1.pipe)([3, 2, 4], sort(N.Ord), console.log); // => [2, 3, 4]
// Another practical usage - a min function that returns a the smallest of two vals
var min = function (O) { return function (second) { return function (first) {
    return O.compare(first, second) === -1 ? first : second;
}; }; };
(0, function_1.pipe)(2, min(N.Ord)(1), console.log); // => 1
//////////////////////
//
// Dual Ordering
//
//////////////////////
// Just as we can use a reverse combinator to invert a Semigroup's concat operation and obtain a dual semigroup, we can invert an Ord's compare function to get dual ordering.
// Reverse combinator for ord:
var reverse = function (O) {
    return (0, Ord_1.fromCompare)(function (first, second) { return O.compare(second, first); });
};
// Usage example: obtaining a max function from the min function
var function_2 = require("fp-ts/function");
var max = (0, function_2.flow)(reverse, min);
(0, function_1.pipe)(2, max(N.Ord)(1), console.log); // => 2
// Defining an Ord<User> instance depends on context. But perhaps by age -
var byAgeFromCompare = (0, Ord_1.fromCompare)(function (first, second) {
    return N.Ord.compare(first.age, second.age);
});
// Again, some boilerplate can be removed by using the combinator: given an Ord<A> instance and a function from B to A, it is possible to derive Ord<B>
var Ord_2 = require("fp-ts/Ord");
var byAge = (0, function_1.pipe)(N.Ord, (0, Ord_2.contramap)(function (user) { return user.age; }));
// Get the youngest of two users using previously defined min()
var getYounger = min(byAge);
(0, function_1.pipe)({ name: 'Steven', age: 33 }, getYounger({ name: 'Harvin', age: 27 }), console.log);
// const SemigroupMin: Semigroup<number> = {
//   concat: (first, second) => Math.min(first, second)
// }
// const SemigroupMax: Semigroup<number> = {
//   concat: (first, second) => Math.max(first, second)
// }
var SemigroupMin = function (O) { return ({
    concat: function (first, second) { return (O.compare(first, second) === 1 ? second : first); }
}); };
var SemigroupMax = function (O) { return ({
    concat: function (first, second) { return (O.compare(first, second) === 1 ? first : second); }
}); };
console.log(SemigroupMin(byAge).concat({ name: 'Steven', age: 33 }, { name: 'Harvin', age: 27 }));
console.log(SemigroupMax(byAge).concat({ name: 'Steven', age: 33 }, { name: 'Harvin', age: 27 }));
