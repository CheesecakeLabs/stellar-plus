import { AccountDataViewer } from "./account-data-viewer/types";
import {
  AccountHelpersPayload,
  AccountHelpers as AccountHelpersType,
} from "./types";
import { AccountDataViewerClient } from "./account-data-viewer";
import { Friendbot } from "./friendbot/types";
import { FriendbotClient } from "./friendbot";
import { Network } from "../../types";

export class AccountHelpers implements AccountHelpersType {
  public accountDataViewer?: AccountDataViewer;
  public friendbot?: Friendbot;

  constructor(payload: AccountHelpersPayload) {
    if ("network" in payload && payload.network) {
      this.accountDataViewer = new AccountDataViewerClient(
        payload.network,
        this
      );
      this.friendbot = new FriendbotClient(payload.network, this);
    }
  }
}
