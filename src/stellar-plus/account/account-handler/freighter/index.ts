import {
  getNetworkDetails,
  getPublicKey,
  isAllowed,
  isConnected,
  setAllowed,
  signTransaction,
} from '@stellar/freighter-api'

import {
  FreighterAccHandlerPayload,
  FreighterAccountHandler,
  FreighterCallback,
} from '@account/account-handler/freighter/types'
import { AccountBaseClient } from '@account/base'
import { Network, Transaction } from '@stellar-plus/types'

export class FreighterAccountHandlerClient extends AccountBaseClient implements FreighterAccountHandler {
  private network: Network

  /**
   *
   * @param payload - The payload for the Freighter account handler. Additional parameters may be provided to enable different helpers.
   * @description - The Freighter account handler is used for handling and creating new accounts by integrating with the browser extension Freighter App.
   */
  constructor(payload: FreighterAccHandlerPayload) {
    const { network } = payload as { network: Network }
    const publicKey = ''
    super({ ...payload, publicKey })

    this.network = network
    this.publicKey = ''
  }

  /**
   *
   * @returns The public key of the account.
   */
  public getPublicKey(): string {
    if (this.publicKey === '') {
      this.connect()
    }

    return this.publicKey
  }

  /**
   *
   * @param onPublicKeyReceived - The callback to be called with the public key if successful.
   * @returns Promise<void>
   * @description - Perform all necessary verification to connect to Freighter and trigger the connection, calling the callback with the public key if successful.
   */
  public async connect(onPublicKeyReceived?: FreighterCallback): Promise<void> {
    await this.loadPublicKey(onPublicKeyReceived, true)
  }

  /**
   *  @returns void
   *  @description - Disconnect from Freighter.
   */
  public disconnect(): void {
    this.publicKey = ''
  }

  /**
   *
   * @param onPublicKeyReceived - The callback to be called with the public key if successful.
   * @param enforceConnection - If true, it will perform all necessary verification to connect to Freighter and trigger the connection. Defaults to false.
   * @returns Promise<void>
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
          onPublicKeyReceived(publicKey)
        }
      } catch (error) {
        // console.log("Couldn't retrieve public key from Freighter! ", error)
        throw new Error("Couldn't retrieve public key from Freighter! ")
      }
    }
  }

  /**
   *
   * @param tx - The transaction to sign.
   * @param signerPublicKey - The public key of the account to sign the transaction with. If not provided, it will use the public key of the account handler.
   *
   * @returns Promise<string>
   * @description - Sign a transaction with Freighter and return the signed transaction. If signerpublicKey is provided, it will be used to specifically request Freighter to sign with that account.
   *
   */
  public async sign(tx: Transaction): Promise<string> {
    const isFreighterConnected = await this.isFreighterConnected(true)

    if (isFreighterConnected) {
      try {
        const txXDR = tx.toXDR()

        const signedTx = await signTransaction(txXDR, {
          networkPassphrase: this.network.networkPassphrase,
          accountToSign: this.publicKey,
        })
        return signedTx
      } catch (error) {
        // console.log("Couldn't sign transaction with Freighter! ", error)
        throw new Error("Couldn't sign transaction with Freighter! ")
      }
    } else {
      this.connect()
      throw new Error('Freighter not connected')
    }
  }

  /**
   *
   * @param enforceConnection - If true, it will perform all necessary verification to connect to Freighter and trigger the connection. Defaults to false.
   * @param callback - The callback to be called with the public key if successful.
   *
   * @returns Promise<boolean>
   *
   * @description - Perform all necessary verification to connect to Freighter. If enforceConnection is true, it will trigger the connection and call the callback with the public key if successful.
   *
   */
  public async isFreighterConnected(enforceConnection?: boolean, callback?: FreighterCallback): Promise<boolean> {
    const isFreighterInstalled = await this.isFreighterInstalled()

    if (!isFreighterInstalled) {
      return false
    }

    //
    // REVIEW: Documentation isn't clear, could be that
    // we don't need both isAllowed and setAllowed
    //
    const isApplicationAllowed = await this.isApplicationAuthorized()
    if (!isApplicationAllowed) {
      if (enforceConnection) {
        setAllowed().then(() => {
          if (callback) {
            this.loadPublicKey(callback)
          }
        })
      }
      return false
    }

    const isNetworkCorrect = await this.isNetworkCorrect()
    if (!isNetworkCorrect) {
      return false
    }
    return true
  }

  /**
   *
   * @returns Promise<boolean>
   * @description - Verify is Freighter extension is installed
   */
  public async isFreighterInstalled(): Promise<boolean> {
    const isFreighterConnected = await isConnected()

    return isFreighterConnected
  }

  /**
   *
   * @returns Promise<boolean>
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
   * @returns Promise<boolean>
   * @description - Verify if the network selected on Freighter is the same as the network selected on this handler
   */
  public async isNetworkCorrect(): Promise<boolean> {
    const networkDetails = await getNetworkDetails()

    if (networkDetails.networkPassphrase !== this.network.networkPassphrase) {
      // console.log(`You need to be in ${this.network.name} to connect to this application.`)
      throw new Error(`You need to be in ${this.network.name} to connect to this application.`)
    }
    return true
  }
}
