# Validation Cloud RPC Handler

The `ValidationCloudRpcHandler` serves as an alternative for interacting with Stellar's Soroban smart contracts through a third-party RPC service provided by [Validation Cloud](https://www.validationcloud.io/). It is a specialized adapter designed to facilitate interaction with Stellar's Soroban smart contracts.\
\
This is achieved through the use of a third-party Remote Procedure Call (RPC) service offered by Validation Cloud. This alternative method of interaction provides developers with the option to leverage dedicated infrastructure and advanced features for executing and managing smart contracts on the Stellar network.

In scenarios where no specific handler is provided, Stellar Plus core engines default to directly connecting to RPC url present in the networkConfig parameters through the usage of the [Default RPC Handler](default-rpc-handler.md).



### Advantages of Using ValidationCloudRpcHandler

Opting for `ValidationCloudRpcHandler` presents several benefits, especially for developers seeking a streamlined and enhanced interaction with Soroban smart contracts:

* **Dedicated Infrastructure**: Access to a specialized infrastructure tailored for high-load Soroban smart contract operations, providing enhanced performance stability and uptime.
* **Resource Consumption Monitoring**: Includes tools for detailed observation of resource usage, facilitating the optimization of smart contract execution and resource allocation.
* **Simplified Integration Process**: Streamlines the connection to Soroban smart contracts through a straightforward API, reducing setup complexity and technical overhead.

### Getting Started

To begin utilizing the `ValidationCloudRpcHandler` Soroban smart contracts, developers need to follow these steps:

1. **Create an Account**: Sign up for an account with [Validation Cloud ](https://www.validationcloud.io/)to access their services.
2. **Opt for the Free Tier**: Choose the free tier offering to explore the services without immediate investment.
3. **Generate an API Key**: Obtain an API key specifically for the Soroban API. This key will authenticate and authorize your interactions with the smart contracts through Validation Cloud.

### Usage

The `ValidationCloudRpcHandler` integrates seamlessly into the Soroban Transaction pipeline, allowing developers to easily switch between the default direct connection and Validation Cloud's service API. This is particularly useful for applications requiring enhanced performance, reliability, and feature set beyond what the Stellar network offers by default.

#### Example Code Snippet

```typescript
const vcRpcHandler = new StellarPlus.RPC.ValidationCloudRpcHandler(
  network,
  '<YOUR API KEY>'
)

const codClient = new StellarPlus.Contracts.CertificateOfDeposit({
  networkConfig,
  contractParameters: {
    wasm: wasmBuffer,
  },
  options: {
    sorobanTransactionPipeline: {
      customRpcHandler: vcRpcHandler,
    },
  },
})
```

For a complete example using the Validation Cloud RPC integration, refer to the [E2E Certificate of Deposit demo tutorial](../../tutorials/e2e-certificate-of-deposit-demo.md).&#x20;

### Reference

For a comprehensive understanding of RPC in the Soroban context, including technical details and usage examples, refer to the official Soroban documentation: [Soroban RPC Reference](https://soroban.stellar.org/docs/reference/rpc).
