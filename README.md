# @animoca/ethereum-hardhat-bootstrap

## HardhHat project bootstrap

### Requirements

A node project must be initialised. If you are starting from zero, start by running the command `npm init`.
### Commands

HardHat contracts template
```bash
yarn add -D @animoca/ethereum-hardhat-bootstrap @animoca/ethereum-contracts-core
npx animoca-hardhat-bootstrap -t contracts
```

HardHat migrations template
```bash
yarn add -D @animoca/ethereum-hardhat-bootstrap @animoca/ethereum-migrations-core
npx animoca-hardhat-bootstrap -t migrations
```

HardHat standalone template
```bash
yarn add -D @animoca/ethereum-hardhat-bootstrap @animoca/ethereum-contracts-core @animoca/ethereum-migrations-core
npx animoca-hardhat-bootstrap -t standalone
```

## HardHat project scripts

Bootstrapped HardHat projects come with a set of provided scripts which structure the pipeline execution.
The full pipeline (with a few exceptions) can be invoked by running the `run-all` script as follow:

```bash
yarn run-all
```

## HardHat project configuration

Bootstrapped HardHat projects have a more advanced configuration files management:
- 
## Release

### Commands

```bash
# runs `npm publish --public` using .npmrc_private configuration
yarn release:private
```

```bash
# runs `npm publish --public` using .npmrc_public configuration
yarn release:public
```

### Suggested 
`.npmrc_private` `.npmrc_public`