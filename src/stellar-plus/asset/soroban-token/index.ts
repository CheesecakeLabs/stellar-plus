import { Address } from '@stellar/stellar-sdk'

import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { i128, u32 } from 'stellar-plus/types'

import { SorobanTokenHandlerConstructorArgs } from './types'
import { TokenInterface } from '../types'
import { methods } from './constants'

export class SorobanTokenHandler extends ContractEngine implements TokenInterface {
  constructor(args: SorobanTokenHandlerConstructorArgs) {
    super(args)
  }

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

  public async approve(
    args: { from: string; spender: string; amount: i128; live_until_ledger: u32 } & TransactionInvocation
  ): Promise<void> {
    return (await this.invokeContract({
      method: methods.approve,
      methodArgs: {
        from: new Address(args.from),
        spender: new Address(args.spender),
        amount: args.amount,
        live_until_ledger: args.live_until_ledger,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    })) as void
  }

  public async balance(args: { id: string } & SorobanSimulationInvocation): Promise<i128> {
    return (await this.readFromContract({
      method: methods.balance,
      methodArgs: {
        id: new Address(args.id),
      },
      header: args.header,
    })) as i128
  }

  public async spendable_balance(args: { id: string } & SorobanSimulationInvocation): Promise<i128> {
    return (await this.readFromContract({
      method: methods.spendable_balance,
      methodArgs: {
        id: new Address(args.id),
      },
      header: args.header,
    })) as i128
  }

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

  public async transfer_from(
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
}
