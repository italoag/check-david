# check-david
[![npm](https://img.shields.io/npm/v/check-david.svg?style=flat-square)](https://www.npmjs.com/package/check-david)
[![Dependency Status](https://img.shields.io/david/Finanzchef24-GmbH/check-david.svg?style=flat-square)](https://david-dm.org/Finanzchef24-GmbH/check-david)
[![devDependency Status](https://img.shields.io/david/dev/Finanzchef24-GmbH/check-david.svg?style=flat-square)](https://david-dm.org/Finanzchef24-GmbH/check-david)
![node](https://img.shields.io/node/v/jira-todo.svg?style=flat-square)
[![License](https://img.shields.io/npm/l/check-david.svg?style=flat-square)](https://github.com/Finanzchef24-GmbH/check-david/blob/master/LICENSE)

> No-nonsense dependency checks for your package.json

A simple command line tool that checks whether your dependencies are up to date (using [David](https://github.com/alanshaw/david)) and outputs a checkstyle-compatible XML report.

### Use Case

This module attempts to solve a very specific problem and thus has the following constraints:

 - all dependencies must be pinned (or they will cause an error)
 - if you're one or more patch versions behind, you're good
 - if you're one or more minor versions behind, a warning will be generated
 - if you're one or more major versions behind, an error will be generated

Currently, there isn't anything you can configure (except for [ignoring packages](https://github.com/alanshaw/david#ignore-dependencies)). If you have a specific feature request, feel free to [create an issue](https://github.com/Finanzchef24-GmbH/check-david/issues/new).

### Usage
```bash
$ npm i -g check-david
$ check-david /absolute/path/to/package.json > check-david.xml
```

check-david will terminate with an exit code of 1 if it found any errors (and with an exit code of 2 in case of "real" errors). So if you want to integrate the report in your build script you may want to override the exit code, e.g. via a script in your `package.json`:
```js
{
    // ...
    "scripts": {
        "check-david": "check-david `pwd`/package.json > reports/check-david.xml || true"
    }
}
```
and then simply run
```bash
$ npm run check-david
```