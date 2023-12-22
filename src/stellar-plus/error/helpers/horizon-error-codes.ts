import { DiagnosticEntry } from './horizon'

export const transactionErrorMessages: { [key: string]: DiagnosticEntry } = {
  tx_success: {
    issue: 'Transaction succeeded.',
    suggestion: 'No action required.',
  },
  tx_failed: {
    issue: 'Transaction failed, one or more operations failed.',
    suggestion: 'Inspect individual operations for failure reasons.',
  },
  tx_too_early: {
    issue: 'Transaction submitted too early.',
    suggestion: 'Check the ledger closeTime is after the minTime.',
  },
  tx_too_late: {
    issue: 'Transaction submitted too late.',
    suggestion: 'Check the ledger closeTime is before the maxTime.',
  },
  tx_missing_operation: {
    issue: 'No operation specified in transaction.',
    suggestion: 'Include at least one operation in the transaction.',
  },
  tx_bad_seq: {
    issue: 'Sequence number does not match source account.',
    suggestion: 'Ensure the sequence number is correct.',
  },
  tx_bad_auth: {
    issue: 'Too few valid signatures or wrong network.',
    suggestion: 'Check the transaction signatures and network.',
  },
  tx_insufficient_balance: {
    issue: 'Insufficient balance to cover fee.',
    suggestion: 'Ensure the account has enough balance to cover fees.',
  },
  tx_no_source_account: {
    issue: 'Source account not found.',
    suggestion: 'Verify the source account exists.',
  },
  tx_insufficient_fee: {
    issue: 'Fee is too small.',
    suggestion: 'Increase the transaction fee.',
  },
  tx_bad_auth_extra: {
    issue: 'Unused signatures attached to transaction.',
    suggestion: 'Remove any unnecessary signatures.',
  },
  tx_internal_error: {
    issue: 'An unknown error occurred.',
    suggestion: 'Review the error data and try again later.',
  },
  tx_fee_bump_inner_failed: {
    issue: 'The inner transaction failed.',
    suggestion:
      'The inner transaction within the Fee Bump have failed. It is necessary to review the Transaction Data to identify the issue in the inner transaction..',
  },
}

export const operationErrorMessages: { [key: string]: DiagnosticEntry } = {
  op_inner: {
    issue: 'The inner object result is valid and the operation was a success.',
    suggestion: 'No action needed.',
  },
  op_bad_auth: {
    issue: 'There are too few valid signatures, or the transaction was submitted to the wrong network.',
    suggestion: 'Verify the signatures and the network used.',
  },
  op_no_source_account: {
    issue: 'The source account was not found.',
    suggestion: 'Check if the source account exists and is correct.',
  },
  op_not_supported: {
    issue: 'The operation is not supported at this time.',
    suggestion: 'Check if the operation is currently supported by the Stellar network.',
  },
  op_too_many_subentries: {
    issue: 'Maximum number of subentries (1000) already reached.',
    suggestion: 'Reduce the number of subentries or consolidate operations.',
  },
  op_exceeded_work_limit: {
    issue: 'Operation did too much work.',
    suggestion: 'Optimize the operation to reduce its workload.',
  },
}

export const createAccountOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  op_success: {
    issue: 'Create Account operation was successful, and an account was created.',
    suggestion: 'No action needed.',
  },
  op_malformed: {
    issue: 'The destination was invalid in the Create Account operation.',
    suggestion: 'Verify the destination account address is correct.',
  },
  op_underfunded: {
    issue: 'The source account does not have enough funds for the Create Account operation.',
    suggestion:
      'Ensure the source account has sufficient funds to maintain its own and the new account’s minimum reserve.',
  },
  op_low_reserve: {
    issue: 'The operation would create an account below the minimum reserve.',
    suggestion: 'Ensure the initial balance meets the minimum reserve requirements.',
  },
  op_already_exists: {
    issue: 'The destination account already exists.',
    suggestion: 'Use an account that does not already exist.',
  },
}

