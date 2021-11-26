"use strict";
// Definition: A magma whose concat operation is associative.
exports.__esModule = true;
// Semigroups capture the essense of parallelizable operations. If we know that an operation follows the associativity law, in can be broken down into subcomputations, and those subcomputations broken down further.
// If S is a semigroup, the following law must hold for every x, y, and z of type A:
// S.concat(S.concat(x, y), z) === S.concat(x, S.concat(y, z))
// NOTE: TypeScript's type system unfortunately cannot encode this law.
// Implementing a semigroup for set ReadonlyArray<string>
var Se = require("fp-ts/Semigroup");
var Semigroup = {
    concat: function (first, second) { return first.concat(second); }
};
// concat can have differing meanings: sum, fusion, combination, substitution, merging etc.
// Implementation of the semigroup (number, +) where + is number addition
var SemigroupSum = {
    concat: function (first, second) { return first + second; }
};
// Implementation of the semigroup (number, *) where * is number multiplication
var SemigroupProduct = {
    concat: function (first, second) { return first * second; }
};
// Two instances of Semigroup<boolean>
var SemigroupAll = {
    concat: function (first, second) { return first && second; }
};
var SemigroupAny = {
    concat: function (first, second) { return first || second; }
};
// Note: don't think of "semigroups of numbers" etc., because there are multiple semigroups for the type number, given the different associtative operations available. Also, it is possible for semigroups to share operations but differ in type.
//////////////////////
//
// concatAll
//
//////////////////////
// Concat combines two elements of type A. concatAll may be used to combine any number of elements. It takes:
// 1. An instance of a semigroup
// 2. An initial value
// 3. An array of elements
var fp_ts_1 = require("fp-ts");
var sum = Se.concatAll(fp_ts_1.number.SemigroupSum)(2);
console.log(sum([3, 4, 1, 2])); // => 12
var product = Se.concatAll(fp_ts_1.number.SemigroupProduct)(3);
console.log(product([2, 4, 3])); // => 72
// Applications - some fns from the standard JS library
var every = function (predicate) { return function (as) { return Se.concatAll(fp_ts_1.boolean.SemigroupAll)(true)(as.map(predicate)); }; };
var some = function (predicate) { return function (as) { return Se.concatAll(fp_ts_1.boolean.SemigroupAny)(false)(as.map(predicate)); }; };
var assign = Se.concatAll(fp_ts_1.struct.getAssignSemigroup())({});
//////////////////////
//
// Dual Semigroups
//
//////////////////////
// Given a semigroup instance, you can obtain a new instance by swapping the order in which the operands are combined within the concat fn
var function_1 = require("fp-ts/function");
var fp_ts_2 = require("fp-ts");
var reverse = function (S) { return ({
    concat: function (first, second) { return S.concat(second, first); }
}); };
(0, function_1.pipe)(fp_ts_2.string.Semigroup.concat('a', 'b'), console.log); // => 'ab'
(0, function_1.pipe)(reverse(fp_ts_2.string.Semigroup).concat('a', 'b'), console.log); // => 'ba'
// Models a sum of two vectors (manually)
var SemigroupVector = {
    concat: function (first, second) { return ({
        x: fp_ts_1.number.SemigroupSum.concat(first.x, first.y),
        y: fp_ts_1.number.SemigroupSum.concat(second.x, second.y)
    }); }
};
// With the struct combinator
var Semigroup_1 = require("fp-ts/Semigroup");
var SemigroupVector2 = (0, Semigroup_1.struct)({
    x: fp_ts_1.number.SemigroupSum,
    y: fp_ts_1.number.SemigroupSum
});
var SemigroupVector3 = (0, Semigroup_1.tuple)(fp_ts_1.number.SemigroupSum, fp_ts_1.number.SemigroupSum);
var v1 = [1, 3];
var v2 = [3, 1];
console.log(SemigroupVector3.concat(v1, v2)); // => [4, 4]
