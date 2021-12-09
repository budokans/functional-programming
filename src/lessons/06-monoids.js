"use strict";
// Monoids are an extension of a Semigroup.
exports.__esModule = true;
// Number Monoid under addition
var MonoidSum = {
    concat: function (first, second) { return first + second; },
    empty: 0
};
// Number Monoid under multiplication
var MonoidProduct = {
    concat: function (first, second) { return first * second; },
    empty: 1
};
// String Monoid
var MonoidString = {
    concat: function (first, second) { return first + second; },
    empty: ''
};
// Boolean Monoid under conjunction
var MonoidAll = {
    concat: function (first, second) { return first && second; },
    empty: true
};
// Boolean Monoid under disjunction
var MonoidAny = {
    concat: function (first, second) { return first || second; },
    empty: false
};
// Not all Monoids are Semigroups:
var function_1 = require("fp-ts/function");
var Semigroup_1 = require("fp-ts/Semigroup");
var S = require("fp-ts/string");
var SemigroupIntercalate = (0, function_1.pipe)(S.Semigroup, (0, Semigroup_1.intercalate)('|'));
console.log(S.Semigroup.concat('a', 'b')); // => 'ab'
console.log(SemigroupIntercalate.concat('a', 'b')); // => 'a|b'
console.log(SemigroupIntercalate.concat('a', '')); // => 'a|'
// This Semigroup doesn't satisfy the need for an 'empty' property where concat(a, empty) = a;
//////////////////
///
/// Endomorphisms
///
//////////////////
// Endomorphisms: A function whose input and output type is the same
// type Endomorphism<A> = (a: A) => A
// For an Endomorphism Monoid, the unit is an identity function
var function_2 = require("fp-ts/function");
var getEndoMorphismMonoid = function () { return ({
    concat: function_2.flow,
    empty: function_2.identity
}); };
//////////////////
///
/// concatAll
///
//////////////////
// Compared to the concatAll operation of Semigroups, Monoids' concatAll operation is even easier - an initial value doesn't need to be passed.
var Monoid_1 = require("fp-ts/Monoid");
var N = require("fp-ts/Number");
console.log((0, Monoid_1.concatAll)(N.MonoidSum)([1, 2, 3, 4])); // => 10
console.log((0, Monoid_1.concatAll)(S.Monoid)(['The', 'Hamptons', 'sucks'])); // => 'TheHamptonssucks'
// Why is the initial value not needed anymore?
// Product Monoid
