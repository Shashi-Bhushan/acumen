const Matrix = require('node-matrix');
const Emitter = require('emitter-component');
/**
 * @link https://www.npmjs.com/package/node.extend
 */
var extend = require('node.extend');

class Acumen extends Emitter{
    constructor (options) {
        super();

        options = extend(true, {
            // number of hidden layers in the neural network, default will be only one hidden layer
            hiddenLayers    : 1,
            // number of nodes in each hidden layer, default will be 3
            hiddenUnits     : 3,
            // alpha
            learningRate    : 0.7,
            iterations      : 10000
        }, options);

        this.hiddenLayers   = options.hiddenLayers;
        this.hiddenUnits    = options.hiddenUnits;
        this.learningRate   = options.learningRate;
        this.iterations     = options.iterations;
    }

    learn (data) {
        data = this.matricize(data);

        // if the weights are not set, that means learn has been called first time
        if(! this.weights) {
            this.setup(data);
        }

        // train the network with data first
        for(let iteration = 0; iteration < this.iterations; iteration++) {
            // Find result
            const result = this.forwardPropagation(data);
            // Find errors
            const error = this.backPropagation(data, result);
            this.emit('data', iteration, error, result);
        }

        return this;
    }

    /**
     * Set up the Initial Neural Network along with a random value for the weights
     * @param data
     */
    setup(data) {
        this.weights = [];

        //=====================
        // Note : data.input[0] is the first example
        // For eg, if my neural network is predicting XOR, the first input would be {0, 0}
        // In this case, the length of the example i.e. 2 will serve as number of input nodes in the neural network
        //=====================

        // Mapping of Input Layer > Hidden Layer
        this.weights.push(
            Matrix({
                rows    : data.input[0].length,
                columns : data.hiddenUnits,
                value   : Math.random()
            })
        );

        // Mapping of Hidden Layer > Hidden Layer
        for(let index = 0; index < data.hiddenLayers; index++) {
            this.weights.push(
                Matrix({
                    rows    : data.hiddenUnits,
                    columns : data.hiddenUnits,
                    value   : Math.random()
                })
            );
        }

        // Mapping of Hidden Layer > Output Layer
        this.weights.push(
            Matrix({
                rows    : data.hiddenUnits,
                columns : data.output[0].length,
                value   : Math.random()
            })
        );

    }

    forwardPropagation (examples) {
        const results = [];

        //================================
        // Input Layer > Hidden Layer
        //================================
        // calculate sum and sigmoid result
        var sum = this.sum(
            this.weights[0],
            examples.input
        );
        results.push(sum);

        // Hidden Layer > Hidden Layer
        for(let index = 1; index < this.hiddenLayers; index++) {
            results.push(
                this.sum(
                    this.weights[index],
                    results[index - 1].result
                )
            );
        }

        // Hidden Layer > Output Layer
        results.push(
            this.sum(
                this.weights[this.weights.length - 1],
                results[results.length - 1].result
            )
        );

        return results;
    }

    backPropagation (examples, results) {
        const hiddenLayers = this.hiddenLayers;
        const learningRate = this.learningRate;
        const weights = this.weights;

        const lastResultsEntryIndex = results.length - 1;


        //================================
        // Input Layer > Hidden Layer
        //================================
        const error = Matrix.subtract(
            examples.output,
            results[lastResultsEntryIndex].result
        );

        let delta = Matrix.multiplyElements(
            results[lastResultsEntryIndex].sum.transform(this.sigmoidPrime),
            error
        );

        let change = Matrix.multiplyScalar(
            Matrix.multiply(
                delta,
                results[hiddenLayers - 1].sum.transpose()
            ),
            learningRate
        );

        weights[weights.length - 1] = Matrix.add(
            weights[weights.length - 1],
            change
        );

        // hidden > hidden
        for (let i = 1; i < hiddenLayers; i++) {
            delta = Matrix.multiplyElements(
                Matrix.multiply(
                    weights[weights.length - i].transpose(), delta
                ),
                results[results.length - (i + 1)].sum.transform(this.sigmoidPrime)
            );
            change = Matrix.multiplyScalar(
                Matrix.multiply(delta, results[results.length - (i + 1)].result.transpose()),
                learningRate
            );
            weights[weights.length - (i + 1)] = Matrix.add(weights[weights.length - (i + 1)], change)
        }

        // hidden > input
        delta = Matrix.multiplyElements(
            Matrix.multiply(
                weights[1].transpose(), delta
            ),
            results[0].sum.transform(this.sigmoidPrime)
        );
        change = Matrix.multiplyScalar(
            Matrix.multiply(delta, examples.input.transpose()),
            learningRate
        );
        weights[0] = Matrix.add(weights[0], change)

        return error
    }

    sum (weights, inputs) {
        const result = {};

        result.sum = Matrix.multiply(weights, inputs);
        result.result = result.sum.transform(this.sigmoid);

        return result;
    }

    sigmoid (z) {
        return 1 / (1 + Math.exp(-z));
    }

    sigmoidPrime (z) {
        return Math.exp(-z) / Math.pow(1 + Math.exp(-z), 2);
    }

    /**
     * Create a matrix out of the data
     * @param
     *      data : [
     *          { input : {{}}, output : {{}} },
     *          { input : {{}}, output : {{}} },
     *          ...
     *      ]
     * @returns {
     *      input: [ data.input values ],
     *      output: [ data.output values ]
     *      }
     */
    matricize (data) {
        const returnValue = {
            input   : [],
            output  : []
        };

        for(let i = 0; i< data.length; i++) {
            returnValue.input.push(data[i].input);
            returnValue.output.push(data[i].output);
        }

        returnValue.input = Matrix(returnValue.input);
        returnValue.output = Matrix(returnValue.output);

        return returnValue;
    }

    predict (input) {
        const results = this.forwardPropagation({ input: Matrix([input]) })
        return results[results.length - 1].result[0]
    }
}

module.exports = Acumen;