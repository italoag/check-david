'use strict';

module.exports = {
    debug: true,
    files: [
        {
            pattern: 'test/*.json',
            instrument: false
        },
        'src/**/*.js'
    ],
    tests: [
        'test/**/*.spec.js'
    ],
    env: {
        type: 'node'
    }
};