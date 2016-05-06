#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const path = require('path');
const checkstyleFormatter = require('checkstyle-formatter');

const CheckDavid = require('./src/CheckDavid');

const packageFile = process.argv[2];

new CheckDavid(packageFile).run()
    .tap(messages => console.log(checkstyleFormatter([{ filename: path.basename(packageFile), messages }])))
    .then(messages => messages.some(message => message.severity === 'error') ? 1 : 0)
    .catch(function (error) {
        console.error(error.message);
        console.dir(error.stack.split(/\n/));
        return 2;
    })
    .then(process.exit);