export const paymentOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  op_success: {
    issue: 'The payment was successfully completed.',
    suggestion: 'No action needed.',
  },
  op_malformed: {
    issue: 'The input to the payment is invalid.',
    suggestion: 'Verify the payment details are correct.',
  },
  op_underfunded: {
    issue: 'The source account does not have enough lumens for the payment amount.',
    suggestion: 'Ensure the source account has sufficient funds.',
  },
  op_src_no_trust: {
    issue: 'The source account does not have a trustline for the asset being sent.',
    suggestion: 'Establish a trustline for the asset from the source account.',
  },
  op_src_not_authorized: {
    issue: 'The source account is not authorized to send this asset.',
    suggestion: 'Check the asset authorization for the source account.',
  },
  op_no_destination: {
    issue: 'The destination account does not exist.',
    suggestion: 'Verify the destination account exists.',
  },
  op_no_trust: {
    issue: 'The destination account does not have a trustline for the asset.',
    suggestion: 'The recipient must establish a trustline for the asset.',
  },
  op_not_authorized: {
    issue: 'The destination account is not authorized to hold this asset.',
    suggestion: 'Check the asset authorization for the destination account.',
  },
  op_line_full: {
    issue: 'The destination account does not have sufficient limits to receive the amount.',
    suggestion: 'Ensure the receiver has enough capacity to receive the asset.',
  },
  op_no_issuer: {
    issue: 'The issuer of the asset does not exist.',
    suggestion: 'Verify the asset issuer’s existence and validity.',
  },
}

export const pathPaymentStrictReceiveOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  path_payment_strict_receive_success: {
    issue: 'The path payment was successfully completed.',
    suggestion: 'No action needed.',
  },
  path_payment_strict_receive_malformed: {
    issue: 'The input for this path payment is invalid.',
    suggestion: 'Verify the path payment details are correct.',
  },
  path_payment_strict_receive_underfunded: {
    issue: 'The source account does not have enough funds for the payment amount.',
    suggestion: 'Ensure the source account has sufficient funds.',
  },
  path_payment_strict_receive_src_no_trust: {
    issue: 'The source account is missing the appropriate trustline.',
    suggestion: 'Establish a trustline for the asset from the source account.',
  },
  path_payment_strict_receive_src_not_authorized: {
    issue: 'The source account is not authorized to send this asset.',
    suggestion: 'Check the asset authorization for the source account.',
  },
  path_payment_strict_receive_no_destination: {
    issue: 'The destination account does not exist.',
    suggestion: 'Verify the destination account exists.',
  },
  path_payment_strict_receive_no_trust: {
    issue: 'The destination account does not have a trustline for the asset.',
    suggestion: 'The recipient must establish a trustline for the asset.',
  },
  path_payment_strict_receive_not_authorized: {
    issue: 'The destination account is not authorized to hold this asset.',
    suggestion: 'Check the asset authorization for the destination account.',
  },
  path_payment_strict_receive_line_full: {
    issue: 'The destination account does not have sufficient limits to receive the amount.',
    suggestion: 'Ensure the receiver has enough capacity to receive the asset.',
  },
  path_payment_strict_receive_no_issuer: {
    issue: 'The issuer of one of the assets is missing.',
    suggestion: 'Verify the asset issuer’s existence and validity.',
  },
  path_payment_strict_receive_too_few_offers: {
    issue: 'There is no path of offers connecting the send asset and destination asset.',
    suggestion: 'Consider alternative paths or assets for the payment.',
  },
  path_payment_strict_receive_offer_cross_self: {
    issue: 'This path payment would cross one of its own offers.',
    suggestion: 'Adjust the offer to avoid crossing your own offers.',
  },
  path_payment_strict_receive_over_sendmax: {
    issue: 'The paths exceed the maximum send limit for the destination amount.',
    suggestion: 'Adjust the send max limit or consider different paths.',
  },
}

