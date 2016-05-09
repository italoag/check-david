#!/usr/bin/env node

'use strict';

const path = require('path');
const checkstyleFormatter = require('checkstyle-formatter');

const yargs = require('./src/yargs');
const CheckDavid = require('./src/CheckDavid');

const argv = yargs.parse(process.argv);
const packageFile = argv.file;

/**
 * @param {string} part
 * @return {number}
 */
function part(part) {
    switch (part) {
    case null:
    case 'major':
        return 2;
    case 'minor':
        return 1;
    case 'patch':
        return 0;
    default:
        throw new Error(`Unexpected part: "${part}"`);
    }
}

/**
 * @param {string} part
 * @return {number}
 */
function severity(part) {
    switch (part) {
    case null:
    case 'major':
        return 'error';
    case 'minor':
        return 'warning';
    case 'patch':
        return 'info';
    default:
        throw new Error(`Unexpected part: "${part}"`);
    }
}

/* eslint-disable no-console */
new CheckDavid(packageFile)
    .run({ pin: argv.forcePinned, pinDev: argv.forceDevPinned })
    .filter(message => part(message.part) >= part(argv.level))
    .map(message => Object.assign(message, { severity: severity(message.part) }))
    .tap(messages => console.log(checkstyleFormatter([{ filename: path.basename(packageFile), messages }])))
    .catch(function (error) {
        console.error(error.message);
        console.dir(error.stack.split(/\n/));
        return 1;
    })
    .then(process.exit);
