"use strict";
//////////////////
///
/// Case study
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
exports.__esModule = true;
exports.program = void 0;
var fp_ts_1 = require("fp-ts");
//////////////////
///
/// Functors
///
//////////////////
// Finding a solution to composing two generic functions is so important because if it's true that Categories can be used to model typed programming languages, then morphisms can be able to model programs => A concrete way of composing programs in a generic way.
// ** Functions as Programs ** //
// Immediate issue: How do we model a programs that produces side effects with pure functions?
// Answer: Model side effects through effects - special types that represent side effects.
// Two ways to model side effects with effects in JavaScript:
// 1. Domain Specific Language (DSL) for effects: combine effects and define an interpreter able to execute the side effects when launching the final program.
// 2. Thunks: a subroutine used to inject a calculation into another subroutine. They delay calculation until the result is needed. They can also be used to insert operations and the beginning or end of another subroutine.
// 1.
// DSL would mean modifying a program like:
var log = function (message) { return console.log(message); };
var log2 = function (message) { return ({ type: 'log', message: message }); };
var logIO = function (message) { return function () { return console.log(message); }; };
var main = logIO('Hello!');
// This won't be executed until launching the program. Currently log only returns a value representating the computation - an action.
// Main is an inert value and nothing is logged yet.
main();
// Only when running the final program does the effect occur.
// In functional programming, it is a tendency to shove side effects (in the form of effects) towards the border of the sytem - the main() function - where they are executed by an interpreter with the following schema:
// system = pure core + imperative shell
// Even with this thunk technique, we still need a way to combine effects, meaning we need to be able to compose functions in a generic way.
// ** A pure program ** //
// (a: A) => B
// E.G. The len program
var len = function (str) { return str.length; };
// ** An effectful program ** //
// (a: A) => F<B>
// This latter signature models a program that accepts an input of type A, but returns B together with an effect F, which represents some kind of type constructor.
// TYPE CONSTRUCTOR:
// An n-ary type operator that takes one or more types as arguments and returns another type. Option, ReadonlyArray and Either are type constructors.
// E.G. The head program
var headEG = function (as) {
    return as.length > 0 ? fp_ts_1.option.some(as[0]) : fp_ts_1.option.none;
};
//////////////////
///
/// Back to the core problem
///
//////////////////
// If B = C, then we con use the usual function composition to compose two generic functions f: (a: A) => B, and g: (c: C) => D.
// If B != C, we need to add boundaries to B and C.
//////////////////
///
/// A Boundary that leads to Functors
///
//////////////////
// If we introduce the boundary B = F<C> for a given Functor F, then
// f: (a: A) => F<B> is an effectful program
// g: (b: B) => C is a pure program
// To compose f with g, we need to find a way to get the codomain of f to be the same as the domain of g.
// In other words, we need to find some procedure that will turn function g from (b: B) => C to (fb: F<B>) => F<C> in order to use the usual function composition.
// We can introduce a function, map, that operates in this way.
//////////////////
///
/// Example 1: ReadonlyArray
///
//////////////////
var function_1 = require("fp-ts/function");
var mapRA = function (g) { return function (fb) { return fb.map(g); }; };
var getFollowers = function (user) { return user.followers; };
var getName = function (user) { return user.name; };
var getFollowersNames = function (user) {
    return (0, function_1.pipe)(user, getFollowers, mapRA(getName));
};
var user = {
    id: 1,
    name: 'Ruth R. Gonzalez',
    followers: [
        { id: 2, name: 'Terry R. Emerson', followers: [] },
        { id: 3, name: 'Marsha J. Joslyn', followers: [] }
    ]
};
console.log(getFollowersNames(user)); // => [ 'Terry R. Emerson', 'Marsha J. Joslyn' ]
//////////////////
///
/// Example 2: Option
///
//////////////////
var function_2 = require("fp-ts/function");
var mapOpt = function (g) {
    return fp_ts_1.option.fold(function () { return fp_ts_1.option.none; }, function (b) {
        var c = g(b);
        return fp_ts_1.option.some(c);
    });
};
var head2 = fp_ts_1.readonlyArray.head;
var doubleVal = function (n) { return n * 2; };
var getDoubleHead = (0, function_2.flow)(head2, mapOpt(doubleVal));
console.log(getDoubleHead([1, 2, 3])); // => some(2)
console.log(getDoubleHead([])); // => none
//////////////////
///
/// Example 3: IO
///
//////////////////
var mapIO = function (g) { return function (fb) { return function () {
    var b = fb();
    return g(b);
}; }; };
var database = {
    1: { id: 1, name: 'Ruth R. Gonzalez' },
    2: { id: 2, name: 'Terry R. Emerson' },
    3: { id: 3, name: 'Marsha J. Joslyn' }
};
var getUser = function (id) { return function () { return database[id]; }; };
var getName2 = function (user) { return user.name; };
var getUserName = (0, function_2.flow)(getUser, mapIO(getName2));
console.log(getUserName(1)()); // 'Ruth R. Gonzalez'
//////////////////
///
/// Example 4: Task
///
//////////////////
var fp_ts_2 = require("fp-ts");
var mapT = function (g) { return function (fb) { return function () {
    var promise = fb();
    return promise.then(g);
}; }; };
var getUserT = function (id) { return function () {
    return Promise.resolve(database[id]);
}; };
var getUserNameT = (0, function_2.flow)(getUserT, mapT(getName2));
getUserNameT(1)().then(console.log); // 'Ruth R. Gonzalez'
var mapR = function (g) { return function (fb) { return function (r) {
    var b = fb(r);
    return g(b);
}; }; };
var getUserR = function (id) { return function (env) { return env.database[id]; }; };
var getUserNameR = (0, function_2.flow)(getUserR, mapR(getName2));
console.log(getUserNameR(2)({ database: database })); // Ruth R. Gonzalez
// Functors are maps between categories that preserve the structure of the category, meaning they preserve the identity morphisms and the composition operation.
// A functor, like a category, is a pair of two things:
//   1. A map between objects that binds every object X in C to an object in D.
//   2. A map between morphisms that binds every morphism f in C to a morphism map(f) in D.
//   Where C and D are two categories (AKA two typed programming languages).
//   We're more interested in a map where C and D are the same (the TS category). In this case we're talking about endofunctors. Unless otherwise specified, we refer to endofunctors when talking about functors."
// Definition:
// A pair (F, map where):
// 1. F is an n-ary (n >= 1) type constructor mapping every type X in a type F<X> (map between objects)
// 2. map is a function such that <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>) that maps every function f: (a: A) => B in a function map(f): (fa: F<A>) => F<B> (map between morphisms)
// The following properties must hold true:
// 1. map(1x) = 1FX (identities map to identities)
// 2. map(g ∘ f) = map(g) ∘ map(f)
// The second law allows us to refactor and optimize something like:
var function_3 = require("fp-ts/function");
var ReadonlyArray_1 = require("fp-ts/ReadonlyArray");
var double2 = function (n) { return n * 2; };
// iterates array twice
console.log((0, function_1.pipe)([1, 2, 3], (0, ReadonlyArray_1.map)(double2), (0, ReadonlyArray_1.map)(function_3.increment))); // => [ 3, 5, 7 ]
// single iteration
console.log((0, function_1.pipe)([1, 2, 3], (0, ReadonlyArray_1.map)((0, function_2.flow)(double2, function_3.increment)))); // => [ 3, 5, 7 ]
var program = function (ns) {
    // -1 indicates that no element has been found
    var i = ns.findIndex(function (n) { return n > 0; });
    if (i !== -1) {
        return doSomethingWithIndex(i);
    }
    throw new Error('cannot find a positive number');
};
exports.program = program;
// With an Option and its functor instance, error-handling takes place behind the scenes thanks to map.
var betterProgram = function (ns) {
    return (0, function_1.pipe)(ns, fp_ts_1.readonlyArray.findIndex(function (n) { return n > 0; }), fp_ts_1.option.map(doSomethingWithIndex));
};
var mapTO = (0, function_2.flow)(fp_ts_1.option.map, fp_ts_2.task.map);
var getUserTO = function (id) { return function () {
    return Promise.resolve(fp_ts_1.option.fromNullable(database[id]));
}; };
var getUserNameTO = (0, function_2.flow)(getUserTO, mapTO(getName2));
getUserNameTO(1)().then(console.log); // some('Ruth R. Gonzalez)
getUserNameTO(4)().then(console.log); // none
//////////////////
///
/// Controvariant Functors
///
//////////////////
// The hitherto-discussed functors are covariant functors.
// A variant of the functor concept is the contravariant functor. The definition is the same, except for the signature of its fundamental operation, which is contramap instead of map.
var fp_ts_3 = require("fp-ts");
var getId = function (_) { return _.id; };
// Map operates like: (fa: Option<User2) => Option<number>
var getIdOption = fp_ts_1.option.map(getId);
// Contramap is like: (fa: Eq<number>) => Eq<User>
var getIdEq = fp_ts_3.eq.contramap(getId);
var EqID = getIdEq(fp_ts_3.number.Eq);
var mapResponse = function (f) { return function (fa) { return (__assign(__assign({}, fa), { body: f(fa.body) })); }; };
var FunctorR = {
    URI: 'Response',
    map: function (fa, f) { return (0, function_1.pipe)(fa, mapResponse(f)); }
};
//////////////////
///
/// Do Functors solve the general problem?
///
//////////////////
// So far, Functors have allowed us to compose an effectful program f with a pure program g.
// But g is a unary function - what if g needs to take two or more arguments?
// Program f      Program g            Composition
// pure           pure                 g ∘ f
// effectful      pure (unary)         map(g) ∘ f
// effectful      pure (n-ary, n > 1)  ???