export const pathPaymentStrictSendOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  path_payment_strict_send_success: {
    issue: 'The path payment was successfully completed.',
    suggestion: 'No action needed.',
  },
  path_payment_strict_send_malformed: {
    issue: 'The input for this path payment is invalid.',
    suggestion: 'Verify the path payment details are correct.',
  },
  path_payment_strict_send_underfunded: {
    issue: 'The source account does not have enough funds for the payment amount.',
    suggestion: 'Ensure the source account has sufficient funds.',
  },
  path_payment_strict_send_src_no_trust: {
    issue: 'The source account is missing the appropriate trustline.',
    suggestion: 'Establish a trustline for the asset from the source account.',
  },
  path_payment_strict_send_src_not_authorized: {
    issue: 'The source account is not authorized to send this asset.',
    suggestion: 'Check the asset authorization for the source account.',
  },
  path_payment_strict_send_no_destination: {
    issue: 'The destination account does not exist.',
    suggestion: 'Verify the destination account exists.',
  },
  path_payment_strict_send_no_trust: {
    issue: 'The destination account does not have a trustline for the asset being sent.',
    suggestion: 'The recipient must establish a trustline for the asset.',
  },
  path_payment_strict_send_not_authorized: {
    issue: 'The destination account is not authorized to hold this asset.',
    suggestion: 'Check the asset authorization for the destination account.',
  },
  path_payment_strict_send_line_full: {
    issue: 'The destination account does not have sufficient limits to receive the amount.',
    suggestion: 'Ensure the receiver has enough capacity to receive the asset.',
  },
  path_payment_strict_send_no_issuer: {
    issue: 'The issuer of one of the assets is missing.',
    suggestion: 'Verify the asset issuer’s existence and validity.',
  },
  path_payment_strict_send_too_few_offers: {
    issue: 'There is no path of offers connecting the send asset and destination asset.',
    suggestion: 'Consider alternative paths or assets for the payment.',
  },
  path_payment_strict_send_offer_cross_self: {
    issue: 'This path payment would cross one of its own offers.',
    suggestion: 'Adjust the offer to avoid crossing your own offers.',
  },
  path_payment_strict_send_under_destmin: {
    issue: 'The paths fall short of the minimum destination amount.',
    suggestion: 'Adjust the path or destination minimum as needed.',
  },
}

export const manageSellOfferOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  manage_sell_offer_success: {
    issue: 'The offer was successfully placed.',
    suggestion: 'No action needed.',
  },
  manage_sell_offer_malformed: {
    issue: 'The input is incorrect and would result in an invalid offer.',
    suggestion: 'Verify the offer details are correct.',
  },
  manage_sell_offer_sell_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is selling.',
    suggestion: 'Establish a trustline for the selling asset.',
  },
  manage_sell_offer_buy_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is buying.',
    suggestion: 'Establish a trustline for the buying asset.',
  },
  manage_sell_offer_sell_not_authorized: {
    issue: 'The account creating the offer is not authorized to sell this asset.',
    suggestion: 'Check the asset authorization for the selling account.',
  },
  manage_sell_offer_buy_not_authorized: {
    issue: 'The account creating the offer is not authorized to buy this asset.',
    suggestion: 'Check the asset authorization for the buying account.',
  },
  manage_sell_offer_line_full: {
    issue: 'The account does not have sufficient limits to receive buying and still satisfy its buying liabilities.',
    suggestion: 'Ensure the account has enough capacity to receive the asset.',
  },
  manage_sell_offer_underfunded: {
    issue: 'The account creating the offer does not have enough funds to complete the offer.',
    suggestion: 'Ensure the account has sufficient funds for the offer.',
  },
  manage_sell_offer_cross_self: {
    issue: 'The offer would immediately cross an existing offer from the same account.',
    suggestion: 'Adjust the offer to avoid self-crossing.',
  },
  manage_sell_offer_sell_no_issuer: {
    issue: 'The issuer of the selling asset does not exist.',
    suggestion: 'Verify the selling asset issuer’s existence and validity.',
  },
  manage_sell_offer_buy_no_issuer: {
    issue: 'The issuer of the buying asset does not exist.',
    suggestion: 'Verify the buying asset issuer’s existence and validity.',
  },
  manage_sell_offer_not_found: {
    issue: 'An offer with the specified ID cannot be found.',
    suggestion: 'Check the offer ID for accuracy.',
  },
  manage_sell_offer_low_reserve: {
    issue: 'Creating the offer would cause the account to drop below the minimum reserve requirement.',
    suggestion: 'Ensure the account has enough XLM to meet the reserve requirement.',
  },
}

