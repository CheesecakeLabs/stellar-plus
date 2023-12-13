import { Address, ContractSpec } from '@stellar/stellar-sdk'

import { ContractEngine } from '@core/contract-engine'
import { i128, u32, u64 } from '@stellar-plus/types'

import { Methods, spec } from './constants'
import *  as types from './types'
import { TransactionInvocation } from '@core/types'

export class StandardReferenceClient extends ContractEngine implements types.StandardReferenceContract {
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
  constructor(args: types.ContractConstructorArgs) {
    super({
      network: args.network,
      spec: spec as ContractSpec,
      contractId: args.contractId,
      rpcHandler: args.rpcHandler,
      wasm: args.wasm,
      wasmHash: args.wasmHash,
    })
    this.methods = Methods
  }

  public async init(args: types.InitArgs): Promise<void> {
    const { admin_addr } = args;

    await this.invokeContract({
      method: this.methods.init,
      methodArgs: { admin_addr: new Address(admin_addr) },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async upgrade(args: types.UpgradeArgs): Promise<void> {
    const { new_wasm_hash } = args;

    await this.invokeContract({
      method: this.methods.upgrade,
      methodArgs: { new_wasm_hash },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async version(args: TransactionInvocation): Promise<unknown> {
    const result = await this.invokeContract({
      method: this.methods.version,
      methodArgs: {},
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });

    return result as u32

  }

  public async address(args: TransactionInvocation): Promise<unknown> {
    const result = await this.invokeContract({
      method: this.methods.address,
      methodArgs: {},
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });

    return result as Address
  }
  public async current_admin(args: TransactionInvocation): Promise<unknown> {
    return await this.invokeContract({
      method: this.methods.current_admin,
      methodArgs: {},
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });

  }

  public async transfer_admin(args: types.TransferAdminArgs): Promise<void> {
    const { new_admin } = args;

    await this.invokeContract({
      method: this.methods.transfer_admin,
      methodArgs: { new_admin: new Address(new_admin) },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async is_relayer(args: types.IsRelayerArgs): Promise<unknown> {
    const { address } = args;

    const result = await this.invokeContract({
      method: this.methods.is_relayer,
      methodArgs: { address: new Address(address) },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });

    return result as boolean

  }

  public async add_relayers(args: types.AddRelayersArgs): Promise<void> {
    const { addresses } = args;

    await this.invokeContract({
      method: this.methods.add_relayers,
      methodArgs: { addresses: addresses.map((addr) => new Address(addr)) },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async remove_relayers(args: types.RemoveRelayersArgs): Promise<void> {
    const { addresses } = args;

    await this.invokeContract({
      method: this.methods.remove_relayers,
      methodArgs: { addresses: addresses.map((addr) => new Address(addr)) },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async relay(args: types.RelayArgs): Promise<void> {
    const { from, symbol_rates, resolve_time, request_id } = args;

    await this.invokeContract({
      method: this.methods.relay,
      methodArgs: {
        from: new Address(from),
        symbol_rates,
        resolve_time,
        request_id,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async force_relay(args: types.ForceRelayArgs): Promise<void> {
    const { from, symbol_rates, resolve_time, request_id } = args;

    await this.invokeContract({
      method: this.methods.force_relay,
      methodArgs: {
        from: new Address(from),
        symbol_rates,
        resolve_time,
        request_id,
      },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async delist(args: types.DelistArgs): Promise<void> {
    const { from, symbols } = args;

    await this.invokeContract({
      method: this.methods.delist,
      methodArgs: { from: new Address(from), symbols },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async get_ref_data(args: types.GetRefDataArgs): Promise<void> {
    const { symbols } = args;

    await this.invokeContract({
      method: this.methods.get_ref_data,
      methodArgs: { symbols },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async get_reference_data(args: types.GetReferenceDataArgs): Promise<void> {
    const { symbol_pair } = args;

    await this.invokeContract({
      method: this.methods.get_reference_data,
      methodArgs: { symbol_pair },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

  public async bump_ledger_instance(args: types.BumpLedgerInstanceArgs): Promise<void> {
    const { low_expiration_watermark, high_expiration_watermark } = args;

    await this.invokeContract({
      method: this.methods.bump_ledger_instance,
      methodArgs: { low_expiration_watermark, high_expiration_watermark },
      signers: args.signers,
      header: args.header,
      feeBump: args.feeBump,
    });
  }

}
