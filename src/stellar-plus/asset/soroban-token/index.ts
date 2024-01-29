import { Address, ContractSpec } from '@stellar/stellar-sdk'

import { methods, spec } from 'stellar-plus/asset/soroban-token/constants'
import { SorobanTokenHandlerConstructorArgs, SorobanTokenInterface } from 'stellar-plus/asset/soroban-token/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { ContractEngineConstructorArgs } from 'stellar-plus/core/contract-engine/types'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { i128, u32 } from 'stellar-plus/types'

export class SorobanTokenHandler extends ContractEngine implements SorobanTokenInterface {
  public type: AssetTypes = AssetTypes.token

  /**
   *
   * @args args
   * @param {Network} args.network - Network to connect to
   * @param {ContractSpec=} args.spec - Contract specification object
   * @param {string=} args.contractId - Contract ID
   * @param {RpcHandler=} args.rpcHandler - RPC Handler
   * @param {Buffer=} args.wasm - Contract WASM file as Buffer
   * @param {string=} args.wasmHash - Contract WASM hash identifier
   *
   * @description Create a new SorobanTokenHandler instance to interact with a Soroban Token contract.
   * This class is a subclass of ContractEngine and implements the Soroban token interface.
   */
  constructor(args: SorobanTokenHandlerConstructorArgs) {
    super({
      ...args,
      contractParameters: {
        ...args.contractParameters,
        spec: args.contractParameters.spec || (spec as ContractSpec),
      },
    } as ContractEngineConstructorArgs)
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
   * @returns {Promise<void>}
   */
  public async initialize(
    args: { admin: string; decimal: u32; name: string; symbol: string } & TransactionInvocation
  ): Promise<void> {
    return (await this.invokeContract({
      method: methods.initialize,
      methodArgs: {
        admin: new Address(args.admin),
        decimal: args.decimal,
        name: args.name,
        symbol: args.symbol,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   *
   * @requires {args.id} to be the current admin account
   */
  public async setAdmin(args: { id: string; new_admin: string } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.set_admin,
      methodArgs: {
        id: new Address(args.id),
        new_admin: new Address(args.new_admin),
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   *
   * @requires - Authorization from the admin account
   */
  public async setAuthorized(args: { id: string; authorize: boolean } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.set_authorized,
      methodArgs: {
        id: new Address(args.id),
        authorize: args.authorize,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   *
   * @requires - Authorization from the admin account
   */
  public async mint(args: { to: string; amount: i128 } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.mint,
      methodArgs: {
        to: new Address(args.to),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   *
   * @requires - Authorization from the admin account
   */
  public async clawback(args: { from: string; amount: i128 } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.clawback,
      methodArgs: {
        from: new Address(args.from),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
        from: new Address(args.from),
        spender: new Address(args.spender),
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
   * @returns {Promise<void>}
   */
  public async approve(
    args: { from: string; spender: string; amount: i128; expiration_ledger: u32 } & TransactionInvocation
  ): Promise<void> {
    return (await this.invokeContract({
      method: methods.approve,
      methodArgs: {
        from: new Address(args.from),
        spender: new Address(args.spender),
        amount: args.amount,
        expiration_ledger: args.expiration_ledger,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
        id: new Address(args.id),
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
        id: new Address(args.id),
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
   * @returns {Promise<void>}
   */
  public async transfer(args: { from: string; to: string; amount: i128 } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.transfer,
      methodArgs: {
        from: new Address(args.from),
        to: new Address(args.to),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   */
  public async transferFrom(
    args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  ): Promise<void> {
    return (await this.invokeContract({
      method: methods.transfer_from,
      methodArgs: {
        spender: new Address(args.spender),
        from: new Address(args.from),
        to: new Address(args.to),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   */
  public async burn(args: { from: string; amount: i128 } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.burn,
      methodArgs: {
        from: new Address(args.from),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
   * @returns {Promise<void>}
   */
  public async burnFrom(args: { spender: string; from: string; amount: i128 } & TransactionInvocation): Promise<void> {
    return (await this.invokeContract({
      method: methods.burn_from,
      methodArgs: {
        spender: new Address(args.spender),
        from: new Address(args.from),
        amount: args.amount,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
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
