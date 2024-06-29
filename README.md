# Stellar-Plus

<p align="center">
  <a href="https://badge.fury.io/js/stellar-plus"><img src="https://badge.fury.io/js/stellar-plus.svg" alt="npm version" height="18"></a>
  <a href="https://www.npmjs.com/package/stellar-sdk">
    <img alt="Weekly Downloads" src="https://img.shields.io/npm/dw/stellar-plus" />
  </a>
</p>

<figure>
  <picture>
    <source srcset="docs/.gitbook/assets/logo2.png" media="(prefers-color-scheme: dark)">
    <img src="docs/.gitbook/assets/logo2.png" alt="" width="375" style="display: block; margin: 0 auto;">
  </picture>
  <figcaption></figcaption>
</figure>

Stellar-plus is a robust JavaScript library built by [Cheesecake Labs](./) and designed to streamline the development of applications on the Stellar network. By integrating the Stellar community's primary resources, Stellar-plus offers developers an efficient, easy-to-use toolkit. This library simplifies the complexities of Stellar network interaction, making it accessible for both novice and experienced developers alike.

## Features

- **Account Handling**: Seamless management of signatures throughout the transaction lifecycle.
- **Asset Management**: Full suite of asset management capabilities, including standard and custom assets.
- **Core Engines**: Essential for building, submitting, signing, and processing transactions on the Stellar network.
- **Contract Development**: Simplifies the development of decentralized applications (dApps).
- **RPC Integration**: Connects to and leverages various RPC services for a broader range of applications.
- **Plugins and Extensions**: Supports plugins and tools to enhance functionality and tailor the library to specific needs.

## Quick start

Using npm to include js-stellar-plus in your own project:

```shell
npm install --save stellar-plus
```

## Install

Install it using npm:

```shell
npm install --save stellar-plus
```

require/import it in your JavaScript:

```js
var StellarPlus = require('stellar-plus')
```

or

```js
import { StellarPlus } from 'stellar-plus'
```

## Documentation

For the full documentation, refer to our [Gitbook Documentation](https://cheesecake-labs.gitbook.io/stellar-plus/?utm_source=github&utm_medium=codigo-fonte).

- [Code of Conduct](https://github.com/cheesecakelabs/stellar-plus/blob/main/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](https://github.com/cheesecakelabs/stellar-plus/blob/main/CONTRIBUTING.md)
- [MIT License](https://github.com/cheesecakelabs/stellar-plus/blob/main/LICENSE)

## Testing

Quality being a core pillar of Stellar Plus, to ensure a high level of confiability we aim at keep a high level of test coverage throughout the whole library. All tests written currently fall within one of the following categories:

- Unit tests for specific localized behaviour
- Integration tests to cover whole features and ledger integration

To run all tests locally, one can run the following command:

```bash
npm run test
```

This will trigger both the suit of unit and integrations tests, outputting their combined coverage to the directory `./src/coverage/all`. This is the metric used as reference when merging implementation to the main branch and releasing new versions.

### Unit Tests

As the unit tests aim at enforcing locallized behaviour, they are implemented within their reference features directory and can be identified by the file name pattern `*.unit.test.ts`.

To execute only the unit tests locally, one can run the command:

```bash
npm run test-unit
```

This will trigger the suit of unit tests only, outputting its coverage to the directory `./src/coverage/unit`.

### Integration Tests

As the integration tests aim at guaranteeing a great level of confidence about whole feature's behaviour, by default all integration tests verify complete workable use cases.

Testing functionalities against a DLT poses a challenge as public testnets can introduce external interference or be out of reach at specific time. Therefore, all integration tests in Stellar Plus, leverage a `Stellar Test Ledger` feature, originally developed by Cheesecakelabs for the open source project [Hyperledger Cacti](https://github.com/hyperledger/cacti).

The Stellar Test Ledger can be found within the `@hyperledger/cactus-test-tooling` package or directly available through Stellar Plus as well. It pulls up and manages the Stellar Quickstart Docker Image to start a pristine version of the Stellar ledger and all its services without any external interference.

Each integration use case is tested against a pristine ledger with no existing history to ensure maximum isolation of the feature while still verifying agains a real production-like environment.

To execute only the integration tests locally, one can run the command:

```bash
npm run test-integration
```

This will trigger the suit of integration tests only, outputting its coverage to the directory `./src/coverage/integration`.
