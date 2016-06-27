# check-david
[![npm](https://img.shields.io/npm/v/check-david.svg?style=flat-square)](https://www.npmjs.com/package/check-david)
[![Travis CI](https://img.shields.io/travis/Finanzchef24-GmbH/check-david/master.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/Finanzchef24-GmbH/check-david)
[![Dependency Status](https://img.shields.io/david/Finanzchef24-GmbH/check-david.svg?style=flat-square)](https://david-dm.org/Finanzchef24-GmbH/check-david)
[![devDependency Status](https://img.shields.io/david/dev/Finanzchef24-GmbH/check-david.svg?style=flat-square)](https://david-dm.org/Finanzchef24-GmbH/check-david)
![node](https://img.shields.io/node/v/jira-todo.svg?style=flat-square)
[![License](https://img.shields.io/npm/l/check-david.svg?style=flat-square)](https://github.com/Finanzchef24-GmbH/check-david/blob/master/LICENSE)

> No-nonsense dependency checks for your package.json

A simple command line tool that checks whether your dependencies are up to date (using [David](https://github.com/alanshaw/david)) and outputs a checkstyle-compatible XML report.

### Use Case

This module has the following semantics:

 - if you're at least one patch version behind, an informational message will be generated
 - if you're at least one minor version behind, a warning will be generated
 - if you're at least one major version behind, an error will be generated

If you set the `--force-pinned` (and/or `--force-dev-pinned`) flag, unpinned dependencies will cause an error. If needed, you can completely [ignore packages](https://github.com/alanshaw/david#ignore-dependencies). If you have a specific feature request, feel free to [create an issue](https://github.com/Finanzchef24-GmbH/check-david/issues/new).

### Usage
```bash
$ npm i -g check-david
$ check-david --file /absolute/path/to/package.json > check-david.xml

# or execute the script from your module directory:
$ cd projects/awesome-stuff
$ check-david > check-david.xml  # uses the package.json in the current directory
```

You can ignore patch and minor version updates by using the `--level minor` or `--level major` command line option, respectively. Not that this does not affect the severity of the generated messages.
