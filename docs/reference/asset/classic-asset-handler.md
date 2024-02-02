# Classic Asset Handler

The `ClassicAssetHandler` class, inheriting from [Broken link](broken-reference "mention"), it follows the standard [Token Interface](https://soroban.stellar.org/docs/reference/interfaces/token-interface) to provide a unified experience to access the functionalities for interacting with and managing classic assets on the Stellar network. It offers a comprehensive set of methods for asset transactions, including minting, transferring, and setting trustlines.



### Constructor

* **Parameters**:
  * `code`: Asset code (e.g., "XLM").
  * `issuerPublicKey`: Public key of the asset issuer.
  * `network`: Network configuration.
  * `issuerAccount`: (Optional) Account handler for the issuer. Necessary to enable asset management functionalities like minting and approving a trustline.
  * `transactionSubmitter`: (Optional) Custom submitter initiating and sending transactions to the network.

