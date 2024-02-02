# Validation Cloud RPC Handler

The `ValidationCloudRpcHandler` serves as an alternative for interacting with Stellar's Soroban smart contracts through a third-party RPC service provided by [Validation Cloud](https://www.validationcloud.io/).&#x20;

By default, when no handler is provided, the core engines will use the [default-rpc-handler.md](default-rpc-handler.md "mention") and connect to the network's RPC url. With this class, developers can switch to using Validation Cloud's infrastructure. This is particularly advantageous for those seeking a ready-to-use integration with dedicated infrastructure and advanced features.&#x20;

To use this service, developers simply need to create an account with Validation Cloud, opt for their free tier, and generate an API key for their Soroban API, streamlining the process of managing and executing smart contracts on Stellar.



## Usage

When using any of the tools that extend the Soroban Transaction pipeline&#x20;
