import { AccountHandler } from "../../account/account-handler/types";
import { TransactionProcessor } from "../../core/classic-transaction-processor";
import { TransactionInvocation } from "../../core/types";
import { Address, Network, i128 } from "../../types";
import { AssetTypes } from "../types";
import { ClassicAssetHandler as IClassicAssetHandler } from "./types";
import {
  Horizon as HorizonNamespace,
  TransactionBuilder,
  Operation,
  Asset as StellarAsset,
} from "stellar-sdk";

export class ClassicAssetHandler
  extends TransactionProcessor
  implements IClassicAssetHandler
{
  public code: string;
  public issuerPublicKey: string;
  public type:
    | AssetTypes.native
    | AssetTypes.credit_alphanum4
    | AssetTypes.credit_alphanum12;
  private issuerAccount?: AccountHandler;
  private asset: StellarAsset;

  constructor(
    code: string,
    issuerPublicKey: string,
    network: Network,
    issuerAccount: AccountHandler
  ) {
    super(network);
    this.code = code;
    this.issuerPublicKey = issuerPublicKey;
    this.type =
      code === "XLM"
        ? AssetTypes.native
        : code.length <= 4
        ? AssetTypes.credit_alphanum4
        : AssetTypes.credit_alphanum12;

    this.asset = new StellarAsset(code, issuerPublicKey);
    this.issuerAccount = issuerAccount;
  }

  //==========================================
  // User Methods - Do not require Admin / Issuer
  //==========================================
  //
  //
  // Refers to the code of the asset.
  //
  public async symbol(): Promise<any> {
    return this.code;
  }

  //
  // Default for classic assets = 7.
  // Can be improved to get the actual
  // value from the asset issuer's toml file.
  //
  public async decimals(): Promise<any> {
    return 7;
  }

  //
  // For now it is defauting to the asset
  // code. Can be improved to get the actual
  // name from the asset issuer's toml file.
  //
  public async name(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async allowance(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async approve(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async balance(args: { id: string }): Promise<number> {
    const { id } = args;

    const sourceAccount = await this.horizonHandler.loadAccount(id);
    const balanceLine = sourceAccount.balances.filter(
      (balanceLine: HorizonNamespace.BalanceLine) => {
        if (
          balanceLine.asset_type === this.type &&
          balanceLine.asset_type === AssetTypes.native
        ) {
          return true;
        }

        if (
          balanceLine.asset_type === AssetTypes.credit_alphanum12 ||
          balanceLine.asset_type === AssetTypes.credit_alphanum4
        ) {
          if (
            balanceLine.asset_code === this.code &&
            balanceLine.asset_issuer === this.issuerPublicKey
          )
            return true;
        }

        return false;
      }
    );

    return balanceLine[0] ? Number(balanceLine[0].balance) : 0;
  }

  public async spendable_balance(): Promise<i128> {
    throw new Error("Method not implemented.");
  }

  //
  // Signers: - 'From' account
  //
  //
  public async transfer(
    args: { from: string; to: string; amount: i128 } & TransactionInvocation
  ): Promise<void> {
    const { from, to, amount, signers, header, feeBump } = args;

    const sourceAccount = await this.horizonHandler.loadAccount(header.source);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: from,
        })
      )
      .setTimeout(header.timeout)
      .build();

    return await this.processTransaction(tx, signers, feeBump);
  }

  public async transfer_from(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async burn(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async burn_from(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  //==========================================
  // Management Methods - Require Admin / Issuer account
  //==========================================
  //

  public async set_admin(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  public async admin(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  public async set_authorized(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  //
  // Performs a payment from the issuer account directly
  // to the target account. The amount is minted in the
  // process as new circulating supply.
  //
  public async mint(
    args: { to: string; amount: i128 } & TransactionInvocation
  ): Promise<HorizonNamespace.SubmitTransactionResponse> {
    this.requireIssuerAccount(); // Enforces the issuer account to be set.

    const { to, amount, signers, header, feeBump } = args;

    const sourceAccount = await this.horizonHandler.loadAccount(header.source);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: this.asset.issuer,
        })
      )
      .setTimeout(header.timeout)
      .build();

    const signersWithIssuer = [...signers, this.issuerAccount!];

    return await this.processTransaction(tx, signersWithIssuer, feeBump);
  }

  public async clawback(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  //==========================================
  // Util Methods
  //==========================================
  //

  //
  // This transaction will add a trustline and mint tokens to target account.
  // It automatically adds the issuer as a signer for the inner transaction.
  //
  //
  // Signers: - 'To' account
  //             Must include the account that will receive the tokens
  //             because the operation to add the trustline requires approval.
  //
  //
  public async addTrustlineAndMint(
    args: { to: string; amount: number } & TransactionInvocation
  ): Promise<HorizonNamespace.SubmitTransactionResponse> {
    this.requireIssuerAccount(); // Enforces the issuer account to be set.

    const { to, amount, signers, header, feeBump } = args;

    const sourceAccount = await this.horizonHandler.loadAccount(header.source);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          source: to,
          asset: this.asset,
        })
      )
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: this.asset.issuer,
        })
      )
      .setTimeout(header.timeout)
      .build();

    const signersWithIssuer = [...signers, this.issuerAccount!];

    return await this.processTransaction(tx, signersWithIssuer, feeBump);
  }

  //==========================================
  // Internal Methods
  //==========================================
  //
  private requireIssuerAccount(): void {
    if (!this.issuerAccount) {
      throw new Error("Issuer account not set!");
    }
  }
}
