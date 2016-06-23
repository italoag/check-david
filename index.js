#!/usr/bin/env node

'use strict';

const path = require('path');
const checkstyleFormatter = require('checkstyle-formatter');

const yargs = require('./src/yargs');
const CheckDavid = require('./src/CheckDavid');

const argv = yargs.parse(process.argv);
const packageFile = argv.file;

/**
 * @param {string} name
 * @return {number}
 */
function part(name) {
    switch (name) {
        case null:
        case 'major':
            return 2;
        case 'minor':
            return 1;
        case 'patch':
            return 0;
        default:
            throw new Error(`Unexpected part: "${name}"`);
    }
}

/**
 * @param {string} name
 * @return {string}
 */
function severity(name) {
    switch (name) {
        case null:
        case 'major':
            return 'error';
        case 'minor':
            return 'warning';
        case 'patch':
            return 'info';
        default:
            throw new Error(`Unexpected part: "${name}"`);
    }
}

/* eslint-disable no-console */
new CheckDavid(packageFile)
    .run({
        pin: argv.forcePinned,
        pinDev: argv.forceDevPinned
    })
    .filter(message => part(message.part) >= part(argv.level))
    .map(message => Object.assign(message, { severity: severity(message.part) }))
    .tap(messages => console.log(checkstyleFormatter([{
        filename: path.basename(packageFile),
        messages
    }])))
    .then(messages => (!argv.warnOnly && messages.length > 0 ? 1 : 0))
    .catch(function (error) {
        console.error(error.message);
        console.dir(error.stack.split(/\n/));
        return 2;
    })
    .then(process.exit);
