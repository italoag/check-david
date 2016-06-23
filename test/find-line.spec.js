'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const findLine = require('../src/find-line');

const FILE = path.join(__dirname, 'my-package.json');
const SOURCE = fs.readFileSync(FILE)
                .toString()
                .split(/\n/);
const UNKNOWN = {
    line: 0,
    column: 0
};

describe('findLine', function () {
    it('finds a unique module', function () {
        expect(findLine(SOURCE, 'semver', '5.1.0')).to.deep.equal({
            line: 28,
            column: 19
        });
    });

    it('does not find a module with a different version', function () {
        expect(findLine(SOURCE, 'semver', '5.1.1')).to.deep.equal(UNKNOWN);
    });

    it('does not find a nonexistent module', function () {
        expect(findLine(SOURCE, 'async', '0.0.1')).to.deep.equal(UNKNOWN);
    });

    it('does not find a duplicate module', function () {
        expect(findLine(SOURCE, 'bluebird', '3.3.5')).to.deep.equal(UNKNOWN);
    });
});

