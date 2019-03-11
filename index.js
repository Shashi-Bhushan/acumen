'use strict';

/**
 * Dependencies for Acumen
 * @type {Matrix} {Emitter} {sample}
 */
const Matrix = require('node-matrix');
const Emitter = require('emitter-component');
const sample = require('samples')

class Acumen extends Emitter{
    constructor (options) {
        super();

        options = options || {};

        // number of hidden layers in the neural network, default will be only one hidden layer
        this.hiddenLayers   = options.hiddenLayers || 1;
        // number of nodes in each hidden layer
        this.hiddenLayerNeurons    = options.hiddenLayerNeurons || 3;
        // alpha
        this.learningRate   = options.learningRate || 0.7;
        // No of Iterations in Neural Network
        this.iterations     = options.iterations || 10000;
    }

    learn (data) {
        data = this.matricize(data);

        // if the weights are not set, that means learn has been called first time
        if (! this.weights) {
            this.setup(data);
        }

        // train the network with data first
        for (let iteration = 0; iteration < this.iterations; iteration++) {
            // Find result
            const result = this.forwardPropagation(data);
            // Find errors
            const error = this.backPropagation(data, result);
            this.emit('data', iteration, error, result);
        }

        return this;
    }

    /**
     * Set up the Initial Neural Network along with a random {sample} value for the weights
     * @param data
     */
    setup (data) {
        this.weights = [];

        // =====================
        // Note : data.input[0] is the first example
        // For eg, if my neural network is predicting XOR, the first input would be {0, 0}
        // In this case, the length of the example i.e. 2 will serve as number of input nodes in the neural network
        // =====================

        // Set Weights for Input Layer to Hidden Layer
        this.weights.push(
            Matrix({
                rows    : data.input[0].length,
                columns : this.hiddenLayerNeurons,
                values   : sample
            })
        );

        // Set Weights for one Hidden Layer to another
        for (let index = 0; index < data.hiddenLayers; index++) {
            this.weights.push(
                Matrix({
                    rows    : this.hiddenLayerNeurons,
                    columns : this.hiddenLayerNeurons,
                    values   : sample
                })
            );
        }

        // Set Weights for Hidden Layer to Output Layer
        this.weights.push(
            Matrix({
                rows    : this.hiddenLayerNeurons,
                columns : data.output[0].length,
                values  : sample
            })
        );
    }

    /**
     *
     * @param examples
     * @returns [
     *              {
     *                  sum : [ ... ],
     *                  result : [ ...]
     *              },
     *              ...
     *          ]
     */
    forwardPropagation (examples) {
        const results = [];

        // calculate sum and sigmoid result from Input Layer to First Hidden Layer
        var sum = this.sum(
            this.weights[0],
            examples.input
        );
        results.push(sum);

        // calculate sum and sigmoid result from one Hidden Layer to another
        for (let index = 1; index < this.hiddenLayers; index++) {
            results.push(
                this.sum(
                    this.weights[index],
                    results[index - 1].result
                )
            );
        }

        // calculate sum and sigmoid result from Hidden Layer to Output Layer
        results.push(
            this.sum(
                this.weights[this.weights.length - 1],
                results[results.length - 1].result
            )
        );

        return results;
    }

    /**
     * Back Propagation in a Neural Network
     * @param examples
     * @param results
     * @returns {
     *              Matrix(target value - calculated value)
     *          }
     */
    backPropagation (examples, results) {
        const hiddenLayers = this.hiddenLayers;
        const learningRate = this.learningRate;
        const weights = this.weights;

        const lastResultsEntryIndex = results.length - 1;

        // ================================
        // Output Layer to Last Hidden Layer
        // ================================
        // measure error
        const error = Matrix.subtract(
            examples.output,
            results[lastResultsEntryIndex].result
        );

        // Measure Delta
        let delta = Matrix.multiplyElements(
            results[lastResultsEntryIndex].sum.transform(this.sigmoidPrime),
            error
        );

        // Measure Change
        let change = Matrix.multiplyScalar(
            Matrix.multiply(
                delta,
                results[hiddenLayers - 1].result.transpose()
            ),
            learningRate
        );

        // Rectify Weight
        weights[weights.length - 1] = Matrix.add(
            weights[weights.length - 1],
            change
        );

        // ================================
        // Between Hidden Layers
        // ================================
        for (let i = 1; i < hiddenLayers; i++) {
            // Measure delta
            delta = Matrix.multiplyElements(
                Matrix.multiply(
                    weights[weights.length - i].transpose(), delta
                ),
                results[results.length - (i + 1)].sum.transform(this.sigmoidPrime)
            );

            // Measure Change
            change = Matrix.multiplyScalar(
                Matrix.multiply(delta, results[results.length - (i + 1)].result.transpose()),
                learningRate
            );

            // Rectify Weights
            weights[weights.length - (i + 1)] = Matrix.add(weights[weights.length - (i + 1)], change)
        }

        // =================================
        // First Hidden Layers to Input Layer
        // =================================
        // Measure Delta
        delta = Matrix.multiplyElements(
            Matrix.multiply(
                weights[1].transpose(), delta
            ),
            results[0].sum.transform(this.sigmoidPrime)
        );

        // Measure Change
        change = Matrix.multiplyScalar(
            Matrix.multiply(delta, examples.input.transpose()),
            learningRate
        );

        // Rectify Weights
        weights[0] = Matrix.add(weights[0], change);

        return error
    }

    /**
     * Gives X* theta and sigmoid(X * theta)
     * @param weights
     *          Theta in the equation
     * @param inputs
     *          X's in the equation
     * @returns {
     *              sum     : [ weights * inputs],
     *              result  : [ sigmoid(sum) ]
     *          }
     */
    sum (weights, inputs) {
        const result = {};

        result.sum = Matrix.multiply(weights, inputs);
        result.result = result.sum.transform(this.sigmoid);

        return result;
    }

    /**
     * Mathematical Sigmoid Function
     *
     * @param z
     *      The Matreix for which sigmoid is to be found
     * @returns {number}
     *      Sigmoid value of the matrix
     */
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

        for (let i = 0; i< data.length; i++) {
            returnValue.input.push(data[i].input);
            returnValue.output.push(data[i].output);
        }

        returnValue.input = Matrix(returnValue.input);
        returnValue.output = Matrix(returnValue.output);

        return returnValue;
    }

    /**
     * Predicts the last Layers' Result value as an output of a Trained Neural Network
     * @param input
     * @returns {predicted value}
     */
    predict (input) {
        const results = this.forwardPropagation({ input: Matrix([input]) })
        return results[results.length - 1].result
    }
}

module.exports = Acumen;