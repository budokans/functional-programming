"use strict";
/*

  Abstraction for a mechanism to perform actions repetitively until successful.

  This module is split in 3 parts:

  - the model
  - primitives
  - combinators

*/
exports.__esModule = true;
exports.dryRun = exports.applyPolicy = exports.concat = exports.capDelay = exports.exponentialBackoff = exports.limitRetries = exports.constantDelay = exports.startStatus = void 0;
exports.startStatus = {
    iterNumber: 0,
    previousDelay: undefined
};
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * Constant delay with unlimited retries.
 */
var constantDelay = function (delay) { return function () { return delay; }; };
exports.constantDelay = constantDelay;
/**
 * Retry immediately, but only up to `i` times.
 */
var limitRetries = function (i) { return function (status) {
    return status.iterNumber >= i ? undefined : 0;
}; };
exports.limitRetries = limitRetries;
/**
 * Grow delay exponentially each iteration.
 * Each delay will increase by a factor of two.
 */
var exponentialBackoff = function (delay) { return function (status) {
    return delay * Math.pow(2, status.iterNumber);
}; };
exports.exponentialBackoff = exponentialBackoff;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Set a time-upperbound for any delays that may be directed by the
 * given policy.
 */
var capDelay = function (maxDelay) { return function (policy) { return function (status) {
    var delay = policy(status);
    return delay === undefined ? undefined : Math.min(maxDelay, delay);
}; }; };
exports.capDelay = capDelay;
/**
 * Merges two policies. **Quiz**: what does it mean to merge two policies?
 */
var concat = function (second) { return function (first) { return function (status) {
    var delay1 = first(status);
    var delay2 = second(status);
    if (delay1 !== undefined && delay2 !== undefined) {
        return Math.max(delay1, delay2);
    }
    return undefined;
}; }; };
exports.concat = concat;
// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------
/**
 * Apply policy on status to see what the decision would be.
 */
var applyPolicy = function (policy) { return function (status) { return ({
    iterNumber: status.iterNumber + 1,
    previousDelay: policy(status)
}); }; };
exports.applyPolicy = applyPolicy;
/**
 * Apply a policy keeping all intermediate results.
 */
var dryRun = function (policy) {
    var apply = exports.applyPolicy(policy);
    var status = apply(exports.startStatus);
    var out = [status];
    while (status.previousDelay !== undefined) {
        out.push((status = apply(out[out.length - 1])));
    }
    return out;
};
exports.dryRun = dryRun;
var function_1 = require("fp-ts/function");
/*
  constantDelay(300)
    |> concat(exponentialBackoff(200))
    |> concat(limitRetries(5))
    |> capDelay(2000)
*/
var myPolicy = function_1.pipe(exports.constantDelay(300), exports.concat(exports.exponentialBackoff(200)), exports.concat(exports.limitRetries(5)), exports.capDelay(2000));
console.log(exports.dryRun(myPolicy));
/*
[
  { iterNumber: 1, previousDelay: 300 },      <= constantDelay
  { iterNumber: 2, previousDelay: 400 },      <= exponentialBackoff
  { iterNumber: 3, previousDelay: 800 },      <= exponentialBackoff
  { iterNumber: 4, previousDelay: 1600 },     <= exponentialBackoff
  { iterNumber: 5, previousDelay: 2000 },     <= capDelay
  { iterNumber: 6, previousDelay: undefined } <= limitRetries
]
*/
