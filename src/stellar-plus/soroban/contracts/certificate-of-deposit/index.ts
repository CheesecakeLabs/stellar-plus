import { Address, ContractSpec } from 'soroban-client'

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

  constructor(
    contractId: string,
    network: Network,

    rpcHandler?: RpcHandler
  ) {
    super(network, spec as ContractSpec, contractId, rpcHandler)
    this.methods = Methods
  }

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

  public async getEstimatedYield(args: GetEstimatedYieldArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getEstimatedYield,
      methodArgs: { address },

      header: args.header,
    })) as i128

    return Number(result)
  }

  public async getPosition(args: GetPositionArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getPosition,
      methodArgs: { address },
      header: args.header,
    })) as i128

    return Number(result)
  }

  public async getEstimatedPrematureWithdraw(args: GetEstimatedPrematureWithdrawArgs): Promise<number> {
    const address = new Address(args.address)

    const result: i128 = (await this.readFromContract({
      method: this.methods.getEstimatedPrematureWithdraw,
      methodArgs: { address },

      header: args.header,
    })) as i128

    return Number(result)
  }

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
