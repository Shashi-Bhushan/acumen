"use strict";

const Acumen = require('..');
const assert = require('assert');

/**
 * Tests
 */

describe('tests()',function(){
    const alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');

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

        const d = character(
            '#######' +
            '.#....#' +
            '.#....#' +
            '.#....#' +
            '.#....#' +
            '.#....#' +
            '#######'
        )

        /**
         * Learn the letters A through C.
         */

        acumen.learn([
                { input: a, output: map('a') }, // 0.0
                { input: b, output: map('b') }, // 0.2
                { input: c, output: map('c') }, // 0.4
                { input: d, output: map('d') }  // 0.6
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

        console.log("Character Test Expected Result is : " + map('c')) // ~ 0.6
        console.log("Character Test Result is : " + result[0]) // ~ 0.6
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
        console.log("XOR Test Expected Result is : " + 0)
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
        return [ alphabets.indexOf(letter)/10 * 2 ];
    }
});