export const manageBuyOfferOperationErrorMessages: { [key: string]: DiagnosticEntry } = {
  manage_buy_offer_success: {
    issue: 'The offer was successfully placed.',
    suggestion: 'No action needed.',
  },
  manage_buy_offer_malformed: {
    issue: 'The input is incorrect and would result in an invalid offer.',
    suggestion: 'Verify the offer details are correct.',
  },
  manage_buy_offer_sell_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is selling.',
    suggestion: 'Establish a trustline for the selling asset.',
  },
  manage_buy_offer_buy_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is buying.',
    suggestion: 'Establish a trustline for the buying asset.',
  },
  manage_buy_offer_sell_not_authorized: {
    issue: 'The account creating the offer is not authorized to sell this asset.',
    suggestion: 'Check the asset authorization for the selling account.',
  },
  manage_buy_offer_buy_not_authorized: {
    issue: 'The account creating the offer is not authorized to buy this asset.',
    suggestion: 'Check the asset authorization for the buying account.',
  },
  manage_buy_offer_line_full: {
    issue: 'The account does not have sufficient limits to receive buying and still satisfy its buying liabilities.',
    suggestion: 'Ensure the account has enough capacity to receive the asset.',
  },
  manage_buy_offer_underfunded: {
    issue:
      'The account creating the offer does not have sufficient limits to send selling and still satisfy its selling liabilities.',
    suggestion: 'Ensure the account has enough capacity to send the selling asset.',
  },
  manage_buy_offer_cross_self: {
    issue:
      'The account has an opposite offer of equal or lesser price active, so creating this offer would immediately cross itself.',
    suggestion: 'Adjust the offer price or cancel the existing conflicting offer.',
  },
  manage_buy_offer_sell_no_issuer: {
    issue: 'The issuer of the selling asset does not exist.',
    suggestion: 'Verify the existence and validity of the asset issuer.',
  },
  manage_buy_offer_buy_no_issuer: {
    issue: 'The issuer of the buying asset does not exist.',
    suggestion: 'Verify the existence and validity of the asset issuer.',
  },
  manage_buy_offer_offer_not_found: {
    issue: 'An offer with that offerID cannot be found.',
    suggestion: 'Double-check the offerID for correctness.',
  },
  manage_buy_offer_low_reserve: {
    issue:
      'The account creating this offer does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities.',
    suggestion: 'Ensure the account maintains enough XLM to meet reserve requirements.',
  },
}

export const createPassiveSellOfferResultCodes: { [key: string]: DiagnosticEntry } = {
  create_passive_sell_offer_success: {
    issue: 'The passive sell offer was successfully placed.',
    suggestion: 'No action needed.',
  },
  create_passive_sell_offer_malformed: {
    issue: 'The input is incorrect and would result in an invalid offer.',
    suggestion: 'Verify the offer details are correct.',
  },
  create_passive_sell_offer_sell_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is selling.',
    suggestion: 'Establish a trustline for the selling asset.',
  },
  create_passive_sell_offer_buy_no_trust: {
    issue: 'The account creating the offer does not have a trustline for the asset it is buying.',
    suggestion: 'Establish a trustline for the buying asset.',
  },
  create_passive_sell_offer_sell_not_authorized: {
    issue: 'The account creating the offer is not authorized to sell this asset.',
    suggestion: 'Check the asset authorization for selling.',
  },
  create_passive_sell_offer_buy_not_authorized: {
    issue: 'The account creating the offer is not authorized to buy this asset.',
    suggestion: 'Check the asset authorization for buying.',
  },
  create_passive_sell_offer_line_full: {
    issue:
      'The account creating the offer does not have sufficient limits to receive buying and still satisfy its buying liabilities.',
    suggestion: 'Ensure the account has enough capacity for receiving the asset.',
  },
  create_passive_sell_offer_underfunded: {
    issue:
      'The account creating the offer does not have sufficient limits to send selling and still satisfy its selling liabilities. Note that if selling XLM then the account must additionally maintain its minimum XLM reserve, which is calculated assuming this offer will not completely execute immediately.',
    suggestion: 'Ensure the account maintains enough XLM to meet reserve requirements.',
  },
  create_passive_sell_offer_cross_self: {
    issue:
      'The account has an opposite offer of equal or lesser price active, so creating this offer would immediately cross itself.',
    suggestion: 'Adjust the offer price or cancel the existing conflicting offer.',
  },
  create_passive_sell_offer_sell_no_issuer: {
    issue: 'The issuer of the selling asset does not exist.',
    suggestion: 'Verify the existence and validity of the asset issuer.',
  },
  create_passive_sell_offer_buy_no_issuer: {
    issue: 'The issuer of the buying asset does not exist.',
    suggestion: 'Verify the existence and validity of the asset issuer.',
  },
  create_passive_sell_offer_offer_not_found: {
    issue: 'An offer with that offerID cannot be found.',
    suggestion: 'Double-check the offerID for correctness.',
  },
  create_passive_sell_offer_low_reserve: {
    issue:
      'The account creating this offer does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every offer an account creates, the minimum amount of XLM that account must hold will increase.',
    suggestion: 'Ensure the account maintains enough XLM to meet reserve requirements.',
  },
}

