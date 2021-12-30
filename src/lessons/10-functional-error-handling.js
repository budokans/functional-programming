"use strict";
//////////////////
///
/// Functional Error-Handling
///
//////////////////
exports.__esModule = true;
// Constructors and pattern-matching with match() - alias of fold()
var none = { _tag: 'None' };
var some = function (value) { return ({ _tag: 'Some', value: value }); };
var match = function (onNone, onSome) { return function (fa) {
    switch (fa._tag) {
        case 'None':
            return onNone();
        case 'Some':
            return onSome(fa.value);
    }
}; };
// Without the Option type, the type system is ignorant about the possibility of failure and we have to throw exceptions:
//                             this is a lie ↓
var headWrong = function (as) {
    if (as.length === 0) {
        throw new Error('Empty array');
    }
    return as[0];
};
var s;
try {
    s = String(headWrong([]));
}
catch (e) {
    s = e.message;
}
console.log(s); // => "Empty array"
// Compare this to:
var function_1 = require("fp-ts/function");
var headCorrect = function (as) {
    return as.length === 0 ? none : some(as[0]);
};
// const result = pipe(
//   headCorrect(numbers),
//   match(
//     () => 'Empty array',
//     (n) => String(n)
//   )
// )
// where the possibility of an error is encoded into the type system.
// E.G.
// const result2 = headCorrect(numbers)
// result2.value // Property 'value' does not exist on type 'Option<number>'.
//////////////////
///
/// An Eq instance
///
//////////////////
// Checking if two values of Option<string> are equal.
var fp_ts_1 = require("fp-ts");
var o1 = some('foo');
var o2 = some('bar');
var result3 = (0, function_1.pipe)(o1, match(function () {
    return (0, function_1.pipe)(o2, match(function () { return true; }, function () { return false; }));
}, function (s1) {
    return (0, function_1.pipe)(o2, match(function () { return false; }, function (s2) { return s1 === s2; }));
}));
// But then suppose we have to compare for equality two values of Option<number>. It's hassle to repeat all the above code, only changing the line for comparing equality.
// Instead we can abstract this idea away into a combinator that, given an Eq<A>, returns an Eq<Option<A>>.
// To this we can pass a StringEq, NumberEq - or whatever - and the correct equality check will be encoded.
var fp_ts_2 = require("fp-ts");
var getEq = function (E) { return ({
    equals: function (first, second) {
        return (0, function_1.pipe)(first, fp_ts_1.option.fold(function () {
            return (0, function_1.pipe)(second, fp_ts_1.option.fold(function () { return true; }, function () { return false; }));
        }, function (a1) {
            return (0, function_1.pipe)(second, fp_ts_1.option.fold(function () { return false; }, function (a2) { return E.equals(a1, a2); }));
        }));
    }
}); };
var EqOptionString = getEq(fp_ts_2.string.Eq);
console.log(EqOptionString.equals(none, none)); // => true
console.log(EqOptionString.equals(none, some('b'))); // => false
console.log(EqOptionString.equals(some('a'), none)); // => false
console.log(EqOptionString.equals(some('a'), some('b'))); // => false
console.log(EqOptionString.equals(some('a'), some('a'))); // => true
// Now that we can define an Eq instance for Option<A>, we can leverage all the combinators for Eq.
var Eq_1 = require("fp-ts/Eq");
var fp_ts_3 = require("fp-ts");
var EqMyTuple = (0, Eq_1.tuple)(fp_ts_2.string.Eq, fp_ts_3.number.Eq);
var EqOptionMyTuple = getEq(EqMyTuple);
var o3 = some(['a', 1]);
var o4 = some(['a', 2]);
var o5 = some(['b', 1]);
console.log(EqOptionMyTuple.equals(o3, o3)); // => true
console.log(EqOptionMyTuple.equals(o3, o4)); // => false
console.log(EqOptionMyTuple.equals(o3, o5)); // => false
// Slightly modifying the imports above, we can obtain an Ord instance for Option<A>
var Option_1 = require("fp-ts/Option");
var Ord_1 = require("fp-ts/Ord");
var OrdMyTuple = (0, Ord_1.tuple)(fp_ts_2.string.Ord, fp_ts_3.number.Ord);
var OrdOptionMyTuple = (0, Option_1.getOrd)(OrdMyTuple);
var o6 = some(['a', 1]);
var o7 = some(['a', 2]);
var o8 = some(['b', 1]);
console.log(OrdOptionMyTuple.compare(o6, o6)); // => 0
console.log(OrdOptionMyTuple.compare(o6, o7)); // => -1
console.log(OrdOptionMyTuple.compare(o6, o8)); // => -1
var getApplySemigroup = function (S) { return ({
    concat: function (first, second) {
        return (0, function_1.pipe)(first, fp_ts_1.option.fold(function () {
            return (0, function_1.pipe)(second, fp_ts_1.option.fold(function () { return none; }, function () { return none; }));
        }, function (a1) {
            return (0, function_1.pipe)(second, fp_ts_1.option.fold(function () { return none; }, function (a2) { return some(S.concat(a1, a2)); }));
        }));
    }
}); };
var SemigroupOptionString = getApplySemigroup(fp_ts_2.string.Semigroup);
var o9 = some('Foo');
var o10 = some('Bar');
var o11 = none;
console.log(SemigroupOptionString.concat(o11, o11)); // => none
console.log(SemigroupOptionString.concat(o9, o11)); // => none
console.log(SemigroupOptionString.concat(o11, o10)); // => none
console.log(SemigroupOptionString.concat(o9, o10)); // 'FooBar'
