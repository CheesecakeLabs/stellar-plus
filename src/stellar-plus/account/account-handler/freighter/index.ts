import {
  getNetworkDetails,
  getPublicKey,
  isAllowed,
  isConnected,
  setAllowed,
  signAuthEntry,
  signTransaction,
} from '@stellar/freighter-api'
import { Transaction, xdr } from '@stellar/stellar-sdk'

import {
  FreighterAccHandlerPayload,
  FreighterAccountHandler,
  FreighterCallback,
} from 'stellar-plus/account/account-handler/freighter/types'
import { AccountBaseClient } from 'stellar-plus/account/base'
import { NetworkConfig } from 'stellar-plus/types'

import { FAHError } from './errors'

export class FreighterAccountHandlerClient extends AccountBaseClient implements FreighterAccountHandler {
  private networkConfig: NetworkConfig

  /**
   *
   * @args payload - The payload for the Freighter account handler. Additional parameters may be provided to enable different helpers.
   *
   * @param {NetworkConfig} payload.networkConfig The network to use.
   *
   * @description - The Freighter account handler is used for handling and creating new accounts by integrating with the browser extension Freighter App.
   */
  constructor(payload: FreighterAccHandlerPayload) {
    const { networkConfig } = payload as { networkConfig: NetworkConfig }
    const publicKey = ''
    super({ ...payload, publicKey })

    this.networkConfig = networkConfig
    this.publicKey = ''
  }

  /**
   *
   * @returns {string} The public key of the account.
   */
  public getPublicKey(): string {
    return this.publicKey
  }

  /**
   *
   * @param {function(string): void} onPublicKeyReceived - The callback to be called with the public key if successful.
   *
   * @returns {Promise<void>}
   *
   * @description - Perform all necessary verification to connect to Freighter and trigger the connection, calling the callback with the public key if successful.
   */
  public async connect(onPublicKeyReceived?: FreighterCallback): Promise<void> {
    await this.loadPublicKey(onPublicKeyReceived, true)
  }

  /**
   *  @returns {void}
   *
   *  @description - Disconnect from Freighter.
   */
  public disconnect(): void {
    this.publicKey = ''
  }

  /**
   *
   * @param {function(string):void} onPublicKeyReceived - The callback to be called with the public key if successful.
   * @param {boolean} enforceConnection - If true, it will perform all necessary verification to connect to Freighter and trigger the connection. Defaults to false.
   *
   * @returns {Promise<void>}
   *
   * @description - Get the public key from Freighter and call the callback with the public key if successful. When enforceConnection is true, it will perform all necessary verification to connect to Freighter and trigger the connection.
   *
   * */
  public async loadPublicKey(onPublicKeyReceived?: FreighterCallback, enforceConnection?: boolean): Promise<void> {
    const isFreighterConnected = await this.isFreighterConnected(enforceConnection, onPublicKeyReceived)

    if (isFreighterConnected) {
      try {
        const publicKey = await getPublicKey()
        this.publicKey = publicKey
        if (onPublicKeyReceived) {
          return await onPublicKeyReceived(publicKey)
        }
      } catch (e) {
        throw FAHError.failedToLoadPublicKeyError(e as Error)
      }
    }
  }

  /**
   *
   * @param {Transaction} tx - The transaction to sign.
   *
   * @returns {Promise<string>
   * }
   * @description - Sign a transaction with Freighter and return the signed transaction. If signerpublicKey is provided, it will be used to specifically request Freighter to sign with that account.
   *
   */
  public async sign(tx: Transaction): Promise<string> {
    const isFreighterConnected = await this.isFreighterConnected(true)

    if (isFreighterConnected) {
      try {
        const txXDR = tx.toXDR()

        const signedTx = await signTransaction(txXDR, {
          networkPassphrase: this.networkConfig.networkPassphrase,
          accountToSign: this.publicKey,
        })
        return signedTx
      } catch (e) {
        throw FAHError.failedToSignTransactionError(e as Error)
      }
    } else {
      this.connect()
      throw FAHError.freighterIsNotConnectedError()
    }
  }

  /**
   *
   * @param {xdr.SorobanAuthorizationEntry} entry - The soroban authorization entry to sign.
   * @param {number} validUntilLedgerSeq - The ledger sequence number until which the entry signature is valid.
   * @param {string} networkPassphrase - The network passphrase for the network to sign the entry for.
   * @description - Signs the given Soroban authorization entry with the account's secret key.
   *
   * @returns {xdr.SorobanAuthorizationEntry} The signed entry.
   */
  public async signSorobanAuthEntry(
    entry: xdr.SorobanAuthorizationEntry,
    validUntilLedgerSeq: number,
    networkPassphrase: string
  ): Promise<xdr.SorobanAuthorizationEntry> {
    const isFreighterConnected = await this.isFreighterConnected(true)

    if (isFreighterConnected) {
      if (networkPassphrase !== this.networkConfig.networkPassphrase) {
        throw FAHError.cannotSignForThisNetwork(networkPassphrase, this.networkConfig.networkPassphrase)
      }

      try {
        const signedEntryXdr = await signAuthEntry(entry.toXDR('base64'), { accountToSign: this.publicKey })
        const signedEntry = xdr.SorobanAuthorizationEntry.fromXDR(signedEntryXdr, 'base64')

        return signedEntry
      } catch (e) {
        throw FAHError.failedToSignAuthEntryError(e as Error)
      }
    } else {
      this.connect()
      throw FAHError.freighterIsNotConnectedError()
    }
  }

  /**
   *
   * @param {boolean} enforceConnection - If true, it will perform all necessary verification to connect to Freighter and trigger the connection. Defaults to false.
   * @param {function(string):void} callback - The callback to be called with the public key if successful.
   *
   * @returns {Promise<boolean>}
   *
   * @description - Perform all necessary verification to connect to Freighter. If enforceConnection is true, it will trigger the connection and call the callback with the public key if successful.
   *
   */
  public async isFreighterConnected(enforceConnection?: boolean, callback?: FreighterCallback): Promise<boolean> {
    const isFreighterInstalled = await this.isFreighterInstalled()

    if (!isFreighterInstalled) {
      return false
    }

    const isApplicationAllowed = await this.isApplicationAuthorized()
    if (!isApplicationAllowed) {
      if (enforceConnection) {
        setAllowed().then(async () => {
          if (callback) {
            await this.loadPublicKey(callback)
          }
        })
      }
      return false
    }

    try {
      await this.isNetworkCorrect()
    } catch (error) {
      return false
    }
    return true
  }

  /**
   *
   * @returns {Promise<boolean>}
   * @description - Verify is Freighter extension is installed
   */
  public async isFreighterInstalled(): Promise<boolean> {
    const isFreighterConnected = await isConnected()
    return isFreighterConnected
  }

  /**
   *
   * @returns {Promise<boolean>}
   * @description - Verify if the application is authorized to connect to Freighter
   */
  public async isApplicationAuthorized(): Promise<boolean> {
    const isApplicationAllowed = await isAllowed()
    if (!isApplicationAllowed) {
      return false
    }
    return true
  }

  /**
   *
   * @returns {Promise<boolean>}
   * @description - Verify if the network selected on Freighter is the same as the network selected on this handler
   */
  public async isNetworkCorrect(): Promise<boolean> {
    const networkDetails = await getNetworkDetails()

    if (networkDetails.networkPassphrase !== this.networkConfig.networkPassphrase) {
      throw FAHError.connectedToWrongNetworkError(this.networkConfig.name)
    }
    return true
  }
}
