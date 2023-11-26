import {
  AccountDataViewer,
  AccountDataViewerConstructor,
} from "./account-data-viewer/types";
import { Friendbot } from "./friendbot/types";

export type AccountHelpersPayload = AccountDataViewerConstructor & {};
export type AccountHelpers = {
  accountDataViewer?: AccountDataViewer;
  friendbot?: Friendbot;
};
