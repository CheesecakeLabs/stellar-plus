# Certificate of Deposit Client

The `CertificateOfDepositClient` class extends `ContractEngine` to interact with a specific smart contract implementation for a Certificate of Deposit on the Stellar network. It implements methods for managing deposits, withdrawals, and fetching contract-related data.

{% hint style="info" %}
Refer to the [e2e-certificate-of-deposit-demo.md](../../tutorials/e2e-certificate-of-deposit-demo.md "mention") for a detailed use case and code example including this client. A fully integrated version of this contract implementation with UI can also be seen at the [Custodial Asset Sandbox](https://stellar.cheesecakelabs.com/).
{% endhint %}

## **Constructor**

* **Parameters**:
  * `contractId`: Contract ID of the deployed contract.
  * `network`: Network configuration.
  * `rpcHandler`: RPC handler for interactions.
* **Purpose**: Initializes the client with the necessary configurations to interact with the Certificate of Deposit contract.

## **Methods**

### deposit

* **Purpose**: Deposits assets into the contract.
* **Parameters**:
  * `address`: Account address making the deposit.
  * `amount`: Deposit amount.
  * `signers`: Authorizing signers.
  * `header`: Transaction header.
  * `feeBump`: Optional fee bump.

### withdraw

* **Purpose**: Withdraws assets from the contract.
* **Parameters**:
  * `address`: Account address withdrawing assets.
  * `acceptPrematureWithdraw`: Flag for premature withdrawal acceptance.
  * `signers`: Authorizing signers.
  * `header`: Transaction header.
  * `feeBump`: Optional fee bump.

### getEstimatedYield

* **Purpose**: Fetches estimated yield.
* **Parameters**:
  * `address`: Account address.
  * `header`: Transaction header.

### getPosition

* **Purpose**: Retrieves current position.
* **Parameters**:
  * `address`: Account address.
  * `header`: Transaction header.

### getEstimatedPrematureWithdraw

* **Purpose**: Estimates premature withdrawal amount.
* **Parameters**:
  * `address`: Account address.
  * `header`: Transaction header.

### getTimeLeft

* **Purpose**: Determines time left for penalty-free withdrawal.
* **Parameters**:
  * `address`: Account address.
  * `header`: Transaction header.

### initialize

* **Purpose**: Initializes contract state.
* **Parameters**:
  * `admin`, `asset`, `term`, `compoundStep`, `yieldRate`, `minDeposit`, `penaltyRate`, `allowancePeriod`: Contract parameters.
  * `signers`: Authorizing signers.
  * `header`: Transaction header.
  * `feeBump`: Optional fee bump.

{% hint style="info" %}
The initialization parameters affect the CD rules as the following:



* **Admin**\
  Defines which account can manage the CD contract and also receives and provides the funds from/to the users.
* **Asset** \
  The contract id of the Stellar Asset Contract for the wrapped Classic Asset this CD interacts with.
* **Term** (seconds)\
  For how long this CD will accrue interest to a open deposit position.
* **Compound Step** (seconds)\
  How often will the interest be paid/compound. If set to '0', a different yield rate calculation is used and the interest rate will be applied linearly until the end of the term.
* **Yield Rate** (1 unit = 0.01%)\
  How much interest will be paid out. For compounding interest, this means at every compound interval, while the linear rate will reach this rate at the end of the term.
* **Minimum Deposit**\
  Minimum amount accepted for a deposit.
* **Penalty Rate** (1 unit = 0.01%)\
  If a user accepts the early withdraw, before the term is finished, this penalty rate will be applied to the earned interest. \
  \
  E.g.  _A 200 units position (100 deposit + 100 earned yield) withdrawing early with a penalty rate of 50% will receive 150 units(100 deposit + 50 earned yield)_&#x20;

$$
Withdrawn Amount=Deposit+(Yield−Penalty Rate×Yield)
$$

* **Allowance Period** (Expiration ledger number)\
  Until which ledger will the allowance for the contract to access the admin funds be valid.
{% endhint %}



This class provides a structured and convenient way to interact with the Certificate of Deposit contract on the Stellar network, encapsulating complex contract interactions into simpler method calls.
