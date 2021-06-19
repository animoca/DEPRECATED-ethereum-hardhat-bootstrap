#!/usr/bin/env node

const fse = require('fs-extra');
const {sortPackageJson} = require('sort-package-json');
const sortObjectKeys = require('sort-object-keys');

const file = 'package.json';
const sortOrder = [
  'name',
  'version',
  'description',
  'author',
  'license',
  'keywords',
  'repository',
  'main',
  'bin',
  'scripts',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'engines',
];

// Caution: it is necessary that for any pair of elements (a, b) from this list, a.startsWith(b) is false
// in other words, one element from this list must not "start with" another one.
const scriptsSortOrder = [
  'postinstall',
  'lint',
  'fix',
  'format',
  'ganache',

  // specific to 'contracts' template
  'compile',
  'flatten',
  'smartcheck',
  'test',
  'coverage',
  'gas-report',
  'doc',

  // specific to 'migrations' template
  'node',
  'deploy',

  'clean',
  'run-all',
  'prepack',
  'release',
];

const packageJson = JSON.parse(fse.readFileSync(file, 'utf8'));
if (packageJson.scripts !== undefined) {
  packageJson.scripts = sortObjectKeys(packageJson.scripts, (a, b) => {
    let aPosition = 0;
    let bPosition = 0;
    for (let i = 0; i != scriptsSortOrder.length; ++i) {
      const script = scriptsSortOrder[i];
      if (a.startsWith(script)) {
        aPosition = i;
      }
      if (b.startsWith(script)) {
        bPosition = i;
      }
    }

    if (aPosition == bPosition) {
      return a.localeCompare(b);
    }

    return aPosition - bPosition;
  });
}

const sorted = sortPackageJson(packageJson, {sortOrder});

fse.writeFileSync(file, JSON.stringify(sorted, null, 2), 'utf8');
console.log(`${file} has been is sorted!`);
