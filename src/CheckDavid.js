'use strict';

const fs = require('fs');

const david = require('david');
const Promise = require('bluebird');

const validate = require('./validate');
const findLine = require('./find-line');

/**
 * Main CheckDavid class
 */
class CheckDavid {
    /**
     * @param {string} file
     */
    constructor(file) {
        this._file = file;
        this._lines = null;
        this._pkg = null;
    }

    /**
     * Load the package.json file specified in the constructor and split it into lines.
     *
     * @private
     * @return {Promise}
     */
    _load() {
        return Promise
            .fromCallback(cb => fs.readFile(this._file, cb))
            .bind(this)
            .then(buffer => buffer.toString())
            .then(function (contents) {
                this._pkg = JSON.parse(contents);
                this._lines = contents.split(/\n/);
            });
    }

    /**
     * @private
     * @return {Promise.<Array.<Object>>}
     */
    _getUpdatedDependencies() {
        return Promise
            .join(
                Promise.fromCallback(cb => david.getUpdatedDependencies(this._pkg, {
                    dev: false,
                    stable: true
                }, cb)),
                Promise.fromCallback(cb => david.getUpdatedDependencies(this._pkg, {
                    dev: true,
                    stable: true
                }, cb))
            );
    }

    /**
     * Check if the dependency with the given name, stable and required version needs to be updated and generate the
     * appropriate warning or error message.
     *
     * @private
     * @param {string} name The name of the dependency.
     * @param {string} stableStr The latest stable version available.
     * @param {string} requiredStr The required version as specified in the package.json.
     * @param {boolean} mustBePinned If true, the dependency must be pinned.
     * @return {?Object} A message object or null.
     */
    _checkDependency(name, stableStr, requiredStr, mustBePinned) {
        const source = findLine(this._lines, name, requiredStr);
        const message = validate(name, stableStr, requiredStr, mustBePinned);

        return message ? Object.assign(message, source) : null;
    }

    /**
     * @private
     * @param {{ stable: string, required: string, latest: string }} deps
     * @param {boolean} mustBePinned If true, the dependency must be pinned.
     * @return {Array.<Object>}
     */
    _check(deps, mustBePinned) {
        return Object.keys(deps).reduce(function (result, name) {
            const message = this._checkDependency(name, deps[name].stable, deps[name].required, mustBePinned);

            return message ? result.concat(message) : result;
        }.bind(this), []);
    }

    /**
     * @param {Object=} options
     * @return {Promise.<Array.<Object>>}
     */
    run(options) {
        const opts = Object.assign({}, {
            pin: false,
            pinDev: false
        }, options);

        return this._load()
            .then(this._getUpdatedDependencies)
            .spread((deps, devDeps) => [this._check(deps, opts.pin), this._check(devDeps, opts.pinDev)])
            .spread((deps, devDeps) => deps.concat(devDeps));
    }
}

module.exports = CheckDavid;
