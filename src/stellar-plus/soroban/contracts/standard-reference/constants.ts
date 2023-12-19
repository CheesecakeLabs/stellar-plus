import { ContractSpec } from '@stellar/stellar-sdk'
export enum Methods {
  init = 'init',
  upgrade = 'upgrade',
  version = 'version',
  address = 'address',
  current_admin = 'current_admin',
  transfer_admin = 'transfer_admin',
  is_relayer = 'is_relayer',
  add_relayers = 'add_relayers',
  remove_relayers = 'remove_relayers',
  relay = 'relay',
  force_relay = 'force_relay',
  delist = 'delist',
  get_ref_data = 'get_ref_data',
  get_reference_data = 'get_reference_data',
  bump_ledger_instance = 'bump_ledger_instance',
}

export const spec = new ContractSpec([
  "AAAABAAAAAAAAAAAAAAAFlN0YW5kYXJkUmVmZXJlbmNlRXJyb3IAAAAAAAMAAAAAAAAAE05vdEluaXRpYWxpemVkRXJyb3IAAAAAAAAAAAAAAAAOTm9SZWZEYXRhRXJyb3IAAAAAAAEAAAAAAAAAD0FyaXRobWV0aWNFcnJvcgAAAAAC",
  "AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAACmFkbWluX2FkZHIAAAAAABMAAAAA",
  "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
  "AAAAAAAAAAAAAAAHdmVyc2lvbgAAAAAAAAAAAQAAAAQ=",
  "AAAAAAAAAAAAAAAHYWRkcmVzcwAAAAAAAAAAAQAAABM=",
  "AAAAAAAAAAAAAAANY3VycmVudF9hZG1pbgAAAAAAAAAAAAABAAAAEw==",
  "AAAAAAAAAAAAAAAOdHJhbnNmZXJfYWRtaW4AAAAAAAEAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAAA",
  "AAAAAAAAAAAAAAAKaXNfcmVsYXllcgAAAAAAAQAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
  "AAAAAAAAAAAAAAAMYWRkX3JlbGF5ZXJzAAAAAQAAAAAAAAAJYWRkcmVzc2VzAAAAAAAD6gAAABMAAAAA",
  "AAAAAAAAAAAAAAAPcmVtb3ZlX3JlbGF5ZXJzAAAAAAEAAAAAAAAACWFkZHJlc3NlcwAAAAAAA+oAAAATAAAAAA==",
  "AAAAAAAAAAAAAAAFcmVsYXkAAAAAAAAEAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAMc3ltYm9sX3JhdGVzAAAD6gAAA+0AAAACAAAAEQAAAAYAAAAAAAAADHJlc29sdmVfdGltZQAAAAYAAAAAAAAACnJlcXVlc3RfaWQAAAAAAAYAAAAA",
  "AAAAAAAAAAAAAAALZm9yY2VfcmVsYXkAAAAABAAAAAAAAAAEZnJvbQAAABMAAAAAAAAADHN5bWJvbF9yYXRlcwAAA+oAAAPtAAAAAgAAABEAAAAGAAAAAAAAAAxyZXNvbHZlX3RpbWUAAAAGAAAAAAAAAApyZXF1ZXN0X2lkAAAAAAAGAAAAAA==",
  "AAAAAAAAAAAAAAAGZGVsaXN0AAAAAAACAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAHc3ltYm9scwAAAAPqAAAAEQAAAAA=",
  "AAAAAAAAAAAAAAAMZ2V0X3JlZl9kYXRhAAAAAQAAAAAAAAAHc3ltYm9scwAAAAPqAAAAEQAAAAEAAAPpAAAD6gAAB9AAAAAHUmVmRGF0YQAAAAfQAAAAFlN0YW5kYXJkUmVmZXJlbmNlRXJyb3IAAA==",
  "AAAAAAAAAAAAAAASZ2V0X3JlZmVyZW5jZV9kYXRhAAAAAAABAAAAAAAAAAxzeW1ib2xfcGFpcnMAAAPqAAAD7QAAAAIAAAARAAAAEQAAAAEAAAPpAAAD6gAAB9AAAAANUmVmZXJlbmNlRGF0YQAAAAAAB9AAAAAWU3RhbmRhcmRSZWZlcmVuY2VFcnJvcgAA",
  "AAAAAAAAAAAAAAAUYnVtcF9sZWRnZXJfaW5zdGFuY2UAAAACAAAAAAAAABhsb3dfZXhwaXJhdGlvbl93YXRlcm1hcmsAAAAEAAAAAAAAABloaWdoX2V4cGlyYXRpb25fd2F0ZXJtYXJrAAAAAAAABAAAAAA=",
  "AAAAAQAAAAAAAAAAAAAAB1JlZkRhdGEAAAAAAwAAAAAAAAAEcmF0ZQAAAAYAAAAAAAAACnJlcXVlc3RfaWQAAAAAAAYAAAAAAAAADHJlc29sdmVfdGltZQAAAAY=",
  "AAAAAQAAAAAAAAAAAAAADVJlZmVyZW5jZURhdGEAAAAAAAADAAAAAAAAABFsYXN0X3VwZGF0ZWRfYmFzZQAAAAAAAAYAAAAAAAAAEmxhc3RfdXBkYXRlZF9xdW90ZQAAAAAABgAAAAAAAAAEcmF0ZQAAAAo=",
  "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAAHUmVsYXllcgAAAAABAAAAEwAAAAEAAAAAAAAAB1JlZkRhdGEAAAAAAQAAABE=",
])