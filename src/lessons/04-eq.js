"use strict";
// Equivalence relations denote equivalence between elements of the same type.
// This notion of equivalence relation can be implemented in TS thus
exports.__esModule = true;
var function_1 = require("fp-ts/function");
// This is an instance of Eq for the number type
var EqNumber = {
    equals: function (first, second) { return first === second; }
};
(0, function_1.pipe)(EqNumber.equals(1, 1), console.log); // => true
(0, function_1.pipe)(EqNumber.equals(2, 1), console.log); // => false
// The following laws must hold true for any instance of Eq
// Reflexivity: equals(x, x) === true for every x in A
// Symmetry: equals(x, y) === equals(y, x) for every x and y in A
// Transitivity: equals(x, y) === true and equals(y, z) === true, then equals(x, z) must be true for every x, y, and z in A
// A 'reverse' combinator works fine because of the symmetry rule.
// A 'not' combinator... I don't think so.
var N = require("fp-ts/number");
// Defining a fn elem that checks if a given value is an element of a ReadonlyArray
var elem = function (E) { return function (a) { return function (as) {
    return as.some(function (e) { return E.equals(e, a); });
}; }; };
(0, function_1.pipe)([1, 2, 3], elem(N.Eq)(2), console.log); // true
(0, function_1.pipe)([1, 2, 3], elem(N.Eq)(4), console.log); // false
var EqPoint = {
    equals: function (first, second) { return first.x === second.x && first.y === second.y; }
};
EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 }); // => true
EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: -2 }); // => false
var points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 }
];
var search = { x: 1, y: 1 };
console.log(points.includes(search)); // => false :-(
(0, function_1.pipe)(points, elem(EqPoint)(search), console.log); // => true! :-)
// Array.includes compares objects by identity, not the data they hold (pass by reference)
// The data type Set suffers the same issue, i.e. it doesn't offer handy APIs for testing user-defined equality.
var pointsSet = new Set([{ x: 0, y: 0 }]);
pointsSet.add({ x: 0, y: 0 });
console.log(pointsSet); // => Set(2) { { x: 0, y: 0 }, { x: 0, y: 0 } }
// In order to check for equality in these cases, we must provide our own equality-testing API.
// Steps below
// Firstly, rather than all of the boilerplate of EqPoint, we can use the struct combinator to return an Eq instance with an appropriate equals method.
var Eq_1 = require("fp-ts/Eq");
var EqPoint2 = (0, Eq_1.struct)({
    x: N.Eq,
    y: N.Eq
});
// As with Semigroups, we can also work with tuples
var Eq_2 = require("fp-ts/Eq");
var EqPointTuple = (0, Eq_2.tuple)(N.Eq, N.Eq);
// We can also derive an Eq instance for ReadonlyArrays
var A = require("fp-ts/ReadonlyArray");
var EqPointA = A.getEq(EqPointTuple);
// Importantly, it's possible to define multiple Eq instances for a given data type, cf. Haskell, which only allows one.
// The equality of, e.g., a User type, may differ depending on context. E.g. sometimes it might be necessary to define a standard Eq to check identicality, and another to check if only the ID property is the same.
var S = require("fp-ts/string");
var EqStandard = (0, Eq_1.struct)({
    id: N.Eq,
    name: S.Eq
});
// const EqId: Eq<User> = {
//   equals: (first, second) => N.Eq.equals(first.id, second.id)
// }
// Or, rather manually defining EqId, we could use the combinator contramap
// Given an instance Eq<A> and a function from B to A, we can derive an Eq<B>
var Eq_3 = require("fp-ts/Eq");
var EqId = (0, function_1.pipe)(N.Eq, (0, Eq_3.contramap)(function (user) { return user.id; }));
console.log(EqStandard.equals({ id: 1, name: 'Steven' }, { id: 1, name: 'Steven Webster' }));
// => false - names are different.
console.log(EqId.equals({ id: 1, name: 'Steven' }, { id: 1, name: 'Julia' }));
// => true
console.log(EqId.equals({ id: 1, name: 'Giulio' }, { id: 2, name: 'Giulio' }));
// => false
