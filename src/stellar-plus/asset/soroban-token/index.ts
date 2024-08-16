import { Spec } from '@stellar/stellar-sdk/contract'

import { spec as defaultSpec, methods } from 'stellar-plus/asset/soroban-token/constants'
import { SorobanTokenHandlerConstructorArgs, SorobanTokenInterface } from 'stellar-plus/asset/soroban-token/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { SorobanTransactionPipelineOutputSimple } from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { i128, u32 } from 'stellar-plus/types'

export class SorobanTokenHandler extends ContractEngine implements SorobanTokenInterface {
  public type: AssetTypes = AssetTypes.token

  /**
   *
   * @args args
   * @param {NetworkConfig} args.networkConfig - Network to connect to
   * @param args.contractParameters - Contract parameters
   * @param {Spec=} args.contractParameters.spec - Contract specification
   * @param {string=} args.contractParameters.contractId - Contract ID
   * @param {Buffer=} args.wasm - Contract WASM file as Buffer
   * @param {string=} args.wasmHash - Contract WASM hash identifier
   * @param {Options=} args.options - Contract options
   * @param {SorobanTransactionPipelineOptions=} args.options.sorobanTransactionPipeline - Soroban transaction pipeline options. Allows for customizing how transaction pipeline will be executed for this contract.
   *
   * @description Create a new SorobanTokenHandler instance to interact with a Soroban Token contract.
   * This class is a subclass of ContractEngine and implements the Soroban token interface.
   * The contract spec is set to the default Soroban Token spec. When initializing the contract, the spec can be overridden with a custom spec.
   * The contract ID, WASM file, and WASM hash can be provided to initialize the contract with the given parameters. At least one of these parameters must be provided.
   *
   */
  constructor(args: SorobanTokenHandlerConstructorArgs) {
    super({
      ...args,
      contractParameters: {
        ...args.contractParameters,
        spec: args.contractParameters?.spec || (defaultSpec as Spec),
      },
    })
  }

