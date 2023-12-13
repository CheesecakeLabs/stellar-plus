export function balances(
  asset_issuer = 'GCL3QOGZXUN4OSP35ZR6MZHIZPFJNSCT2XPX227HFTDF7DE526FBDZV6',
  asset_code = 'CAKE'
) {
  return [
    {
      balance: '3000000.0000000',
      limit: '922337203685.4775807',
      buying_liabilities: '0.0000000',
      selling_liabilities: '0.0000000',
      last_modified_ledger: 2849609,
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      asset_type: 'credit_alphanum4',
      asset_code: asset_code,
      asset_issuer: asset_issuer,
    },
    {
      balance: '10000.0000000',
      buying_liabilities: '0.0000000',
      selling_liabilities: '0.0000000',
      asset_type: 'native',
    },
  ]
}
