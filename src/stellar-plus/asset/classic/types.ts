import { AssetTypes, TokenInterface } from "../types";

export type ClassicAsset = {
  code: string;
  issuerPublicKey: string;
  type:
    | AssetTypes.native
    | AssetTypes.credit_alphanum4
    | AssetTypes.credit_alphanum12;
};

export type ClassicAssetHandler = ClassicAsset & TokenInterface & {};
