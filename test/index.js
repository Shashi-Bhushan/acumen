'use strict';

const Acumen = require('..');
const assert = require('assert');

/**
 * Tests
 */

describe('tests()',function (){
    const alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');

    it('Character Recognition test', function () {
        const acumen = new Acumen({
            learningRate: 0.003,
            iterations: 50000
        });

        const a = character(
            '.#####.'
            + '#.....#'
            + '#.....#'
            + '#######'
            + '#.....#'
            + '#.....#'
            + '#.....#'
        )

        const b = character(
            '######.'
            + '#.....#'
            + '#.....#'
            + '######.'
            + '#.....#'
            + '#.....#'
            + '######.'
        )

        const c = character(
            '#######'
            + '#......'
            + '#......'
            + '#......'
            + '#......'
            + '#......'
            + '#######'
        )

        const d = character(
            '#######'
            + '.#....#'
            + '.#....#'
            + '.#....#'
            + '.#....#'
            + '.#....#'
            + '#######'
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
            '######.'
            + '#......'
            + '#......'
            + '#......'
            + '#......'
            + '#......'
            + '######.'
        );
        const result = acumen.predict(resultChar);

        console.log('Character Test Expected Result is : ' + map('c')) // ~ 4
        console.log('Character Test Result is : ' + result[0]) // ~ 4

        var difference = Math.abs(0.4 - result[0]);
        // TODO: user assert Here
        // assert(difference < 0.05);
    })

    it('XOR Test', function () {
        const data = [
            {input : [0, 0], output : [ 1 ]},
            {input : [0, 1], output : [ 0 ]},
            {input : [1, 0], output : [ 0 ]},
            {input : [1, 1], output : [ 0 ]}
        ];

        const acumen = new Acumen()
            .learn([
                { input: data[0].input, output: data[0].output },
                { input: data[1].input, output: data[1].output },
                { input: data[2].input, output: data[2].output },
                { input: data[3].input, output: data[3].output }
            ])

        const toCheck = 1;
        const result = acumen.predict(data[toCheck].input)
        console.log('XOR Test Expected Result is : ' + data[toCheck].output)
        console.log('XOR Test Result is : ' + result[0])
    })

    function character (string) {
        return string
            .trim()
            .split('')
            .map(function (symbol){
                if ('#' === symbol) return 1
                if ('.' === symbol) return 0
            })
    }

    /**
     * Map Alphabet to a number.
     */
    function map (letter) {
        return [ alphabets.indexOf(letter)/10 * 2 ];
    }
});