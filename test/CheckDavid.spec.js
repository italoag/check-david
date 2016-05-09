'use strict';

const fs = require('fs');
const path = require('path');

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const expect = require('chai').expect;
const sinonChai = require('sinon-chai');

const myPackageJson = fs.readFileSync(path.join(__dirname, 'my-package.json'));
const fsStub = { readFile: sinon.stub() };
const findLineStub = sinon.stub();
const validateStub = sinon.stub();
const davidStub = { getUpdatedDependencies: sinon.stub() };

chai.use(sinonChai);

const CheckDavid = proxyquire('../src/CheckDavid', {
    fs: fsStub,
    david: davidStub,
    './validate': validateStub,
    './findLine': findLineStub
});

describe('CheckDavid', function () {
    let checkDavid;

    beforeEach(function () {
        findLineStub.reset();
        validateStub.reset();
        fsStub.readFile.reset();
        davidStub.getUpdatedDependencies.reset();

        checkDavid = new CheckDavid('/my/package.json');
    });

    it('works', function () {
        fsStub.readFile.yields(null, myPackageJson);
        davidStub.getUpdatedDependencies.yields(null, {});
        findLineStub.returns({ line: 0, column: 0 });
        validateStub.returns(null);

        return checkDavid.run()
            .then(function (result) {
                expect(fsStub.readFile).to.have.been.calledOnce
                    .and.to.have.been.calledWithMatch('/my/package.json', sinon.match.func);
                expect(davidStub.getUpdatedDependencies).to.have.been.calledTwice
                    .and.to.have.been.calledWith(sinon.match.object, sinon.match({ dev: false }));
                expect(davidStub.getUpdatedDependencies).to.have.been.calledTwice
                    .and.to.have.been.calledWith(sinon.match.object, sinon.match({ dev: true }));
            });
    });
});