export const setOptionsResultCodes: { [key: string]: DiagnosticEntry } = {
  set_options_success: {
    issue: 'Options successfully set.',
    suggestion: 'No action needed.',
  },
  set_options_low_reserve: {
    issue:
      'This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new signer added to an account, the minimum reserve of XLM that account must hold increases.',
    suggestion: 'Ensure the account maintains enough XLM to meet reserve requirements.',
  },
  set_options_too_many_signers: {
    issue: '20 is the maximum number of signers an account can have, and adding another signer would exceed that.',
    suggestion: 'Remove unnecessary signers or consider consolidating accounts if needed.',
  },
  set_options_bad_flags: {
    issue: 'The flags set and/or cleared are invalid by themselves or in combination.',
    suggestion: 'Review the flags configuration and ensure it complies with Stellar protocol.',
  },
  set_options_invalid_inflation: {
    issue: 'The destination account set in the inflation field does not exist.',
    suggestion: 'Verify the existence and correctness of the destination account.',
  },
  set_options_cant_change: {
    issue: 'This account can no longer change the option it wants to change.',
    suggestion: 'Check if the desired options can still be modified for this account.',
  },
  set_options_unknown_flag: {
    issue: 'The account is trying to set a flag that is unknown.',
    suggestion: 'Ensure the flag being set is a valid and recognized flag.',
  },
  set_options_threshold_out_of_range: {
    issue: 'The value for a key weight or threshold is invalid.',
    suggestion: 'Verify the threshold value and ensure it falls within the valid range.',
  },
  set_options_bad_signer: {
    issue: 'Any additional signers added to the account cannot be the master key.',
    suggestion: 'Ensure that added signers are not set as the master key.',
  },
  set_options_invalid_home_domain: {
    issue: 'Home domain is malformed.',
    suggestion: 'Check the format of the home domain and correct any errors.',
  },
}

export const changeTrustResultCodes: { [key: string]: DiagnosticEntry } = {
  change_trust_success: {
    issue: 'Trust was successfully changed.',
    suggestion: 'No action needed.',
  },
  change_trust_malformed: {
    issue: 'The input to this operation is invalid.',
    suggestion: 'Verify the input data and correct any errors.',
  },
  change_trust_no_issuer: {
    issue: 'The issuer of the asset cannot be found.',
    suggestion: 'Ensure the issuer account exists and the asset is valid.',
  },
  change_trust_invalid_limit: {
    issue:
      'The limit is not sufficient to hold the current balance of the trustline and still satisfy its buying liabilities.',
    suggestion: 'Adjust the trustline limit to accommodate the desired balance.',
  },
  change_trust_low_reserve: {
    issue:
      'This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new trustline added to an account, the minimum reserve of XLM that account must hold increases.',
    suggestion: 'Ensure the account maintains enough XLM to meet reserve requirements.',
  },
  change_trust_self_not_allowed: {
    issue: 'The source account attempted to create a trustline for itself, which is not allowed.',
    suggestion: 'Create trustlines with other accounts, not for the source account itself.',
  },
}

export const allowTrustResultCodes: { [key: string]: DiagnosticEntry } = {
  allow_trust_success: {
    issue: 'Trust operation was successful.',
    suggestion: 'No action needed.',
  },
  allow_trust_malformed: {
    issue:
      'The asset specified in type is invalid. In addition, this error happens when the native asset is specified.',
    suggestion: 'Check the asset type and ensure it is valid. Avoid specifying the native asset.',
  },
  allow_trust_no_trustline: {
    issue: 'The trustor does not have a trustline with the issuer performing this operation.',
    suggestion: 'Verify that the trustor has an active trustline with the issuer.',
  },
  allow_trust_trust_not_required: {
    issue:
      'The source account (issuer performing this operation) does not require trust. In other words, it does not have to have the flag AUTH_REQUIRED_FLAG set.',
    suggestion: 'Check the source account settings and requirements for trust.',
  },
  allow_trust_cant_revoke: {
    issue: 'The source account is trying to revoke the trustline of the trustor, but it cannot do so.',
    suggestion: 'Ensure that the source account has the necessary permissions to revoke trust.',
  },
  allow_trust_self_not_allowed: {
    issue:
      'The source account attempted to allow a trustline for itself, which is not allowed because an account cannot create a trustline with itself.',
    suggestion: 'Create trustlines with other accounts, not with the source account itself.',
  },
  allow_trust_low_reserve: {
    issue: "Claimable balances can't be created on revoke due to low reserves.",
    suggestion: 'Ensure that the account has enough reserves to perform the operation.',
  },
}

