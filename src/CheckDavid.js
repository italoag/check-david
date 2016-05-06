'use strict';

const fs = require('fs');

const david = require('david');
const escape = require('escape-string-regexp');
const Promise = require('bluebird');
const semver = require('semver');

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
     * Returns the line in which the given dependency was specified. If no match was found (or it was ambiguous), null
     * is returned.
     *
     * @private
     * @param {string} name
     * @param {string} version
     * @return {?{ source: string, line: number, column: number }}
     */
    _findLineInSource(name, version) {
        const matches = this._lines
            .map((source, index) => ({ source, line: index + 1 }))
            .filter(entry => new RegExp(`"${escape(name)}":\\s*"${escape(version)}"`).test(entry.source))
            .map(entry => Object.assign(entry, { column: entry.source.indexOf(version)}));

        return matches.length === 1 ? matches[0] : null;
    }

    /**
     * @private
     * @return {Promise}
     */
    _load() {
        return Promise
            .fromCallback(cb => fs.readFile(this._file, cb))
            .bind(this)
            .then(buffer => this._lines = buffer.toString().split(/\n/));
    }

    /**
     * @private
     * @return {Promise.<Array.<Object>>}
     */
    _getUpdatedDependencies() {
        return Promise
            .join(
                Promise.fromCallback(cb => david.getUpdatedDependencies(this._pkg, { stable: true }, cb)),
                Promise.fromCallback(cb => david.getUpdatedDependencies(this._pkg, { dev: true, stable: true }, cb))
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
     * @return {?Object} An error/warning message object or null.
     */
    _checkDependency(name, stableStr, requiredStr) {
        const source = this._findLineInSource(name, requiredStr) || { line: 0, column: 0 };

        if (!semver.valid(requiredStr)) {
            if (semver.validRange(requiredStr)) {
                return {
                    line: source.line,
                    column: source.column,
                    severity: 'error',
                    message: `Version for module "${name}" is not pinned`
                };
            }

            // David has incomplete support for alternative syntaxes, e.g. "git@github.com:...", see
            // https://github.com/alanshaw/david/issues/92
            return {
                line: source.line,
                column: source.column,
                severity: 'warning',
                message: `Unparsable semver string for module "${name}": "${requiredStr}"`
            };
        }

        const stable = { major: semver.major(stableStr), minor: semver.minor(stableStr) };
        const required = { major: semver.major(requiredStr), minor: semver.minor(requiredStr) };

        if (stable.major > required.major) {
            return {
                line: source.line,
                column: source.column,
                severity: 'error',
                message: `New major version available for module "${name}" (${stableStr})`
            };
        } else if (stable.minor > required.minor) {
            return {
                line: source.line,
                column: source.column,
                severity: 'warning',
                message: `New minor version available for module "${name}" (${stableStr})`
            };
        }
    }
    
    /**
     * @private
     * @param {{ stable: string, required: string, latest: string }} dependencies
     * @return {Array.<Object>}
     */
    _check(dependencies) {
        return Object.keys(dependencies).reduce(function (result, name) {
            const stable = dependencies[name].stable;
            const required = dependencies[name].required;
            const message = this._checkDependency(name, stable, required);
            return message ? result.concat(message) : result;
        }.bind(this), []);
    }

    /**
     * @return {Promise.<Array.<Object>>}
     */
    run() {
        return Promise
            .try(() => this._pkg = require(this._file))
            .bind(this)
            .then(this._load)
            .then(this._getUpdatedDependencies)
            .map(this._check)
            .spread((deps, devDeps) => deps.concat(devDeps));
    }
}

module.exports = CheckDavid;
