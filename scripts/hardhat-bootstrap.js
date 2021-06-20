#!/usr/bin/env node

const fse = require('fs-extra');
const path = require('path');
const merge = require('lodash.merge');
const yesno = require('yesno');
const {Command} = require('commander');
const program = new Command();
program.version('0.0.1');
program.option('-y, --yes', false);
program.option('-t, --template [template]');
program.parse(process.argv);
const options = program.opts();

const templateLib = (template) => `@animoca/ethereum-${template}-core`;

const usage = () => {
  console.log('usage: hardhat-bootstrap [--yes] --template <contracts|migrations|standalone|...>');
  process.exit(1);
};

if (!['contracts', 'migrations', 'standalone'].find((t) => t === options.template)) {
  usage();
}

if (!options.yes) {
  bootstrap();
} else {
  yesno({
    question:
      'Local files will be overwritten. If you are not using version control, make sure to backup your project files. Do you want to continue?',
  }).then((proceed) => {
    if (proceed) {
      bootstrap();
    }
  });
}

function bootstrap() {
  const templates = options.template === 'standalone' ? ['contracts', 'migrations'] : [options.template];

  try {
    for (const template of templates) {
      if (!fse.pathExistsSync(path.join(process.env.PWD, 'node_modules', templateLib(template)))) {
        console.log(`please run 'yarn add -D ${templates.map((t) => templateLib(t)).join(' ')}' to initialise a ${templates.join('/')} project`);
        process.exit(1);
      }
    }

    const packagePath = path.join(process.env.PWD, 'package.json');
    const package = JSON.parse(fse.readFileSync(packagePath));
    const url = package.repository ? package.repository.url : '';
    console.log(`initialising ethereum-${templates.join('/')} project ${package.name} @ ${package.version} (git url:'${url}')`);

    const projectBasePath = path.join('.', 'node_modules', '@animoca/ethereum-hardhat-bootstrap', 'project-base');
    fse.copySync(projectBasePath, process.env.PWD, {
      errorOnExist: false,
      overwrite: true,
      filter: function (name) {
        return name !== path.join(projectBasePath, 'package.json');
      },
    });
    fse.moveSync(path.join('.', 'gitignore'), path.join('.', '.gitignore'), {overwrite: true});
    const projectBasePackage = JSON.parse(fse.readFileSync(path.join(projectBasePath, 'package.json')));
    merge(package, projectBasePackage);
    package.devDependencies['@animoca/ethereum-hardhat-bootstrap'] = `^${require('../package.json').version}`;
    package.peerDependencies['@animoca/ethereum-hardhat-bootstrap'] = `^${require('../package.json').version}`;

    for (const template of templates) {
      console.log(`applying template ${template}`);
      package.keywords.push(template);
      const libName = templateLib(template);
      const libPath = path.join('.', 'node_modules', libName);
      const libPackage = JSON.parse(fse.readFileSync(path.join(libPath, 'package.json')));
      console.log(`using lib ${libName} @ ${libPackage.version}`);

      const projectTemplate = path.join(libPath, 'project-template');
      fse.copySync(projectTemplate, process.env.PWD, {
        errorOnExist: false,
        overwrite: true,
        filter: function (name) {
          return name !== path.join(projectTemplate, 'package.json');
        },
      });
      const projectTemplatePackage = JSON.parse(fse.readFileSync(path.join(projectTemplate, 'package.json')));
      merge(package, projectTemplatePackage);
      package.devDependencies[libName] = `=${libPackage.version}`;
      package.peerDependencies[libName] = `=${libPackage.version}`;
    }

    for (const script of ['prepack', 'run-all', 'clean']) {
      package.scripts[script] = `run-s ${templates.map((t) => script + ':' + t).join(' ')}`;
    }

    fse.writeFileSync('hardhat.templates.js', `module.exports = [${templates.map((t) => "'" + templateLib(t) + "'").join(', ')}];\n`, {
      overwrite: true,
      errorOnExist: false,
    });
    fse.writeFileSync(packagePath, JSON.stringify(package, null, 2), {overwrite: true, errorOnExist: false});
    require('../scripts/sort-package-json');
  } catch (e) {
    console.log(e);
  }
}
