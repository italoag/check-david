#!/usr/bin/env node

'use strict';

const path = require('path');
const checkstyleFormatter = require('checkstyle-formatter');

const yargs = require('./src/yargs');
const CheckDavid = require('./src/CheckDavid');

const argv = yargs.parse(process.argv);
const packageFile = argv.file;

/**
 * @param {string} type
 * @return {number}
 */
function level(type) {
    switch (type) {
    case 'error':
        return 2;
    case 'warning':
        return 1;
    case 'info':
        return 0;
    default:
        throw new Error(`Unexpected level: "${level}"`);
    }
}

/* eslint-disable no-console */
new CheckDavid(packageFile)
    .run({ pin: argv.forcePinned, pinDev: argv.forceDevPinned })
    .then(messages => messages.filter(message => level(message.severity) >= level(argv.level)))
    .tap(messages => console.log(checkstyleFormatter([{ filename: path.basename(packageFile), messages }])))
    .catch(function (error) {
        console.error(error.message);
        console.dir(error.stack.split(/\n/));
        return 1;
    })
    .then(process.exit);
