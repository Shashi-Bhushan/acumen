var Acumen = require('..');
var assert = require('assert');

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

        const result = acumen.predict(character(
            '#######' +
            '#......' +
            '#......' +
            '#......' +
            '#......' +
            '#..##..' +
            '#######'
        ))

        assert(result == map('c')[0]);;

        console.log("A is : " + a + " and map(a) is ",map('a')) // ~ 0.1
        console.log("A is : " + b + " and map(b) is ",map('b')) // ~ 0.3
        console.log("A is : " + c + " and map(c) is ",map('c')) // ~ 0.5
        console.log("Result is : " + result) // ~ 0.5

    });

    function character(string) {
        return string
            .trim()
            .split('')
            .map(integer)

        function integer(symbol) {
            if ('#' === symbol) return 1
            if ('.' === symbol) return 0
        }
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