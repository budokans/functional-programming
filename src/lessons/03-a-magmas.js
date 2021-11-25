"use strict";
//////////////////////////////
//
// Modelling Composition with Semigroups
//
//////////////////////////////
exports.__esModule = true;
var MagmaSub = {
    concat: function (first, second) { return first - second; }
};
// helper
var getPipeableConcat = function (m) { return function (second) { return function (first) {
    return m.concat(first, second);
}; }; };
var concat = getPipeableConcat(MagmaSub);
// usage eg
var function_1 = require("fp-ts/function");
function_1.pipe(10, concat(2), concat(3), concat(3), console.log);
// => 2
