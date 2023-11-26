import {
  getPublicKey,
  signTransaction,
  setAllowed,
  isConnected,
  isAllowed,
  getNetworkDetails,
} from "@stellar/freighter-api";
import { Network, Transaction } from "../../../types";
import { AccountBaseClient } from "../../base";

import {
  FreighterAccountHandler,
  FreighterAccHandlerPayload,
  FreighterCallback,
} from "./types";

export class FreighterAccountHandlerClient
  extends AccountBaseClient
  implements FreighterAccountHandler
{
  private network: Network;

  constructor(payload: FreighterAccHandlerPayload) {
    const { network } = payload;
    const publicKey = "";
    super({ ...payload, publicKey });

    this.network = network;
    this.publicKey = "";
  }

  public getPublicKey(): string {
    if (this.publicKey === "") {
      this.connect();
    }

    return this.publicKey;
  }

  //
  // Perform all necessary verification to connect to Freighter
  // and trigger the connection, calling the callback with the
  // public key if successful
  //
  public async connect(onPublicKeyReceived?: FreighterCallback): Promise<void> {
    await this.loadPublicKey(onPublicKeyReceived, true);
  }

  //
  // Disconnect from Freighter
  //
  public disconnect(): void {
    this.publicKey = "";
  }

  //
  // Get the public key from Freighter and call the callback
  // with the public key if successful. When enforceConnection
  // is true, it will perform all necessary verification to
  // connect to Freighter and trigger the connection
  //
  public async loadPublicKey(
    onPublicKeyReceived?: FreighterCallback,
    enforceConnection?: boolean
  ): Promise<void> {
    const isFreighterConnected = await this.isFreighterConnected(
      enforceConnection,
      onPublicKeyReceived
    );

    if (isFreighterConnected) {
      try {
        const publicKey = await getPublicKey();
        this.publicKey = publicKey;
        if (onPublicKeyReceived) {
          onPublicKeyReceived(publicKey);
        }
      } catch (error) {
        console.log("Couldn't retrieve public key from Freighter! ", error);
      }
    }
  }

  //
  // Sign a transaction with Freighter and return the signed transaction.
  // If signerpublicKey is provided, it will be used to specifically request
  // Freighter to sign with that account.
  //
  public async sign(tx: Transaction): Promise<string> {
    const isFreighterConnected = await this.isFreighterConnected(true);

    if (isFreighterConnected) {
      try {
        const txXDR = tx.toXDR();

        const signedTx = await signTransaction(txXDR, {
          networkPassphrase: this.network.networkPassphrase,
          accountToSign: this.publicKey,
        });
        return signedTx;
      } catch (error) {
        console.log("Couldn't sign transaction with Freighter! ", error);
        throw error;
      }
    } else {
      this.connect();
      throw new Error("Freighter not connected");
    }
  }

  //
  // Perform all necessary verification to connect to Freighter.
  // If enforceConnection is true, it will trigger the connection
  // and call the callback with the public key if successful.
  //
  public async isFreighterConnected(
    enforceConnection?: boolean,
    callback?: FreighterCallback
  ) {
    const isFreighterInstalled = await this.isFreighterInstalled();

    if (!isFreighterInstalled) {
      return false;
    }

    //
    // REVIEW: Documentation isn't clear, could be that
    // we don't need both isAllowed and setAllowed
    //
    const isApplicationAllowed = await this.isApplicationAuthorized();
    if (!isApplicationAllowed) {
      if (enforceConnection) {
        setAllowed().then((res) => {
          if (callback) {
            this.loadPublicKey(callback);
          }
        });
      }
      return false;
    }

    const isNetworkCorrect = await this.isNetworkCorrect();
    if (!isNetworkCorrect) {
      return false;
    }
    return true;
  }

  //
  // Verify is Freighter extension is installed
  //
  public async isFreighterInstalled() {
    const isFreighterConnected = await isConnected();

    if (!isFreighterConnected) {
      console.log("Ops, seems like you don't have Freighter extension yet!");
      return false;
    }
    return true;
  }

  //
  // Verify if the application is authorized to connect to Freighter
  //

  public async isApplicationAuthorized() {
    const isApplicationAllowed = await isAllowed();
    if (!isApplicationAllowed) {
      return false;
    }
    return true;
  }

  //
  // Verify if the network selected on Freighter
  // is the same as the network selected on this
  // handler
  //
  public async isNetworkCorrect() {
    const networkDetails = await getNetworkDetails();

    if (networkDetails.networkPassphrase !== this.network.networkPassphrase) {
      console.log(
        `You need to be in ${this.network.name} to connect to this application.`
      );
      return false;
    }
    return true;
  }
}
