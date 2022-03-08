"use strict";
//////////////////
///
/// Applicative Functors
///
//////////////////
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var addFollower = function (follower, user) { return (__assign(__assign({}, user), { followers: __spreadArray(__spreadArray([], user.followers, true), [follower], false) })); };
// refactored using currying
var addFollowerC = function (follower) { return function (user) { return (__assign(__assign({}, user), { followers: __spreadArray(__spreadArray([], user.followers, true), [follower], false) })); }; };
var user = { id: 1, name: 'Ruth R. Gonzalez', followers: [] };
var follower = { id: 3, name: 'Marsha J. Joslyn', followers: [] };
console.log(addFollowerC(follower)(user));
/*
{
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [ { id: 3, name: 'Marsha J. Joslyn', followers: [] } ]
}
*/
//////////////////
///
/// The ap operation
///
//////////////////
// This doesn't work so great with effects though. Consider that we only have ids for both user and follower, and we need to use an API fetchUser that, given an id, queries an endpoint and returns the correspondeing User.
var fp_ts_1 = require("fp-ts");
var userId = 1;
var followerId = 3;
var result2 = addFollowerAsync(fetchUser(userId))(fetchUser(followerId)); // compiles
// With ap we can define liftA2:
var fp_ts_2 = require("fp-ts");
var liftA2 = function (g) { return function (fb) { return function (fc) { return fp_ts_2["function"].pipe(fb, fp_ts_1.task.map(g), ap(fc)); }; }; };
//                              apply fc to the function contained in the F<(c: C) => D>
// And now we can lift the types for the function addFollowerC
var addFollowerLifted = liftA2(addFollowerC);
// And now we can finally compose fetchUser with the previous result.
//             f: (a: A) => F<B>  g: (fb: F<B>) => (fc: F<C>) => F<D>
var program = fp_ts_2["function"].flow(fetchUser, liftA2(addFollowerC));
var resultTask = program(followerId)(fetchUser(userId));
// Now we have a standard procedure to compose two functions:
// f: (a: A) => B
// g: (b: B, c: C) => D
// 1. Curry the function g
// 2. Define ap for the effect F
// 3. Define liftA2 for the effect F
// 4. Obtain the composition flow(f, liftA2(g))
// Here's ap implement for some familiar type constructors:
//////////////////
///
/// 1. F = ReadonlyArray
///
//////////////////
var apREA = function (fa) { return function (fab) {
    var out = [];
    for (var _i = 0, fab_1 = fab; _i < fab_1.length; _i++) {
        var f = fab_1[_i];
        for (var _a = 0, fa_1 = fa; _a < fa_1.length; _a++) {
            var a = fa_1[_a];
            out.push(f(a));
        }
    }
    return out;
}; };
var double = function (n) { return n * 2; };
fp_ts_2["function"].pipe([double, fp_ts_2["function"].increment], apREA([1, 2, 3]), console.log);
//////////////////
///
/// 2. F = Option
///
//////////////////
var fp_ts_3 = require("fp-ts");
var apO = function (fa) { return function (fab) {
    return fp_ts_2["function"].pipe(fab, fp_ts_3.option.fold(function () { return fp_ts_3.option.none; }, function (f) {
        return fp_ts_2["function"].pipe(fa, fp_ts_3.option.fold(function () { return fp_ts_3.option.none; }, function (a) { return fp_ts_3.option.some(f(a)); }));
    }));
}; };
fp_ts_2["function"].pipe(fp_ts_3.option.some(double), apO(fp_ts_3.option.some(3)), console.log); //  => some(6)
fp_ts_2["function"].pipe(fp_ts_3.option.some(double), apO(fp_ts_3.option.none), console.log); // => none
fp_ts_2["function"].pipe(fp_ts_3.option.none, apO(fp_ts_3.option.some(2)), console.log); // => none
fp_ts_2["function"].pipe(fp_ts_3.option.none, apO(fp_ts_3.option.none), console.log); // => none
