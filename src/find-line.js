'use strict';

const escape = require('escape-string-regexp');

/**
 * @param {Array.<string>} lines
 * @param {string} name
 * @param {string} version
 * @return {{ line: number, column: number }}
 */
module.exports = function findLine(lines, name, version) {
    const regex = new RegExp(`^\\s*"${escape(name)}":\\s*"${escape(version)}"`);
    const matches = lines.reduce(function (result, line, index) {
        if (regex.test(line)) {
            result.push({ line: index + 1, column: line.indexOf(version) });
        }
        return result;
    }, [{ line: 0, column: 0 }]);

    return matches[matches.length === 2 ? 1 : 0];
};


