'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const LEVELS = {
    patch: 0,
    minor: 1,
    major: 2
};

const OPTIONS = {
    'file': {
        type: 'string',
        describe: 'Path to package.json to parse',
        default: path.join(process.cwd(), 'package.json'),
        defaultDescription: 'package.json in the current working directory'
    },
    'level': {
        type: 'string',
        choices: Object.keys(LEVELS),
        describe: 'Minimum version part to consider',
        default: 'minor'
    },
    'force-pinned': {
        type: 'boolean',
        describe: 'Force dependencies to be pinned',
        default: false
    },
    'force-dev-pinned': {
        type: 'boolean',
        describe: 'Force devDependencies to be pinned',
        default: false
    }
};

module.exports.LEVELS = LEVELS;
module.exports.yargs = yargs
    .help('help').describe('help', 'Display basic usage information')
    .env('CD')
    .wrap(yargs.terminalWidth())
    .detectLocale(false)
    .version()
    .options(OPTIONS)
    .pkgConf('check-david', process.cwd())
    .config('config', path => JSON.parse(fs.readFileSync(path)))
    .check(function (argv, options) {
        argv['level'] = LEVELS[argv['level']];
        return true;
    })
    .strict();