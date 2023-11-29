
# Stellar-Plus

stellar-plus is an all-in-one Javascript library for building and interacting with the Stellar network. It bundles the main resources from the community into an easy-to-use set of tools and capabilities.

It provides:

* **Account**: Handlers to create, load, and interact with stellar accounts, managing signatures and automatically integrating with Freighter Wallet for web applications.
* **Asset**: Classic token handlers follow the standard token interface for triggering different asset capabilities as well as a suite of additional features for asset management and usage.
* **Core**: Key engines for managing the different pipelines for building, submitting, and processing both Classic and Soroban transactions. These engines can be extended into your own tooling or used out-of-the-box with minimal configuration.
* **Contracts**: Default contract client implementations for selected dApp use cases.
* **RPC**: Handlers for connecting and using different RPC solutions, including a ready-to-use integration with Validation Cloud's RPC API.

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
var StellarPlus = require("stellar-plus");
```

or

```js
import { StellarPlus } from "stellar-plus";
```

## Documentation

For the full documentation, refer to our [Gitbook Documentation](https://cheesecake-labs.gitbook.io/stellar-plus/).
