"use strict";

const Acumen = require('..');
const assert = require('assert');

//var Acumen = require('acumen');

/**
 * Tests
 */

describe('tests()',function(){

    it('sample test', function() {
        const acumen = new Acumen();

        const a = character(
            '.#####.' +
            '#.....#' +
            '#.....#' +
            '#######' +
            '#.....#' +
            '#.....#' +
            '#.....#'
        )

        const b = character(
            '######.' +
            '#.....#' +
            '#.....#' +
            '######.' +
            '#.....#' +
            '#.....#' +
            '######.'
        )

        const c = character(
            '#######' +
            '#......' +
            '#......' +
            '#......' +
            '#......' +
            '#......' +
            '#######'
        )

        /**
         * Learn the letters A through C.
         */

        acumen.learn([
                { input: a, output: map('a') },
                { input: b, output: map('b') },
                { input: c, output: map('c') }
            ])

        /**
         * Predict the letter C, even with a pixel off.
         */
        const resultChar = character(
            '######.' +
            '#......' +
            '#......' +
            '#......' +
            '#......' +
            '#......' +
            '######.'
        );
        const result = acumen.predict(resultChar);

        console.log("Character Test Result is : " + result[0]) // ~ 0.5
    })

    it('XOR Test', function() {
        const acumen = new Acumen()
            .learn([
                { input: [0, 0], output: [ 0 ] },
                { input: [0, 1], output: [ 1 ] },
                { input: [1, 0], output: [ 1 ] },
                { input: [1, 1], output: [ 0 ] }
            ])

        const result = acumen.predict([ 0, 0 ])
        console.log("XOR Test Result is : " + result[0])
    })

    function character(string) {
        return string
            .trim()
            .split('')
            .map(function(symbol){
                if ('#' === symbol) return 1
                if ('.' === symbol) return 0
            })
    }

    /**
     * Map letter to a number.
     */

    function map(letter) {
        if (letter === 'a') return [ 0.1 ]
        if (letter === 'b') return [ 0.3 ]
        if (letter === 'c') return [ 0.5 ]
        return 0
    }
});