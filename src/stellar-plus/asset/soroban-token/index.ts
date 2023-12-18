import { Address } from '@stellar/stellar-sdk'

import { methods, spec } from 'stellar-plus/asset/soroban-token/constants'
import { SorobanTokenHandlerConstructorArgs, SorobanTokenInterface } from 'stellar-plus/asset/soroban-token/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { i128, u32 } from 'stellar-plus/types'

export class SorobanTokenHandler extends ContractEngine implements SorobanTokenInterface {
  public type: AssetTypes = AssetTypes.token

  constructor(args: SorobanTokenHandlerConstructorArgs) {
    super({
      ...args,
      spec: args.spec || spec,
    })
  }

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

  public async admin(args: TransactionInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.admin,
      methodArgs: {},
      header: args.header,
    })) as string
  }

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

  public async spendableBalance(args: { id: string } & SorobanSimulationInvocation): Promise<i128> {
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

  public async decimals(args: SorobanSimulationInvocation): Promise<u32> {
    return (await this.readFromContract({
      method: methods.decimals,
      methodArgs: {},
      header: args.header,
    })) as u32
  }

  public async name(args: SorobanSimulationInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.name,
      methodArgs: {},
      header: args.header,
    })) as string
  }

  public async symbol(args: SorobanSimulationInvocation): Promise<string> {
    return (await this.readFromContract({
      method: methods.symbol,
      methodArgs: {},
      header: args.header,
    })) as string
  }
}
