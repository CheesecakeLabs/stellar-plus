import { Address, ContractSpec } from '@stellar/stellar-sdk'

import { ContractEngine } from '@core/contract-engine'
import { RpcHandler } from '@rpc/types'
import { Network, i128, u64 } from '@stellar-plus/types'

import { Methods, spec } from './constants'
import {
  CertificateOfDepositContract,
  DepositArgs,
  GetEstimatedPrematureWithdrawArgs,
  GetEstimatedYieldArgs,
  GetPositionArgs,
  GetTimeLeftArgs,
  WithdrawArgs,
} from './types'

export class CertificateOfDepositClient extends ContractEngine implements CertificateOfDepositContract {
  private methods: typeof Methods

  /**
   *
   * @param {string} contractId - The contract ID of the deployed Certificate of Deposit to use.
   * @param {Network} network - The network to use.
   * @param {RpcHandler} rpcHandler - The RPC handler to use.
   *
   * @description - The certificate of deposit client is used for interacting with the certificate of deposit contract.
   *
   */
  constructor(
    contractId: string,
    network: Network,

    rpcHandler?: RpcHandler
  ) {
    super(network, spec as ContractSpec, contractId, rpcHandler)
    this.methods = Methods
  }

  /**
   * @args {DepositArgs} args - The arguments to pass to the deposit method.
   * @param {string} args.address - The address to deposit from.
   * @param {number} args.amount - The amount to deposit.
   * @param {string[]} args.signers - The signers to authorize this transaction.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @param {SorobanFeeBumpTransaction=} args.feeBump - The fee bump to use for this transaction. This is optional.
   *
   * @returns {void}
   * @description - Performs a deposit to the certificate of deposit contract, opening a position.
   *
   *
   */
  public async deposit(args: DepositArgs): Promise<void> {
    const amount = args.amount as i128
    const address = new Address(args.address)

    await this.invokeContract({
      method: this.methods.deposit,
      methodArgs: { amount, address },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })
  }

  /**
   * @args {WithdrawArgs} args - The arguments to pass to the withdraw method.
   * @param {string} args.address - The address of the account withdrawing.
   * @param {boolean} args.acceptPrematureWithdraw - Whether to accept premature withdraw or not. When true, the withdraw will be accepted even if the time left is greater than 0 and the contract penalty will be applied to the amount withdrawn. When false, the withdraw will only be accepted if the time left is 0.
   * @param {string[]} args.signers - The signers to authorize this transaction.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @param {SorobanFeeBumpTransaction=} args.feeBump - The fee bump to use for this transaction. This is optional.
   *
   * @returns {void}
   * @description - Performs a withdraw from the certificate of deposit contract, closing a position.
   *
   *
   */
  public async withdraw(args: WithdrawArgs): Promise<void> {
    const address = new Address(args.address)
    const accept_premature_withdraw = args.acceptPrematureWithdraw as boolean

    await this.invokeContract({
      method: this.methods.withdraw,
      methodArgs: { address, accept_premature_withdraw },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })
  }

  /**
   * @args {GetEstimatedYieldArgs} args - The arguments to pass to the getEstimatedYield method.
   * @param {string} args.address - The address of the account to get the estimated yield for.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @returns {number} The estimated yield for the account.
   * @description - Gets the current estimated yield accrued for the account's position so far.
   */
  public async getEstimatedYield(args: GetEstimatedYieldArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getEstimatedYield,
      methodArgs: { address },

      header: args.header,
    })) as i128

    return Number(result)
  }

  /**
   * @args {GetPositionArgs} args - The arguments to pass to the getPosition method.
   * @param {string} args.address - The address of the account to get the position for.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @returns {number} The position for the account. Includes the original deposit plus the accrued yield.
   * @description - Gets the current open position for the account.
   */
  public async getPosition(args: GetPositionArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getPosition,
      methodArgs: { address },
      header: args.header,
    })) as i128

    return Number(result)
  }

  /**
   * @args {GetEstimatedPrematureWithdrawArgs} args - The arguments to pass to the getEstimatedPrematureWithdraw method.
   * @param {string} args.address - The address of the account to get the estimated premature withdraw for.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @returns {number} The estimated premature withdraw for the account.
   * @description - Gets the current estimated premature withdraw for the account. This is the amount that will be received if the account withdraws prematurely, with the penalty applied.
   */
  public async getEstimatedPrematureWithdraw(args: GetEstimatedPrematureWithdrawArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getEstimatedPrematureWithdraw,
      methodArgs: { address },

      header: args.header,
    })) as i128

    return Number(result)
  }

  /**
   * @args {GetTimeLeftArgs} args - The arguments to pass to the getTimeLeft method.
   * @param {string} args.address - The address of the account to get the time left for.
   * @param {EnvelopeHeader} args.header - The header to use for this transaction.
   * @returns {number} The time left for the account's position to reach the term.
   * @description - Gets the current time left for the account. This is the time left until the account can withdraw without penalty.
   */
  public async getTimeLeft(args: GetTimeLeftArgs): Promise<number> {
    const address = new Address(args.address)

    const result: u64 = (await this.readFromContract({
      method: this.methods.getTimeLeft,
      methodArgs: { address },

      header: args.header,
    })) as u64

    return Number(result)
  }

  // public async extendContractValidity(): Promise<void> {
  //   const result = await this.invokeContract({
  //     method: this.methods.extendContractValidity,
  //     methodArgs: {},
  //   });
  // }
}