  /**
   *
   * @args args
   * @param {string} args.admin - Admin account public key
   * @param {u32} args.decimal - Number of decimals
   * @param {string} args.name - Token name
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Initialize the contract instance with the given parameters.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async initialize(
    args: { admin: string; decimal: u32; name: string; symbol: string } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.initialize,
      methodArgs: {
        admin: args.admin,
        decimal: args.decimal,
        name: args.name,
        symbol: args.symbol,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  //==========================================
  // Admin Methods - Require Admin / Issuer
  //==========================================

  /**
   *
   * @args args
   * @param {string} args.id - Account public key
   * @param {string} args.new_admin - New admin account public key
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Set a new admin account for the contract.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   *
   * @requires {args.id} to be the current admin account
   */
  public async setAdmin(
    args: { id: string; new_admin: string } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.set_admin,
      methodArgs: {
        id: args.id,
        new_admin: args.new_admin,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the admin account public key.
   *
   * @returns {Promise<string>}
   *
   */
  public async admin(args: TransactionInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.admin,
      methodArgs: {},
      header: args.header,
    })) as string
  }

  /**
   *
   * @args args
   * @param {string} args.id - Account public key
   * @param {boolean} args.authorize - Whether to authorize or deauthorize the account
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Authorize or deauthorize an account to interact with the contract.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   *
   * @requires - Authorization from the admin account
   */
  public async setAuthorized(
    args: { id: string; authorize: boolean } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.set_authorized,
      methodArgs: {
        id: args.id,
        authorize: args.authorize,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.to - Account public key
   * @param {i128} args.amount - Amount to mint
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Mint tokens to an account.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   *
   * @requires - Authorization from the admin account
   */
  public async mint(
    args: { to: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.mint,
      methodArgs: {
        to: args.to,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.from - Account public key
   * @param {i128} args.amount - Amount to clawback
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Clawback tokens from an account.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   *
   * @requires - Authorization from the admin account
   */
  public async clawback(
    args: { from: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.clawback,
      methodArgs: {
        from: args.from,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  //==========================================
  // User Methods - Do not require Admin / Issuer
  //==========================================
  //
  //

  /**
   *
   * @args args
   * @param {string} args.from - Account public key
   * @param {string} args.spender - Spender account public key
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Get the amount of tokens that the spender is allowed to spend on behalf of the account.
   *
   * @returns {Promise<i128>}
   */
  public async allowance(args: { from: string; spender: string } & SorobanSimulationInvocation): Promise<i128> {
    return (await this.readFromContract({
      method: methods.allowance,
      methodArgs: {
        from: args.from,
        spender: args.spender,
      },
      header: args.header,
    })) as i128
  }

  /**
   *
   * @args args
   * @param {string} args.from - Account public key
   * @param {string} args.spender - Spender account public key
   * @param {i128} args.amount - Amount to approve
   * @param {u32} args.expiration_ledger - Ledger number until the approval is valid
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Approve a spender to spend tokens on behalf of the account.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async approve(
    args: { from: string; spender: string; amount: i128; expiration_ledger: u32 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.approve,
      methodArgs: {
        from: args.from,
        spender: args.spender,
        amount: args.amount,
        expiration_ledger: args.expiration_ledger,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.id - Account public key
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the balance of the account.
   *
   * @returns {Promise<i128>}
   */
  public async balance(args: { id: string } & SorobanSimulationInvocation): Promise<i128> {
    return (await this.readFromContract({
      method: methods.balance,
      methodArgs: {
        id: args.id,
      },
      header: args.header,
    })) as i128
  }

  /**
   *
   * @args args
   * @param {string} args.id - Account public key
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the spendable balance of the account.
   *
   * @returns {Promise<i128>}
   */
  public async spendableBalance(args: { id: string } & SorobanSimulationInvocation): Promise<i128> {
    return (await this.readFromContract({
      method: methods.spendable_balance,
      methodArgs: {
        id: args.id,
      },
      header: args.header,
    })) as i128
  }

  /**
   *
   * @args args
   * @param {string} args.from - Sender public key
   * @param {string} args.to - Recipient account public key
   * @param {i128} args.amount - Amount to transfer
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Transfer tokens from the sender to the recipient.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async transfer(
    args: { from: string; to: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.transfer,
      methodArgs: {
        from: args.from,
        to: args.to,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.spender - Spender account public key
   * @param {string} args.from - Sender public key
   * @param {string} args.to - Recipient account public key
   * @param {i128} args.amount - Amount to transfer
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Transfer tokens from the sender to the recipient on behalf of the spender.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async transferFrom(
    args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.transfer_from,
      methodArgs: {
        spender: args.spender,
        from: args.from,
        to: args.to,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.from - Account public key
   * @param {i128} args.amount - Amount to burn
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Burn tokens from an account.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async burn(
    args: { from: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.burn,
      methodArgs: {
        from: args.from,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   * @param {string} args.spender - Spender account public key
   * @param {string} args.from - Account public key
   * @param {i128} args.amount - Amount to burn
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   * @param {AccountHandler[]} args.signers - Transaction signers
   * @param {FeeBumpHeader=} args.feeBump - Fee bump configuration
   *
   * @description Burn tokens from an account on behalf of the spender.
   *
   * @returns {Promise<SorobanTransactionPipelineOutputSimple>}
   */
  public async burnFrom(
    args: { spender: string; from: string; amount: i128 } & TransactionInvocation
  ): Promise<SorobanTransactionPipelineOutputSimple> {
    return (await this.invokeContract({
      method: methods.burn_from,
      methodArgs: {
        spender: args.spender,
        from: args.from,
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as SorobanTransactionPipelineOutputSimple
  }

  /**
   *
   * @args args
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the number of decimals.
   *
   * @returns {Promise<u32>}
   */
  public async decimals(args: SorobanSimulationInvocation): Promise<u32> {
    return (await this.readFromContract({
      method: methods.decimals,
      methodArgs: {},
      header: args.header,
    })) as u32
  }

  /**
   *
   * @args args
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the token name.
   *
   * @returns {Promise<string>}
   */
  public async name(args: SorobanSimulationInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.name,
      methodArgs: {},
      header: args.header,
    })) as string
  }

  /**
   *
   * @args args
   *
   * @param {EnvelopeHeader} args.header - Transaction envelope header
   *
   * @description Get the token symbol.
   *
   * @returns {Promise<string>}
   */
  public async symbol(args: SorobanSimulationInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.symbol,
      methodArgs: {},
      header: args.header,
    })) as string
  }
}