export const accountMergeResultCodes: { [key: string]: DiagnosticEntry } = {
  account_merge_success: {
    issue: 'Account successfully merged.',
    suggestion: 'No action needed.',
  },
  account_merge_malformed: {
    issue:
      'The operation is malformed because the source account cannot merge with itself. The destination must be a different account.',
    suggestion: 'Specify a different destination account for the merge operation.',
  },
  account_merge_no_account: {
    issue: 'The destination account does not exist.',
    suggestion: 'Verify the destination account exists and is correct.',
  },
  account_merge_immutable_set: {
    issue: 'The source account has AUTH_IMMUTABLE flag set.',
    suggestion: 'Remove the AUTH_IMMUTABLE flag from the source account if you intend to perform a merge.',
  },
  account_merge_has_sub_entries: {
    issue: 'The source account has trustlines and/or offers.',
    suggestion: 'Close any trustlines or offers associated with the source account before merging.',
  },
  account_merge_seqnum_too_far: {
    issue: 'Source account sequence number is too high.',
    suggestion: "Ensure that the source account's sequence number is valid for merging.",
  },
  account_merge_dest_full: {
    issue:
      'The destination account cannot receive the balance of the source account and still satisfy its lumen buying liabilities.',
    suggestion: "Check the destination account's capacity and liabilities before merging.",
  },
}

export const manageDataResultCodes: { [key: string]: DiagnosticEntry } = {
  manage_data_success: {
    issue: 'Manage data operation has executed successfully.',
    suggestion: 'No action needed.',
  },
  manage_data_not_supported_yet: {
    issue:
      'The network has not moved to this protocol change yet. This failure means the network does not support this feature yet.',
    suggestion: 'Wait for the network to support this feature before attempting the operation.',
  },
  manage_data_name_not_found: {
    issue:
      'Trying to remove a Data Entry that is not there. This will happen if Name is set (and Value is not) but the Account does not have a Data Entry with that Name.',
    suggestion: 'Ensure that the Data Entry you are trying to remove exists on the account.',
  },
  manage_data_low_reserve: {
    issue:
      'This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new DataEntry added to an account, the minimum reserve of XLM that account must hold increases.',
    suggestion: "Check the account's XLM balance and reserve requirements before adding a new Data Entry.",
  },
  manage_data_invalid_name: {
    issue: 'Name not a valid string.',
    suggestion: 'Ensure that the Name is a valid string before performing the operation.',
  },
}

export const bumpSequenceResultCodes: { [key: string]: DiagnosticEntry } = {
  bump_sequence_success: {
    issue: 'Sequence number has been bumped.',
    suggestion: 'No action needed.',
  },
  bump_sequence_bad_seq: {
    issue:
      'The specified bumpTo sequence number is not a valid sequence number. It must be between 0 and INT64_MAX (9223372036854775807 or 0x7fffffffffffffff).',
    suggestion: 'Ensure the bumpTo sequence number is within the valid range.',
  },
}

export const operationSpecificErrorMessages: { [operation: string]: { [code: string]: DiagnosticEntry } } = {
  create_account: createAccountOperationErrorMessages,
  payment: paymentOperationErrorMessages,
  path_payment_strict_receive: pathPaymentStrictReceiveOperationErrorMessages,
  path_payment_strict_send: pathPaymentStrictSendOperationErrorMessages,
  manage_sell_offer: manageSellOfferOperationErrorMessages,
  manage_buy_offer: manageBuyOfferOperationErrorMessages,
  create_passive_sell_offer: createPassiveSellOfferResultCodes,
  set_options: setOptionsResultCodes,
  change_trust: changeTrustResultCodes,
  allow_trust: allowTrustResultCodes,
  account_merge: accountMergeResultCodes,
  manage_data: manageDataResultCodes,
  bump_sequence: bumpSequenceResultCodes,
}
