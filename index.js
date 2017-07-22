const Matrix = require('node-matrix');
/**
 * @link https://www.npmjs.com/package/node.extend
 */
var extend = require('node.extend');

class Acumen {
    constructor (options) {
        super();

        options = extend(true, {
            learningRate : 0.7,
            hiddenLayers : 1,
            hiddenUnits : 3,
            iterations : 10000
        }, options);
    }
}