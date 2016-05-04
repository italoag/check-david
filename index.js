'use strict';

const fs = require('fs');

const Promise = require('bluebird');
const semver = require('semver');
const david = require('david');
const checkstyleFormatter = require('checkstyle-formatter');

const packageFile = process.argv[2];

const errorOpts = {
    E404: true,
    ESCM: true
};

let pkg, pkgLines;

/**
 * @param {string} name
 * @param {string} version
 * @return {?{ source: string, line: number, column: number }}
 */
function findLineInSource(name, version) {
    const matches = pkgLines
        .map((source, index) => ({ source, line: index + 1 }))
        .filter(entry => entry.source.indexOf(`"${name}": "${version}"`) !== -1)
        .map(entry => Object.assign(entry, { column: entry.source.indexOf(version)}));

    return matches.length === 1 ? matches[0] : null;
}

/**
 * @param {{ stable: string, required: string, latest: string }} dependencies
 * @return {Array.<Object>}
 */
function check(dependencies) {
    const messages = [];

    Object.keys(dependencies).forEach(function (name) {
        const vStable = dependencies[name].stable;
        const vRequired = dependencies[name].required;
        const source = findLineInSource(name, vRequired) || { line: 0, column: 0 };

        if (!semver.valid(vRequired)) {
            // David has incomplete support for alternative syntaxes, e.g. "git@github.com:...", see
            // https://github.com/alanshaw/david/issues/92
            return messages.push({
                line: source.line,
                column: source.column,
                severity: 'warning',
                message: `Unparsable semver string for module "${name}": "${vRequired}"`
            });
        }

        const stable = { major: semver.major(vStable), minor: semver.minor(vStable) };
        const required = { major: semver.major(vRequired), minor: semver.minor(vRequired) };

        if (stable.major > required.major) {
            messages.push({
                line: source.line,
                column: source.column,
                severity: 'error',
                message: `New major version available for module "${name}" (${vStable})`
            });
        } else if (stable.minor > required.minor) {
            messages.push({
                line: source.line,
                column: source.column,
                severity: 'warning',
                message: `New minor version available for module "${name}" (${vStable})`
            });
        }
    });

    return messages;
}

Promise
    .fromCallback(cb => fs.access(packageFile, fs.R_OK, cb))
    .then(function () {
        pkg = require(packageFile);
        pkgLines = fs.readFileSync(packageFile).toString().split(/\n/);
    })
    .then(() => [
        Promise.fromCallback(cb => david.getUpdatedDependencies(pkg, { stable: true, error: errorOpts }, cb)),
        Promise.fromCallback(cb => david.getUpdatedDependencies(pkg, { dev: true, stable: true, error: errorOpts }, cb))
    ])
    .map(check)
    .spread((deps, devDeps) => deps.concat(devDeps))
    .tap(messages => console.log(checkstyleFormatter([{ filename: 'package.json', messages }])))
    .then(function (messages) {
        if (messages.some(message => message.severity === 'error')) {
            process.exit(1);
        }
    })
    .catch(function (error) {
        console.error(error.message);
        console.dir(error.stack.split(/\n/));
        process.exit(2);
    });
