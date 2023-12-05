import { TransactionInvocation } from '@core/types'
import { i128, u64 } from '@stellar-plus/types'

export enum methods {
  get_position = 'get_position',
}

export type CertificateOfDepositContract = {
  deposit(args: DepositArgs): Promise<void>
  withdraw(args: WithdrawArgs): Promise<void>
  getEstimatedYield(args: GetEstimatedYieldArgs): Promise<number>
  getPosition(args: GetPositionArgs): Promise<number>
  getEstimatedPrematureWithdraw(args: GetEstimatedPrematureWithdrawArgs): Promise<number>
  getTimeLeft(args: GetTimeLeftArgs): Promise<number>
  // extendContractValidity(): Promise<void>;
}

export type DepositArgs = TransactionInvocation & {
  amount: bigint
  address: string
}

export type WithdrawArgs = TransactionInvocation & {
  address: string
  acceptPrematureWithdraw: boolean
}
export type GetEstimatedYieldArgs = TransactionInvocation & {
  address: string
}

export type GetPositionArgs = TransactionInvocation & {
  address: string
}

export type GetEstimatedPrematureWithdrawArgs = TransactionInvocation & {
  address: string
}

export type GetTimeLeftArgs = TransactionInvocation & {
  address: string
}

export type DepositData = {
  amount: i128
  timestamp: u64
}

// export type DataKey =
//   | { tag: "Admin"; values: void }
//   | { tag: "Asset"; values: void }
//   | { tag: "CompoundStep"; values: void }
//   | { tag: "Term"; values: void }
//   | { tag: "YieldRate"; values: void }
//   | { tag: "MinDeposit"; values: void }
//   | { tag: "PenaltyRate"; values: void }
//   | { tag: "Deposit"; values: readonly [Address] };
