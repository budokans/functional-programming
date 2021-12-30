"use strict";
// Note: In TS, these are called discriminated unions (but they're not quite the same because TS discriminated unions don't necessarily need to be disjoint).
exports.__esModule = true;
exports.cons = exports.nil = exports.del = exports.update = exports.add = void 0;
var add = function (text) { return ({
    type: 'ADD_TODO',
    text: text
}); };
exports.add = add;
var update = function (id, text, completed) { return ({
    type: 'UPDATE_TODO',
    id: id,
    text: text,
    completed: completed
}); };
exports.update = update;
var del = function (id) { return ({
    type: 'DELETE_TODO',
    id: id
}); };
exports.del = del;
// E.g. linked lists
// Nullary constructor can be implemented as a constant
exports.nil = { _tag: 'Nil' };
var cons = function (head, tail) { return ({
    _tag: 'Cons',
    head: head,
    tail: tail
}); };
exports.cons = cons;
// equivalent to [1, 2, 3]
var myList = (0, exports.cons)(1, (0, exports.cons)(2, (0, exports.cons)(3, exports.nil)));
var match = function (onNil, onCons) { return function (fa) {
    switch (fa._tag) {
        case 'Nil':
            return onNil();
        case 'Cons':
            return onCons(fa.head, fa.tail);
    }
}; };
var isEmpty = match(function () { return true; }, function () { return false; });
console.log(isEmpty({ _tag: 'Nil' })); // => true
console.log(isEmpty({ _tag: 'Cons', head: 'foo', tail: { _tag: 'Nil' } })); // => false
var head = match(function () { return undefined; }, function (head, _) { return head; });
console.log(head({ _tag: 'Nil' })); // => undefined
console.log(head({ _tag: 'Cons', head: 'foo', tail: { _tag: 'Nil' } })); // => 'foo'
// returns the length of the List, recursively
var length = match(function () { return 0; }, function (_, tail) { return 1 + length(tail); });
console.log(length({ _tag: 'Nil' })); // => 0
console.log(length({
    _tag: 'Cons',
    head: 'foo',
    tail: { _tag: 'Cons', head: 'bar', tail: { _tag: 'Nil' } }
})); // => 2
