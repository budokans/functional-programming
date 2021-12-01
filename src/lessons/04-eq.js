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
// Array.includes doesn't test for deep equality.
// The data type Set suffers the same issue, i.e. it doesn't offer handy APIs for testing user-defined equality.
var pointsSet = new Set([{ x: 0, y: 0 }]);
pointsSet.add({ x: 0, y: 0 });
console.log(pointsSet); // => Set {{ x: 0, y: 0 }, { x: 0, y: 0 }}
