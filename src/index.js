const fse = require('fs-extra');
const path = require('path');
const glob = require('glob');
const merge = require('lodash.merge');

function loadConfig(rootPath = process.env.PWD) {
  let templates = [];
  const templatesPath = path.join(rootPath, 'hardhat.templates.js');
  if (fse.existsSync(templatesPath)) {
    templates = require(templatesPath);
  }

  let config = {};

  for (const template of templates) {
    config = merge(config, require(template + '/hardhat.config.template'));
  }

  const configFiles = glob.sync(`${rootPath}/hardhat-config/*.config.js`);

  for (const configFile of configFiles) {
    config = merge(config, require(configFile));
  }

  const localConfigPath = path.join(rootPath, 'hardhat.config.local.js');
  if (fse.existsSync(localConfigPath)) {
    config = merge(config, require(localConfigPath));
  }

  return config;
}

const normalizePath = (config, userPath, defaultPath) => {
  if (userPath === undefined) {
    userPath = path.join(config.paths.root, defaultPath);
  } else {
    if (!path.isAbsolute(userPath)) {
      userPath = path.normalize(path.join(config.paths.root, userPath));
    }
  }
  return userPath;
};

module.exports = {
  loadConfig,
  normalizePath,
};
