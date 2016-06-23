'use strict';

const expect = require('chai').expect;

const validate = require('../src/validate');

describe('validate', function () {
    describe('regardless of pinning', function () {
        it('fails if the version is a Git repository', function () {
            expect(validate('my-module', '1.3.7', 'Finanzchef24-GmbH/check-david')).to.deep.equal({
                part: null,
                message: 'Unparsable semver string for module "my-module": "Finanzchef24-GmbH/check-david"'
            });
        });
    });

    describe('when pinning is required', function () {
        function v(stableStr, requiredStr) {
            return validate('my-module', stableStr, requiredStr, true);
        }

        it('fails if version is a range', function () {
            expect(v('1.3.7', '1.2')).to.deep.equal({
                part: null,
                message: 'Version for module "my-module" is not pinned'
            });
        });

        it('fails if the version is malformed', function () {
            expect(v('1.3.7', '1.3.7.4')).to.deep.equal({
                part: null,
                message: 'Unparsable semver string for module "my-module": "1.3.7.4"'
            });
        });

        it('fails if the version is a major version behind', function () {
            expect(v('2.0.1', '1.3.7')).to.deep.equal({
                part: 'major',
                message: 'New major version available for module "my-module" (2.0.1)'
            });
        });

        it('fails if the version is a minor version behind', function () {
            expect(v('1.4.4', '1.3.7')).to.deep.equal({
                part: 'minor',
                message: 'New minor version available for module "my-module" (1.4.4)'
            });
        });

        it('fails if the version is a patch version behind', function () {
            expect(v('1.3.9', '1.3.7')).to.deep.equal({
                part: 'patch',
                message: 'New patch version available for module "my-module" (1.3.9)'
            });
        });

        it('succeeds if the version is pinned', function () {
            expect(v('1.3.7', '1.3.7')).to.be.null;
        });
    });

    describe('when pinning is not required', function () {
        function v(stableStr, requiredStr) {
            return validate('my-module', stableStr, requiredStr, false);
        }

        it('succeeds if version is a range', function () {
            expect(v('1.3.7', '1.3')).to.be.null;
        });

        it('fails if version is a range but outdated', function () {
            expect(v('1.3.7', '1.2')).to.be.deep.equal({
                part: null,
                message: 'Latest version for module "my-module" is out of range ">=1.2.0 <1.3.0"'
            });
        });

        it('fails if the version is malformed', function () {
            expect(v('1.3.7', '1.3.7.4')).to.deep.equal({
                part: null,
                message: 'Unparsable semver string for module "my-module": "1.3.7.4"'
            });
        });

        it('fails if the version is a major version behind', function () {
            expect(v('2.0.1', '1.3.7')).to.deep.equal({
                part: 'major',
                message: 'New major version available for module "my-module" (2.0.1)'
            });
        });

        it('fails if the version is a minor version behind', function () {
            expect(v('1.4.4', '1.3.7')).to.deep.equal({
                part: 'minor',
                message: 'New minor version available for module "my-module" (1.4.4)'
            });
        });

        it('fails if the version is a patch version behind', function () {
            expect(v('1.3.9', '1.3.7')).to.deep.equal({
                part: 'patch',
                message: 'New patch version available for module "my-module" (1.3.9)'
            });
        });

        it('succeeds if the version is pinned', function () {
            expect(v('1.3.7', '1.3.7')).to.be.null;
        });
    });
});
