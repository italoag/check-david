'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const OPTIONS = {
    'file': {
        type: 'string',
        requiresArg: true,
        describe: 'Path to package.json to parse',
        default: path.join(process.cwd(), 'package.json'),
        defaultDescription: 'package.json in the current working directory'
    },
    'warnOnly': {
        type: 'boolean',
        describe: 'Always terminate with exit code 0 (unless an error occurred)',
        default: false
    },
    'level': {
        type: 'string',
        requiresArg: true,
        choices: ['patch', 'minor', 'major'],
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

module.exports = yargs
    .help('help').describe('help', 'Display basic usage information')
    .env('CD')
    .wrap(yargs.terminalWidth())
    .detectLocale(false)
    .version()
    .options(OPTIONS)
    .pkgConf('check-david', process.cwd())
    .config('config', file => JSON.parse(fs.readFileSync(file)))
    .strict();
