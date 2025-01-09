#![cfg(test)]

use super::*;
use contract::{SimpleDepositTokenContract, SimpleDepositTokenContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

soroban_sdk::contractimport!(
  file = "../../target/wasm32-unknown-unknown/release/soroban_token_contract.wasm"
);

fn create_token_contract<'a>(env: &'a Env, admin: &'a Address) -> token::Client<'a> {
  let asset_contract_registration = env.register_stellar_asset_contract_v2(admin.clone());

  return token::Client::new(env, &asset_contract_registration.address());
}

fn create_simple_deposit_token_contract<'a>(
  env: &Env,
) -> contract::SimpleDepositTokenContractClient<'a> {
  let contract_id = env.register(SimpleDepositTokenContract, ());
  let client = SimpleDepositTokenContractClient::new(&env, &contract_id);

  return client;
}

#[test]
fn test_initialize() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  let globals = simple_deposit_contract.get_contract_globals();

  assert!(globals.initialized);
  assert_eq!(globals.owner, admin);
  assert_eq!(globals.token, token.address);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_already_initialized() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);
  let token = create_token_contract(&env, &admin);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  simple_deposit_contract.initialize(&admin, &token.address);
}

#[test]
fn test_get_contract_globals() {
  let env = Env::default();

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  let contract_address = simple_deposit_contract.address.clone();

  let globals = simple_deposit_contract.get_contract_globals();

  assert!(!globals.initialized);
  assert_eq!(globals.owner, contract_address);
  assert_eq!(globals.token, contract_address);
}

#[test]
fn test_set_owner() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  let new_owner = Address::generate(&env);

  simple_deposit_contract.set_owner(&admin, &new_owner);

  let globals = simple_deposit_contract.get_contract_globals();

  assert!(globals.initialized);
  assert_eq!(globals.owner, new_owner);
  assert_eq!(globals.token, token.address);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_set_owner_not_owner() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  let new_owner = Address::generate(&env);

  simple_deposit_contract.set_owner(&new_owner, &new_owner);
}

#[test]
fn test_deposit() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  let globals = simple_deposit_contract.get_contract_globals();

  assert!(globals.initialized);
  assert_eq!(globals.owner, admin);
  assert_eq!(globals.token, token.address);

  simple_deposit_contract.deposit(&admin, &100, &token.address);

  let user_info = simple_deposit_contract.get_user_info(&admin);

  assert_eq!(user_info.balance, 100);
  assert_eq!(user_info.address, admin);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_deposit_mismatch_token() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.initialize(&admin, &token.address);

  let globals = simple_deposit_contract.get_contract_globals();

  let token2 = create_token_contract(&env, &admin);

  assert!(globals.initialized);
  assert_eq!(globals.owner, admin);
  assert_eq!(globals.token, token.address);

  simple_deposit_contract.deposit(&admin, &100, &token2.address);

  let user_info = simple_deposit_contract.get_user_info(&admin);

  assert_eq!(user_info.balance, 100);
  assert_eq!(user_info.address, admin);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_deposit_with_contract_not_initialized() {
  let env = Env::default();
  env.mock_all_auths();

  let admin = Address::generate(&env);

  let token = create_token_contract(&env, &admin);

  token.mint(&admin, &2000);

  let simple_deposit_contract = create_simple_deposit_token_contract(&env);

  simple_deposit_contract.deposit(&admin, &100, &token.address);
}
