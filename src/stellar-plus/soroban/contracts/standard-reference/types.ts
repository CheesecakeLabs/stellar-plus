import { TransactionInvocation } from '@core/types'
import { RpcHandler } from '@rpc/types'
import { Network, u64, u32 } from '@stellar-plus/types'

export enum methods {
  get_position = 'get_position',
}

type Address = string;
type BytesN = string;
type Symbol = string;

export type StandardReferenceContract = {
  init(args: InitArgs): Promise<void>;
  upgrade(args: UpgradeArgs): Promise<void>;
  version(args: TransactionInvocation): Promise<unknown>;
  address(args: TransactionInvocation): Promise<unknown>;
  current_admin(args: TransactionInvocation): Promise<unknown>;
  transfer_admin(args: TransferAdminArgs): Promise<void>;
  is_relayer(args: IsRelayerArgs): Promise<unknown>;
  add_relayers(args: AddRelayersArgs): Promise<void>;
  remove_relayers(args: RemoveRelayersArgs): Promise<void>;
  relay(args: RelayArgs): Promise<void>;
  force_relay(args: ForceRelayArgs): Promise<void>;
  delist(args: DelistArgs): Promise<void>;
  get_ref_data(args: GetRefDataArgs): Promise<void>;
  get_reference_data(args: GetReferenceDataArgs): Promise<void>;
  bump_ledger_instance(args: BumpLedgerInstanceArgs): Promise<void>;
}

export type InitArgs = TransactionInvocation & {
  admin_addr: Address;
};

export type UpgradeArgs = TransactionInvocation & {
  new_wasm_hash: BytesN;
};

export type TransferAdminArgs = TransactionInvocation & {
  new_admin: Address;
};

export type IsRelayerArgs = TransactionInvocation & {
  address: Address;
};

export type AddRelayersArgs = TransactionInvocation & {
  addresses: Address[];
};

export type RemoveRelayersArgs = TransactionInvocation & {
  addresses: Address[];
};

export type RelayArgs = TransactionInvocation & {
  from: Address;
  symbol_rates: [Symbol, u64][];
  resolve_time: u64;
  request_id: u64;
};

export type ForceRelayArgs = TransactionInvocation & {
  from: Address;
  symbol_rates: [Symbol, u64][];
  resolve_time: u64;
  request_id: u64;
};

export type DelistArgs = TransactionInvocation & {
  from: Address;
  symbols: Symbol[];
};

export type GetRefDataArgs = TransactionInvocation & {
  symbols: Symbol[];
};

export type GetReferenceDataArgs = TransactionInvocation & {
  symbol_pair: [Symbol, Symbol][];
};

export type BumpLedgerInstanceArgs = TransactionInvocation & {
  low_expiration_watermark: u32;
  high_expiration_watermark: u32;
};


export type ContractConstructorArgs = TransactionInvocation & {
  network: Network
  contractId?: string
  rpcHandler?: RpcHandler
  wasm?: Buffer
  wasmHash?: string
}
